'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { observer } from 'mobx-react-lite'
import { Button, FormField, Input, Surface } from '@components/ui'
import { useStores } from '@stores/StoreProvider'

export const RegisterPage = observer(() => {
  const { userStore } = useStores()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (userStore.isAuthenticated) {
      router.replace('/')
    }
  }, [userStore.isAuthenticated, router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await userStore.register(email, password, name)
    if (userStore.isAuthenticated) {
      router.push('/checkout')
    }
  }

  return (
    <Surface
      as="form"
      onSubmit={handleSubmit}
      style={{ maxWidth: '480px', margin: '0 auto', padding: '2.85rem', display: 'grid', gap: '1.4rem' }}
    >
      <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>Create account</h1>
      <p className="section-subtitle" style={{ marginBottom: '1rem' }}>
        Sign up to store addresses, your wishlist, and order history in one place.
      </p>
      <FormField label="Full name" htmlFor="register-name">
        <Input
          id="register-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
        />
      </FormField>
      <FormField label="Email" htmlFor="register-email">
        <Input
          id="register-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
      </FormField>
      <FormField label="Password" htmlFor="register-password">
        <Input
          id="register-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </FormField>

      {userStore.error && (
        <span style={{ color: 'var(--color-danger)' }}>{userStore.error}</span>
      )}

      <Button type="submit" loading={userStore.loading}>
        {userStore.loading ? 'Creating account...' : 'Create account'}
      </Button>

      <span style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
        Already have an account? <Link href="/auth/login">Sign in →</Link>
      </span>
    </Surface>
  )
})
