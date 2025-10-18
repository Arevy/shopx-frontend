import type { Order, OrderProductSummary } from '@/types/order'

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const normalizeOrderProduct = (product: Partial<OrderProductSummary>): OrderProductSummary => ({
  productId: String(product.productId ?? ''),
  quantity: toNumber(product.quantity, 0),
  price: toNumber(product.price, 0),
})

export const normalizeOrder = (order: Partial<Order>): Order => ({
  id: String(order.id ?? ''),
  userId: String(order.userId ?? ''),
  total: toNumber(order.total, 0),
  status: String(order.status ?? ''),
  createdAt: order.createdAt !== undefined && order.createdAt !== null ? String(order.createdAt) : undefined,
  updatedAt: order.updatedAt !== undefined && order.updatedAt !== null ? String(order.updatedAt) : undefined,
  products: (order.products ?? []).map(normalizeOrderProduct),
})

export const normalizeOrders = (orders: Array<Partial<Order>> | undefined): Order[] =>
  (orders ?? []).map((order) => normalizeOrder(order))
