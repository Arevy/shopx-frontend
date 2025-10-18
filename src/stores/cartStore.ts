import { makeAutoObservable, runInAction } from 'mobx'
import { GET_CART } from '@graphql/cart/GetCart'
import { ADD_TO_CART } from '@graphql/cart/AddToCart'
import { REMOVE_FROM_CART } from '@graphql/cart/RemoveFromCart'
import { CLEAR_CART } from '@graphql/cart/ClearCart'
import { CREATE_ORDER } from '@graphql/checkout/CreateOrder'
import { CREATE_PAYMENT } from '@graphql/checkout/CreatePayment'
import { normalizeCart, normalizeOrder, GraphQLOrder } from '@graphql/cart/normalizers'
import { getUserFriendlyMessage } from '@lib/getUserFriendlyMessage'
import type { Cart, CartItem } from '@/types/cart'
import type { Order } from '@/types/order'
import type { Product } from '@/types/product'
import { isSessionExpiredError } from '@lib/authEvents'
import type { RootStore } from './rootStore'

const LOCAL_CART_KEY = 'shopx:cart'

interface PlaceOrderParams {
  cartItems: CartItem[]
  total: number
  paymentMethod: string
  missingProductMessage?: string
}

export class CartStore {
  private readonly root: RootStore
  cart: Cart | null = null
  localItems: CartItem[] = []
  loading = false
  error: string | null = null
  checkoutSubmitting = false

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable<CartStore, 'root'>(this, { root: false }, { autoBind: true })
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

  hydrateFromStorage() {
    if (typeof window === 'undefined') return
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

  private requireUserId(): number | null {
    const user = this.root.userStore.user
    if (!user) {
      this.root.uiStore.addToast('Please sign in to continue.', 'info')
      return null
    }

    const parsed = Number(user.id)
    if (!Number.isFinite(parsed)) {
      console.error('Invalid user id for cart operation', { id: user.id })
      this.root.uiStore.addToast('We could not verify your session. Please sign in again.', 'error')
      return null
    }

    return parsed
  }

  async migrateGuestCart() {
    if (!this.root.userStore.isAuthenticated || !this.localItems.length) {
      return
    }

    const userId = this.requireUserId()
    if (!userId) return

    const guestItems = [...this.localItems]
    this.localItems = []
    this.persistLocalCart()

    try {
      for (const item of guestItems) {
        const productIdValue = Number(item.product.id)
        if (!Number.isFinite(productIdValue)) {
          console.error('Invalid product id for cart migration', { id: item.product.id })
          continue
        }

        await this.root.apiService.execute<{ addToCart: Cart }>(ADD_TO_CART, {
          userId,
          productId: productIdValue,
          quantity: item.quantity,
        })
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
    const userId = this.requireUserId()
    if (!userId) {
      this.loading = false
      return
    }
    try {
      const { getCart } = await this.root.apiService.execute<{ getCart: Cart }>(GET_CART, {
        userId,
      })
      runInAction(() => {
        this.setRemoteCart(getCart)
      })
    } catch (err) {
      if (isSessionExpiredError(err)) {
        return
      }

      console.error('Failed to load cart', err)
      const message = getUserFriendlyMessage(
        err,
        'We couldn’t load the cart. Please try again.',
      )
      this.error = message
      this.root.uiStore.addToast(message, 'error')
    } finally {
      this.loading = false
    }
  }

  setRemoteCart(cart: Cart) {
    this.cart = normalizeCart(cart)
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
      const productIdValue = Number(product.id)
      if (!Number.isFinite(productIdValue)) {
        console.error('Invalid product id for cart add', { id: product.id })
        return
      }
      const { addToCart } = await this.root.apiService.execute<{ addToCart: Cart }>(ADD_TO_CART, {
        userId,
        productId: productIdValue,
        quantity,
      })
      runInAction(() => {
        this.cart = normalizeCart(addToCart)
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
      const productIdValue = Number(productId)
      if (!Number.isFinite(productIdValue)) {
        console.error('Invalid product id for cart removal', { productId })
        return
      }
      const { removeFromCart } = await this.root.apiService.execute<{
        removeFromCart: Cart
      }>(
        REMOVE_FROM_CART,
        {
          userId,
          productId: productIdValue,
        },
      )
      runInAction(() => {
        this.cart = normalizeCart(removeFromCart)
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
      await this.root.apiService.execute<{ clearCart: boolean }>(CLEAR_CART, { userId })
      this.cart = { userId: String(userId), items: [], total: 0 }
    } catch (err) {
      console.error('Failed to clear cart', err)
      this.root.uiStore.addToast(
        'We couldn’t clear the cart. Please try again.',
        'error',
      )
    }
  }

  async placeOrder(params: PlaceOrderParams): Promise<Order> {
    if (!this.root.userStore.isAuthenticated) {
      throw new Error('Authentication required.')
    }

    const userId = this.requireUserId()
    if (!userId) {
      throw new Error('Authentication required.')
    }

    const { cartItems, total, paymentMethod, missingProductMessage } = params
    if (!cartItems.length) {
      throw new Error('Cart is empty.')
    }

    this.checkoutSubmitting = true
    this.error = null

    try {
      const orderProducts = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }))

      if (orderProducts.some((product) => !product.productId)) {
        throw new Error(missingProductMessage ?? 'One of the selected products is invalid.')
      }

      const { createOrder } = await this.root.apiService.execute<{ createOrder: GraphQLOrder }>(
        CREATE_ORDER,
        {
          userId,
          products: orderProducts,
        },
      )

      await this.root.apiService.execute(CREATE_PAYMENT, {
        orderId: createOrder.id,
        amount: total,
        method: paymentMethod,
      })

      const normalizedOrder = normalizeOrder(createOrder)

      await this.clearCart()

      return normalizedOrder
    } catch (error) {
      const message = getUserFriendlyMessage(
        error,
        'We could not complete your checkout. Please try again.',
      )
      this.error = message
      throw new Error(message)
    } finally {
      this.checkoutSubmitting = false
    }
  }

  reset() {
    this.cart = null
    this.localItems = []
    this.error = null
    this.persistLocalCart()
  }
}
