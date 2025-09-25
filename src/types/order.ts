import type { CartItem } from './cart'

export interface OrderProductInput {
  productId: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  userId: string
  total: number
  status: string
  createdAt?: string
  updatedAt?: string
  products: CartItem[]
}
