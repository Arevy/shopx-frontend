import type { Product } from '@/types/product'

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const normalizeWishlistProducts = (products: Array<Partial<Product>> | undefined): Product[] =>
  (products ?? []).map((product) => ({
    id: String(product.id ?? ''),
    name: String(product.name ?? ''),
    price: toNumber(product.price, 0),
    description: product.description ?? null,
    categoryId:
      product.categoryId !== undefined && product.categoryId !== null
        ? String(product.categoryId)
        : null,
    image: product.image ?? null,
  }))
