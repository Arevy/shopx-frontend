import { makeAutoObservable, runInAction } from 'mobx'
import {
  ADD_TO_CART,
  CLEAR_CART,
  GET_CART,
  REMOVE_FROM_CART,
} from '@graphql/operations'
import { requestGraphQL } from '@lib/graphqlClient'
import type { Cart, CartItem } from '@/types/cart'
import type { Product } from '@/types/product'
import type { RootStore } from './rootStore'

const LOCAL_CART_KEY = 'shopx:cart'

export class CartStore {
  private readonly root: RootStore
  cart: Cart | null = null
  localItems: CartItem[] = []
  loading = false
  error: string | null = null

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable<CartStore, 'root'>(this, { root: false }, { autoBind: true })
    if (typeof window !== 'undefined') {
      this.hydrateLocalCart()
    }
  }

  get hasItems() {
    return this.items.length > 0
  }

  get items(): CartItem[] {
    if (this.root.userStore.isAuthenticated) {
      return this.cart?.items ?? []
    }
    return this.localItems
  }

  get totalAmount() {
    return this.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    )
  }

  private hydrateLocalCart() {
    try {
      const persisted = window.localStorage.getItem(LOCAL_CART_KEY)
      if (!persisted) return
      this.localItems = JSON.parse(persisted)
    } catch (err) {
      console.error('Failed to hydrate local cart', err)
      window.localStorage.removeItem(LOCAL_CART_KEY)
    }
  }

  private persistLocalCart() {
    if (typeof window === 'undefined') return
    if (!this.localItems.length) {
      window.localStorage.removeItem(LOCAL_CART_KEY)
      return
    }
    window.localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(this.localItems))
  }

  private requireUserId(): string | null {
    const user = this.root.userStore.user
    if (!user) {
      this.root.uiStore.addToast('Please sign in to continue.', 'info')
      return null
    }
    return user.id
  }

  async migrateGuestCart() {
    if (!this.root.userStore.isAuthenticated || !this.localItems.length) {
      return
    }

    const userId = this.root.userStore.user?.id
    const token = this.root.userStore.token ?? undefined
    if (!userId) return

    const guestItems = [...this.localItems]
    this.localItems = []
    this.persistLocalCart()

    try {
      for (const item of guestItems) {
        await requestGraphQL<{ addToCart: Cart }>(
          ADD_TO_CART,
          {
            userId,
            productId: item.product.id,
            quantity: item.quantity,
          },
          token,
        )
      }
      await this.syncFromServer()
    } catch (err) {
      console.error('Failed to migrate guest cart', err)
      this.root.uiStore.addToast(
        'We couldn’t sync the cart items after signing in.',
        'error',
      )
    }
  }

  async syncFromServer() {
    if (!this.root.userStore.isAuthenticated) {
      this.cart = null
      return
    }

    this.loading = true
    this.error = null
    const userId = this.root.userStore.user!.id
    const token = this.root.userStore.token ?? undefined

    try {
      const { getCart } = await requestGraphQL<{ getCart: Cart }>(
        GET_CART,
        { userId },
        token,
      )
      runInAction(() => {
        this.cart = getCart
      })
    } catch (err) {
      console.error('Failed to load cart', err)
      this.error = err instanceof Error ? err.message : 'Cart fetch failed'
      this.root.uiStore.addToast(
        'We couldn’t load the cart. Please try again.',
        'error',
      )
    } finally {
      this.loading = false
    }
  }

  async addItem(product: Product, quantity = 1) {
    if (quantity <= 0) return

    if (!this.root.userStore.isAuthenticated) {
      const existing = this.localItems.find((item) => item.product.id === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        this.localItems.push({ product, quantity })
      }
      this.persistLocalCart()
      this.root.uiStore.addToast('Product added to cart.', 'success')
      return
    }

    const userId = this.requireUserId()
    if (!userId) return

    try {
      const token = this.root.userStore.token ?? undefined
      const { addToCart } = await requestGraphQL<{ addToCart: Cart }>(
        ADD_TO_CART,
        {
          userId,
          productId: product.id,
          quantity,
        },
        token,
      )
      runInAction(() => {
        this.cart = addToCart
      })
      this.root.uiStore.addToast('Product added to cart.', 'success')
    } catch (err) {
      console.error('Failed to add to cart', err)
      this.root.uiStore.addToast(
        'We couldn’t add the product. Please try again.',
        'error',
      )
    }
  }

  async setQuantity(productId: string, quantity: number) {
    if (!this.root.userStore.isAuthenticated) {
      if (quantity <= 0) {
        this.localItems = this.localItems.filter(
          (item) => item.product.id !== productId,
        )
      } else {
        const target = this.localItems.find(
          (item) => item.product.id === productId,
        )
        if (target) {
          target.quantity = quantity
        }
      }
      this.persistLocalCart()
      return
    }

    const currentItem = this.cart?.items.find(
      (item) => item.product.id === productId,
    )
    if (!currentItem) return

    const delta = quantity - currentItem.quantity
    if (delta === 0) return

    if (quantity <= 0) {
      await this.removeItem(productId)
      return
    }

    if (delta > 0) {
      await this.addItem(currentItem.product, delta)
    } else {
      // easiest way is to remove and re-add with new quantity
      await this.removeItem(productId)
      await this.addItem(currentItem.product, quantity)
    }
  }

  async removeItem(productId: string) {
    if (!this.root.userStore.isAuthenticated) {
      this.localItems = this.localItems.filter(
        (item) => item.product.id !== productId,
      )
      this.persistLocalCart()
      return
    }

    const userId = this.requireUserId()
    if (!userId) return

    try {
      const token = this.root.userStore.token ?? undefined
      const { removeFromCart } = await requestGraphQL<{
        removeFromCart: Cart
      }>(
        REMOVE_FROM_CART,
        {
          userId,
          productId,
        },
        token,
      )
      runInAction(() => {
        this.cart = removeFromCart
      })
    } catch (err) {
      console.error('Failed to remove from cart', err)
      this.root.uiStore.addToast(
        'We couldn’t remove the product from the cart.',
        'error',
      )
    }
  }

  async clearCart() {
    if (!this.root.userStore.isAuthenticated) {
      this.localItems = []
      this.persistLocalCart()
      return
    }

    const userId = this.requireUserId()
    if (!userId) return

    try {
      const token = this.root.userStore.token ?? undefined
      await requestGraphQL<{ clearCart: boolean }>(
        CLEAR_CART,
        { userId },
        token,
      )
      this.cart = { userId, items: [], total: 0 }
    } catch (err) {
      console.error('Failed to clear cart', err)
      this.root.uiStore.addToast(
        'We couldn’t clear the cart. Please try again.',
        'error',
      )
    }
  }

  reset() {
    this.cart = null
    this.localItems = []
    this.error = null
    this.persistLocalCart()
  }
}
