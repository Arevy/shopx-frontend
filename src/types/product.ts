export interface Category {
  id: string
  name: string
  description?: string | null
}

export interface Product {
  id: string
  name: string
  price: number
  description?: string | null
  categoryId?: string | null
  category?: Category | null
}

export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  reviewText?: string | null
  createdAt: string
}
