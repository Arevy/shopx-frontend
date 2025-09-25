import { makeAutoObservable, runInAction } from 'mobx'
import {
  ADD_TO_WISHLIST,
  GET_WISHLIST,
  REMOVE_FROM_WISHLIST,
} from '@graphql/operations'
import { requestGraphQL } from '@lib/graphqlClient'
import type { Product } from '@/types/product'
import type { RootStore } from './rootStore'

const LOCAL_WISHLIST_KEY = 'shopx:wishlist'

export class WishlistStore {
  private readonly root: RootStore
  products: Product[] = []
  localProducts: Product[] = []
  loading = false

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable<WishlistStore, 'root'>(this, { root: false }, { autoBind: true })

    if (typeof window !== 'undefined') {
      this.hydrateLocalWishlist()
    }
  }

  get items(): Product[] {
    return this.root.userStore.isAuthenticated ? this.products : this.localProducts
  }

  private hydrateLocalWishlist() {
    try {
      const persisted = window.localStorage.getItem(LOCAL_WISHLIST_KEY)
      if (!persisted) return
      this.localProducts = JSON.parse(persisted)
    } catch (err) {
      console.error('Failed to hydrate wishlist', err)
      window.localStorage.removeItem(LOCAL_WISHLIST_KEY)
    }
  }

  private persistLocalWishlist() {
    if (typeof window === 'undefined') return
    if (!this.localProducts.length) {
      window.localStorage.removeItem(LOCAL_WISHLIST_KEY)
      return
    }
    window.localStorage.setItem(
      LOCAL_WISHLIST_KEY,
      JSON.stringify(this.localProducts),
    )
  }

  async syncFromServer() {
    if (!this.root.userStore.isAuthenticated) {
      this.products = []
      return
    }

    const user = this.root.userStore.user
    if (!user) return

    this.loading = true
    try {
      const token = this.root.userStore.token ?? undefined
      const { getWishlist } = await requestGraphQL<{
        getWishlist: { products: Product[] }
      }>(GET_WISHLIST, { userId: user.id }, token)
      runInAction(() => {
        this.products = getWishlist.products
      })
    } catch (err) {
      console.error('Failed to load wishlist', err)
      this.root.uiStore.addToast(
        "We couldn't load your wishlist.",
        'error',
      )
    } finally {
      this.loading = false
    }
  }

  async migrateGuestWishlist() {
    if (!this.root.userStore.isAuthenticated || !this.localProducts.length) {
      return
    }

    const userId = this.root.userStore.user?.id
    const token = this.root.userStore.token ?? undefined
    if (!userId) return

    const guestItems = [...this.localProducts]
    this.localProducts = []
    this.persistLocalWishlist()

    try {
      for (const product of guestItems) {
        await requestGraphQL<{ addToWishlist: { products: Product[] } }>(
          ADD_TO_WISHLIST,
          {
            userId,
            productId: product.id,
          },
          token,
        )
      }
      await this.syncFromServer()
    } catch (err) {
      console.error('Failed to migrate wishlist', err)
      this.root.uiStore.addToast(
        "We couldn't sync the wishlist.",
        'error',
      )
    }
  }

  private async addRemote(productId: string) {
    const user = this.root.userStore.user
    if (!user) return

    const token = this.root.userStore.token ?? undefined

    const { addToWishlist } = await requestGraphQL<{
      addToWishlist: { products: Product[] }
    }>(ADD_TO_WISHLIST, { userId: user.id, productId }, token)
    this.products = addToWishlist.products
  }

  private async removeRemote(productId: string) {
    const user = this.root.userStore.user
    if (!user) return
    const token = this.root.userStore.token ?? undefined
    const { removeFromWishlist } = await requestGraphQL<{
      removeFromWishlist: { products: Product[] }
    }>(REMOVE_FROM_WISHLIST, { userId: user.id, productId }, token)
    this.products = removeFromWishlist.products
  }

  async toggle(product: Product) {
    const inWishlist = this.items.some((item) => item.id === product.id)
    if (inWishlist) {
      await this.remove(product)
    } else {
      await this.add(product)
    }
  }

  async add(product: Product) {
    if (this.root.userStore.isAuthenticated) {
      try {
        await this.addRemote(product.id)
        this.root.uiStore.addToast('Product saved to wishlist.', 'success')
      } catch (err) {
        console.error('Failed to add to wishlist', err)
        this.root.uiStore.addToast(
          "We couldn't add the product to the wishlist.",
          'error',
        )
      }
      return
    }

    if (!this.localProducts.find((item) => item.id === product.id)) {
      this.localProducts.push(product)
      this.persistLocalWishlist()
      this.root.uiStore.addToast('Product saved to wishlist.', 'success')
    }
  }

  async remove(product: Product | string) {
    const productId = typeof product === 'string' ? product : product.id

    if (this.root.userStore.isAuthenticated) {
      try {
        await this.removeRemote(productId)
        this.root.uiStore.addToast('Product removed from wishlist.', 'info')
      } catch (err) {
        console.error('Failed to remove from wishlist', err)
        this.root.uiStore.addToast(
          "We couldn't remove the product from the wishlist.",
          'error',
        )
      }
      return
    }

    this.localProducts = this.localProducts.filter((item) => item.id !== productId)
    this.persistLocalWishlist()
  }

  reset() {
    this.products = []
    this.localProducts = []
    this.persistLocalWishlist()
  }
}
