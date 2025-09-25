import { CartStore } from './cartStore'
import { CmsStore } from './cmsStore'
import { ProductStore } from './productStore'
import { UiStore } from './uiStore'
import { UserStore } from './userStore'
import { WishlistStore } from './wishlistStore'

export class RootStore {
  readonly uiStore: UiStore
  readonly userStore: UserStore
  readonly productStore: ProductStore
  readonly cartStore: CartStore
  readonly wishlistStore: WishlistStore
  readonly cmsStore: CmsStore

  constructor() {
    this.uiStore = new UiStore()
    this.productStore = new ProductStore(this)
    this.cartStore = new CartStore(this)
    this.wishlistStore = new WishlistStore(this)
    this.userStore = new UserStore(this)
    this.cmsStore = new CmsStore(this)
  }
}

export const createRootStore = () => new RootStore()
