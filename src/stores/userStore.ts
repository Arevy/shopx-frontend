import { makeAutoObservable, runInAction } from 'mobx'
import { getUserFriendlyMessage } from '@lib/getUserFriendlyMessage'
import { GET_ADDRESSES } from '@graphql/checkout/GetAddresses'
import { ADD_ADDRESS } from '@graphql/checkout/AddAddress'
import { GET_USER_CONTEXT } from '@graphql/user/GetUserContext'
import { LOGIN } from '@graphql/user/Login'
import { LOGOUT } from '@graphql/user/Logout'
import { REGISTER } from '@graphql/user/Register'
import { REDEEM_IMPERSONATION } from '@graphql/user/RedeemImpersonation'
import type { Address } from '@/types/address'
import type { Cart } from '@/types/cart'
import type { AuthPayload, User } from '@/types/user'
import type { UserContext } from '@/types/userContext'
import { isSessionExpiredError } from '@lib/authEvents'
import {
  normalizeAddress,
  normalizeAddresses,
  normalizeUser,
  normalizeUserContext,
} from '@graphql/user/normalizers'
import { UPDATE_USER_PROFILE } from '@graphql/user/UpdateProfile'
import { CHANGE_USER_PASSWORD } from '@graphql/user/ChangePassword'
import { GET_ORDERS } from '@graphql/orders/GetOrders'
import { normalizeOrders } from '@graphql/orders/normalizers'
import type { RootStore } from './rootStore'
import type { Order } from '@/types/order'

const STORAGE_KEY = 'shopx:auth'

interface StoredAuth {
  user: User
}

type AddressInput = {
  street: string
  city: string
  postalCode: string
  country: string
}

export class UserStore {
  private readonly root: RootStore
  user: User | null = null
  loading = false
  error: string | null = null
  addresses: Address[] = []
  addressesLoading = false
  addressesError: string | null = null
  savingAddress = false
  orders: Order[] = []
  ordersLoading = false
  ordersError: string | null = null
  profileSaving = false
  profileError: string | null = null
  passwordChanging = false
  passwordError: string | null = null

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable<UserStore, 'root'>(this, { root: false }, { autoBind: true })
  }

  private get numericUserId(): number | null {
    if (!this.user) {
      return null
    }

    const parsed = Number(this.user.id)
    return Number.isFinite(parsed) ? parsed : null
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

  resetAddresses() {
    this.addresses = []
    this.addressesLoading = false
    this.addressesError = null
    this.savingAddress = false
  }

  resetOrders() {
    this.orders = []
    this.ordersLoading = false
    this.ordersError = null
  }

  async loadAddresses(): Promise<Address[]> {
    const userId = this.numericUserId
    if (!userId) {
      this.resetAddresses()
      return []
    }

    this.addressesLoading = true
    this.addressesError = null

    try {
      const { getAddresses } = await this.root.apiService.execute<{
        getAddresses: Array<Partial<Address>>
      }>(GET_ADDRESSES, { userId }, { skipCache: true })

      const normalized = normalizeAddresses(getAddresses)
      runInAction(() => {
        this.addresses = normalized
      })
      return normalized
    } catch (error) {
      const message = getUserFriendlyMessage(
        error,
        'Failed to load saved addresses. Please try again later.',
      )
      runInAction(() => {
        this.addressesError = message
      })
      throw new Error(message)
    } finally {
      runInAction(() => {
        this.addressesLoading = false
      })
    }
  }

  async createAddress(input: AddressInput): Promise<Address> {
    const userId = this.numericUserId
    if (!userId) {
      throw new Error('Authentication required')
    }

    this.savingAddress = true
    this.addressesError = null

    try {
      const { addAddress } = await this.root.apiService.execute<{
        addAddress: Partial<Address>
      }>(ADD_ADDRESS, {
        userId,
        ...input,
      })

      const normalized = normalizeAddress(addAddress)
      runInAction(() => {
        this.addresses = [normalized, ...this.addresses]
      })
      return normalized
    } catch (error) {
      const message = getUserFriendlyMessage(
        error,
        'Failed to save the address. Please verify the details and try again.',
      )
      runInAction(() => {
        this.addressesError = message
      })
      throw new Error(message)
    } finally {
      runInAction(() => {
        this.savingAddress = false
      })
    }
  }

  async loadOrders({ force = false }: { force?: boolean } = {}): Promise<Order[]> {
    const userId = this.numericUserId
    if (!userId) {
      this.resetOrders()
      return []
    }

    if (!force && this.orders.length) {
      return this.orders
    }

    this.ordersLoading = true
    this.ordersError = null

    try {
      const { getOrders } = await this.root.apiService.execute<{
        getOrders: Array<Partial<Order>>
      }>(
        GET_ORDERS,
        { userId },
        { skipCache: true },
      )

      const normalized = normalizeOrders(getOrders)
      runInAction(() => {
        this.orders = normalized
      })
      return normalized
    } catch (error) {
      const message = getUserFriendlyMessage(
        error,
        'We could not load your orders. Please try again later.',
      )
      runInAction(() => {
        this.ordersError = message
      })
      this.root.uiStore.addToast(message, 'error')
      return []
    } finally {
      runInAction(() => {
        this.ordersLoading = false
      })
    }
  }

  async updateProfile(
    input: {
      name?: string | null
      email?: string
      currentPassword?: string
    },
  ): Promise<User | null> {
    if (!this.isAuthenticated) {
      throw new Error('Authentication required')
    }

    const payload: {
      name?: string | null
      email?: string
    } = {}

    let trimmedPassword = ''

    if (Object.prototype.hasOwnProperty.call(input, 'name')) {
      payload.name = input.name ?? null
    }

    if (Object.prototype.hasOwnProperty.call(input, 'email')) {
      const email = input.email?.trim() ?? ''
      if (!email) {
        const message = 'Email address cannot be empty.'
        runInAction(() => {
          this.profileError = message
        })
        this.root.uiStore.addToast(message, 'error')
        return null
      }
      payload.email = email
    }

    if (!Object.keys(payload).length) {
      runInAction(() => {
        this.profileError = null
      })
      return this.user
    }

    if (Object.prototype.hasOwnProperty.call(input, 'currentPassword')) {
      trimmedPassword = input.currentPassword?.trim() ?? ''
    }

    if (!trimmedPassword) {
      const message = 'Please confirm the change with your password.'
      runInAction(() => {
        this.profileError = message
      })
      this.root.uiStore.addToast(message, 'error')
      return null
    }

    this.profileSaving = true
    this.profileError = null

    try {
      const { updateUserProfile } = await this.root.apiService.execute<{
        updateUserProfile: { user: User; message: string }
      }>(
        UPDATE_USER_PROFILE,
        { input: { ...payload, currentPassword: trimmedPassword } },
        { skipCache: true },
      )

      const normalized = normalizeUser(updateUserProfile.user)
      if (normalized) {
        runInAction(() => {
          this.profileError = null
        })
        this.adoptUserSession(normalized)
        this.root.uiStore.addToast(
          updateUserProfile.message || 'Profile updated successfully.',
          'success',
        )
        return normalized
      }

      return this.user
    } catch (error) {
      const message = getUserFriendlyMessage(
        error,
        'We could not update your profile. Please try again later.',
        {
          knownMessages: [
            {
              match: /email already registered/i,
              value: 'Another account is already using this email address.',
            },
            {
              match: /email address is required/i,
              value: 'Email address cannot be empty.',
            },
            {
              match: /password confirmation is required/i,
              value: 'Please enter your password to confirm these changes.',
            },
            {
              match: /current password is incorrect/i,
              value: 'The password you entered is incorrect.',
            },
          ],
        },
      )
      runInAction(() => {
        this.profileError = message
      })
      this.root.uiStore.addToast(message, 'error')
      return null
    } finally {
      runInAction(() => {
        this.profileSaving = false
      })
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    if (!this.isAuthenticated) {
      throw new Error('Authentication required')
    }

    this.passwordChanging = true
    this.passwordError = null

    try {
      await this.root.apiService.execute<{ changeUserPassword: boolean }>(
        CHANGE_USER_PASSWORD,
        { currentPassword, newPassword },
        { skipCache: true },
      )
      this.root.uiStore.addToast('Password updated successfully.', 'success')
      return true
    } catch (error) {
      const message = getUserFriendlyMessage(
        error,
        'We could not change your password. Please try again later.',
        {
          knownMessages: [
            {
              match: /incorrect/i,
              value: 'The current password you entered is incorrect.',
            },
            {
              match: /at least 8/i,
              value: 'Password should be at least 8 characters long.',
            },
          ],
        },
      )
      runInAction(() => {
        this.passwordError = message
      })
      this.root.uiStore.addToast(message, 'error')
      return false
    } finally {
      runInAction(() => {
        this.passwordChanging = false
      })
    }
  }

  adoptUserSession(user: User) {
    this.user = {
      ...user,
      id: String(user.id),
    }
    this.persist()
  }

  async redeemImpersonation(token: string): Promise<User> {
    const { redeemImpersonation } = await this.root.apiService.execute<{ redeemImpersonation: User }>(
      REDEEM_IMPERSONATION,
      { token },
    )

    this.adoptUserSession(redeemImpersonation)
    this.root.cartStore.reset()
    this.root.wishlistStore.reset()
    this.resetAddresses()

    return this.user as User
  }

  async login(email: string, password: string) {
    this.loading = true
    this.error = null
    try {
      const { login } = await this.root.apiService.execute<{ login: AuthPayload }>(
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
      const message = getUserFriendlyMessage(err, "We couldn't sign you in. Please try again.", {
        knownMessages: [
          { match: /invalid credentials/i, value: 'Email or password are incorrect.' },
          { match: /user not found/i, value: 'Email or password are incorrect.' },
          {
            match: /account (?:locked|disabled)/i,
            value: 'This account is locked. Contact support to regain access.',
          },
        ],
      })
      this.error = message
      this.root.uiStore.addToast(message, 'error')
    } finally {
      this.loading = false
    }
  }

  async register(email: string, password: string, name?: string) {
    this.loading = true
    this.error = null

    try {
      await this.root.apiService.execute<{ register: User }>(REGISTER, {
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
      const message = getUserFriendlyMessage(
        err,
        "We couldn't create the account. Please try again.",
        {
          knownMessages: [
            {
              match: /already exists|duplicate/i,
              value: 'An account with this email already exists. Try signing in instead.',
            },
          ],
        },
      )
      this.error = message
      this.root.uiStore.addToast(message, 'error')
    } finally {
      this.loading = false
    }
  }

  async logout() {
    try {
      await this.root.apiService.execute<{ logout: boolean }>(LOGOUT)
    } catch (err) {
      console.error('Logout mutation failed', err)
    }

    this.user = null
    this.persist()
    this.root.cartStore.reset()
    this.root.wishlistStore.reset()
    this.resetAddresses()
    this.resetOrders()
    this.profileSaving = false
    this.profileError = null
    this.passwordChanging = false
    this.passwordError = null
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
    this.resetAddresses()
    this.resetOrders()
    this.profileSaving = false
    this.profileError = null
    this.passwordChanging = false
    this.passwordError = null
    this.root.uiStore.addToast('Your session expired. Please sign in again.', 'info')
  }

  async loadUserContext(): Promise<UserContext | null> {
    if (!this.user) {
      this.resetAddresses()
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
      const { getUserContext } = await this.root.apiService.execute<{
        getUserContext: Partial<UserContext> | null
      }>(GET_USER_CONTEXT, { userId: numericId }, { skipCache: true })

      const normalizedContext = normalizeUserContext(getUserContext)

      if (normalizedContext?.user) {
        this.adoptUserSession(normalizedContext.user)
      } else {
        this.user = null
        this.persist()
      }

      if (normalizedContext?.cart) {
        this.root.cartStore.setRemoteCart(normalizedContext.cart as Cart)
      } else {
        this.root.cartStore.reset()
      }

      this.root.wishlistStore.setRemoteProducts(normalizedContext?.wishlist.products ?? [])
      this.addresses = normalizeAddresses(normalizedContext?.addresses)
      this.addressesError = null

      return normalizedContext
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
