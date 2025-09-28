export interface OrderProductInput {
  productId: string
  quantity: number
  price: number
}

export interface OrderProductSummary {
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
  products: OrderProductSummary[]
}
