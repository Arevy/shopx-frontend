'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { observer } from 'mobx-react-lite'
import type { ReactNode } from 'react'
import { Button, Surface } from '@components/ui'
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
      style={{ maxWidth: '420px', margin: '0 auto', padding: '2.5rem', display: 'grid', gap: '1.2rem' }}
    >
      <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>Sign in</h1>
      <p className="section-subtitle" style={{ marginBottom: '1rem' }}>
        Sign in to sync your cart and wishlist across every device.
      </p>
      <Field label="Email">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(148,163,184,0.3)',
            background: 'rgba(148,163,184,0.08)',
          }}
        />
      </Field>
      <Field label="Password">
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(148,163,184,0.3)',
            background: 'rgba(148,163,184,0.08)',
          }}
        />
      </Field>

      {userStore.error && (
        <span style={{ color: 'var(--color-danger)' }}>{userStore.error}</span>
      )}

      <Button type="submit" loading={userStore.loading}>
        {userStore.loading ? 'Signing in...' : 'Sign in'}
      </Button>

      <span style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
        Don't have an account? <Link href="/auth/register">Create one now →</Link>
      </span>
    </Surface>
  )
})

type FieldProps = {
  label: string
  children: ReactNode
}

const Field = ({ label, children }: FieldProps) => (
  <label style={{ display: 'grid', gap: '0.4rem' }}>
    <span>{label}</span>
    {children}
  </label>
)
