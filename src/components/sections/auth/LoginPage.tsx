'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { observer } from 'mobx-react-lite'
import { Button, FormField, Input, Surface } from '@components/ui'
import { useStores } from '@stores/StoreProvider'

export const LoginPage = observer(() => {
  const { userStore } = useStores()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (userStore.isAuthenticated) {
      router.replace('/')
    }
  }, [userStore.isAuthenticated, router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await userStore.login(email, password)
    if (userStore.isAuthenticated) {
      router.push('/products')
    }
  }

  return (
    <Surface
      as="form"
      onSubmit={handleSubmit}
      style={{ maxWidth: '440px', margin: '0 auto', padding: '2.75rem', display: 'grid', gap: '1.4rem' }}
    >
      <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>Sign in</h1>
      <p className="section-subtitle" style={{ marginBottom: '1rem' }}>
        Sign in to sync your cart and wishlist across every device.
      </p>

      <FormField label="Email" htmlFor="login-email">
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
      </FormField>

      <FormField label="Password" htmlFor="login-password">
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
          autoComplete="current-password"
        />
      </FormField>

      {userStore.error && (
        <span style={{ color: 'var(--color-danger)' }}>{userStore.error}</span>
      )}

      <Button type="submit" loading={userStore.loading}>
        {userStore.loading ? 'Signing in...' : 'Sign in'}
      </Button>

      <span style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
        {"Don't have an account? "}
        <Link href="/auth/register">Create one now →</Link>
      </span>
    </Surface>
  )
})
