import type { Product } from './product'

export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  userId: string
  items: CartItem[]
  total: number
}
