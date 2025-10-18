import type { Cart, CartItem } from '@/types/cart'
import type { Order, OrderProductSummary } from '@/types/order'
import type { Product } from '@/types/product'

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const normalizeProduct = (product: Partial<Product>): Product => ({
  id: String(product.id ?? ''),
  name: String(product.name ?? ''),
  price: toNumber(product.price),
  description: product.description ?? null,
  categoryId:
    product.categoryId !== undefined && product.categoryId !== null
      ? String(product.categoryId)
      : null,
  category: product.category ?? null,
  image: product.image ?? null,
})

const normalizeCartItem = (item: Partial<CartItem>): CartItem => ({
  quantity: toNumber(item.quantity, 0),
  product: normalizeProduct(item.product ?? {}),
})

export const normalizeCart = (cart: Partial<Cart> | null | undefined): Cart => ({
  userId: String(cart?.userId ?? ''),
  total: toNumber(cart?.total, 0),
  items: (cart?.items ?? []).map((item) => normalizeCartItem(item)),
})

type GraphQLOrderProduct = {
  productId?: unknown
  quantity?: unknown
  price?: unknown
}

export type GraphQLOrder = {
  id?: unknown
  userId?: unknown
  total?: unknown
  status?: unknown
  createdAt?: string | null
  updatedAt?: string | null
  products?: GraphQLOrderProduct[]
}

export const normalizeOrder = (order: GraphQLOrder): Order => ({
  id: String(order.id ?? ''),
  userId: String(order.userId ?? ''),
  total: toNumber(order.total, 0),
  status: String(order.status ?? ''),
  createdAt: order.createdAt ?? undefined,
  updatedAt: order.updatedAt ?? undefined,
  products: (order.products ?? []).map<OrderProductSummary>((product) => ({
    productId: String(product.productId ?? ''),
    quantity: toNumber(product.quantity, 0),
    price: toNumber(product.price, 0),
  })),
})
