import { makeAutoObservable } from 'mobx'
import { requestGraphQL } from '@lib/graphqlClient'
import {
  GET_USER_CONTEXT,
  LOGIN,
  LOGOUT,
  REGISTER,
} from '@graphql/operations'
import type { AuthPayload, User } from '@/types/user'
import type { UserContext } from '@/types/userContext'
import { isSessionExpiredError } from '@lib/authEvents'
import type { RootStore } from './rootStore'

const STORAGE_KEY = 'shopx:auth'

interface StoredAuth {
  user: User
}

export class UserStore {
  private readonly root: RootStore
  user: User | null = null
  loading = false
  error: string | null = null

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable<UserStore, 'root'>(this, { root: false }, { autoBind: true })
  }

  get isAuthenticated() {
    return Boolean(this.user)
  }

  hydrateFromStorage() {
    if (typeof window === 'undefined') return
    try {
      const persisted = window.localStorage.getItem(STORAGE_KEY)
      if (!persisted) return

      const parsed: StoredAuth = JSON.parse(persisted)
      this.user = parsed.user
      if (this.user) {
        this.user.id = String(this.user.id)
      }
    } catch (err) {
      console.error('Failed to hydrate auth state', err)
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  private persist() {
    if (typeof window === 'undefined') return
    if (!this.user) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    const payload: StoredAuth = {
      user: this.user,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  adoptUserSession(user: User) {
    this.user = {
      ...user,
      id: String(user.id),
    }
    this.persist()
  }

  async login(email: string, password: string) {
    this.loading = true
    this.error = null
    try {
      const { login } = await requestGraphQL<{ login: AuthPayload }>(
        LOGIN,
        { email, password },
      )

      this.adoptUserSession(login.user)
      this.root.uiStore.addToast('Signed in successfully. Welcome back!', 'success')

      await Promise.all([
        this.root.cartStore.migrateGuestCart(),
        this.root.wishlistStore.migrateGuestWishlist(),
      ])

      await this.loadUserContext()
    } catch (err) {
      console.error('Login failed', err)
      this.error = err instanceof Error ? err.message : 'Login failed'
      this.root.uiStore.addToast(
        this.error ?? 'We couldn\'t sign you in.',
        'error',
      )
    } finally {
      this.loading = false
    }
  }

  async register(email: string, password: string, name?: string) {
    this.loading = true
    this.error = null

    try {
      await requestGraphQL<{ register: User }>(REGISTER, {
        email,
        password,
        name,
      })

      this.root.uiStore.addToast(
        'Account created successfully. You are now signed in.',
        'success',
      )

      await this.login(email, password)
    } catch (err) {
      console.error('Register failed', err)
      this.error = err instanceof Error ? err.message : 'Register failed'
      this.root.uiStore.addToast(
        this.error ?? 'We couldn\'t create the account.',
        'error',
      )
    } finally {
      this.loading = false
    }
  }

  async logout() {
    try {
      await requestGraphQL<{ logout: boolean }>(LOGOUT)
    } catch (err) {
      console.error('Logout mutation failed', err)
    }

    this.user = null
    this.persist()
    this.root.cartStore.reset()
    this.root.wishlistStore.reset()
    this.root.uiStore.addToast('You have been signed out. See you soon!', 'info')
  }

  handleSessionExpired() {
    if (!this.user) {
      return
    }

    this.user = null
    this.persist()
    this.error = null
    this.root.cartStore.reset()
    this.root.wishlistStore.reset()
    this.root.uiStore.addToast('Your session expired. Please sign in again.', 'info')
  }

  async loadUserContext(): Promise<UserContext | null> {
    if (!this.user) {
      return null
    }

    const numericId = Number(this.user.id)
    if (!Number.isFinite(numericId) || numericId <= 0) {
      console.error('Unable to load user context due to invalid id', {
        id: this.user.id,
      })
      return null
    }

    try {
      const { getUserContext } = await requestGraphQL<{ getUserContext: UserContext }>(
        GET_USER_CONTEXT,
        { userId: numericId },
      )

      if (getUserContext.user) {
        this.adoptUserSession(getUserContext.user)
      } else {
        this.user = null
        this.persist()
      }

      this.root.cartStore.setRemoteCart(getUserContext.cart)
      this.root.wishlistStore.setRemoteProducts(getUserContext.wishlist.products)

      return getUserContext
    } catch (err) {
      if (isSessionExpiredError(err)) {
        return null
      }

      console.error('Failed to load user context', err)
      this.root.uiStore.addToast(
        "We couldn't refresh your account data. Please try again shortly.",
        'error',
      )
      return null
    }
  }

  async bootstrapAuthenticatedUser() {
    if (!this.isAuthenticated) {
      return
    }
    await this.loadUserContext()
  }
}
