import type { Address } from './address'
import type { Cart } from './cart'
import type { Product } from './product'
import type { User } from './user'

export interface WishlistPayload {
  userId: string
  products: Product[]
}

export interface UserContext {
  user: User
  cart: Cart
  wishlist: WishlistPayload
  addresses: Address[]
}
