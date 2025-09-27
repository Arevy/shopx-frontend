'use client'

import classNames from 'classnames'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { requestGraphQL } from '@lib/graphqlClient'
import { getUserFriendlyMessage } from '@lib/getUserFriendlyMessage'
import { REDEEM_IMPERSONATION } from '@graphql/operations'
import { useStores } from '@stores/StoreProvider'
import type { User } from '@/types/user'
import { Button, Surface } from '@components/ui'
import styles from './page.module.scss'

const ImpersonateContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userStore, cartStore, wishlistStore, uiStore } = useStores()
  const [status, setStatus] = useState('Preparing impersonation session…')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setError('Missing impersonation token. Please retry from the admin portal.')
      setStatus('')
      return
    }

    let cancelled = false

    const impersonate = async () => {
      try {
        setStatus('Verifying token…')
        const { redeemImpersonation } = await requestGraphQL<{
          redeemImpersonation: User
        }>(REDEEM_IMPERSONATION, { token })

        if (cancelled) {
          return
        }

        userStore.adoptUserSession(redeemImpersonation)
        cartStore.reset()
        wishlistStore.reset()

        setStatus('Syncing customer context…')
        await Promise.all([
          userStore.loadUserContext(),
          cartStore.syncFromServer(),
          wishlistStore.syncFromServer(),
        ])

        if (cancelled) {
          return
        }

        uiStore.addToast('You are now impersonating the selected customer.', 'info')
        router.replace('/')
        router.refresh()
      } catch (err) {
        console.error('Failed to redeem impersonation token', err)
        if (cancelled) {
          return
        }
        const message = getUserFriendlyMessage(
          err,
          'Unable to impersonate the requested user. The link may have expired.',
        )
        setError(message)
        setStatus('')
      }
    }

    impersonate()

    return () => {
      cancelled = true
    }
  }, [searchParams, userStore, cartStore, wishlistStore, uiStore, router])

  return (
    <Surface as="section" className={styles.section}>
      <div className={styles.panel}>
        <h1 className="section-title">Switching session</h1>
        {error ? (
          <>
            <p className={classNames('section-subtitle', styles.error)}>
              {error}
            </p>
            <Button onClick={() => router.replace('/auth/login')}>Back to sign in</Button>
          </>
        ) : (
          <p className="section-subtitle">{status}</p>
        )}
      </div>
    </Surface>
  )
}

const ImpersonatePage = () => {
  return (
    <Suspense
      fallback={
        <Surface as="section" className={styles.section}>
          <div className={styles.panel}>
            <h1 className="section-title">Switching session</h1>
            <p className="section-subtitle">Preparing impersonation session…</p>
          </div>
        </Surface>
      }
    >
      <ImpersonateContent />
    </Suspense>
  )
}

export default ImpersonatePage
