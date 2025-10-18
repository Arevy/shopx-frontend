import type { Address } from '@/types/address'
import type { Cart } from '@/types/cart'
import type { User } from '@/types/user'
import type { UserContext, WishlistPayload } from '@/types/userContext'
import { normalizeCart } from '@graphql/cart/normalizers'

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const normalizeAddress = (address: Partial<Address>): Address => ({
  id: String(address.id ?? ''),
  userId: String(address.userId ?? ''),
  street: String(address.street ?? ''),
  city: String(address.city ?? ''),
  postalCode: String(address.postalCode ?? ''),
  country: String(address.country ?? ''),
})

export const normalizeAddresses = (addresses: Array<Partial<Address>> | undefined): Address[] =>
  (addresses ?? []).map((address) => normalizeAddress(address))

const normalizeWishlist = (
  wishlist: Partial<WishlistPayload> | null | undefined,
): WishlistPayload | null => {
  if (!wishlist) {
    return null
  }

  return {
    userId: String(wishlist.userId ?? ''),
    products: (wishlist.products ?? []).map((product) => ({
      id: String(product.id ?? ''),
      name: String(product.name ?? ''),
      price: toNumber(product.price, 0),
      description: product.description ?? null,
      categoryId:
        product.categoryId !== undefined && product.categoryId !== null
          ? String(product.categoryId)
          : null,
      image: product.image ?? null,
    })),
  }
}

export const normalizeUser = (user: Partial<User> | null | undefined): User | null => {
  if (!user) {
    return null
  }

  return {
    id: String(user.id ?? ''),
    email: String(user.email ?? ''),
    name: user.name ?? null,
    role: user.role ?? 'CUSTOMER',
  }
}

export const normalizeUserContext = (
  context: Partial<UserContext> | null | undefined,
): UserContext | null => {
  if (!context) {
    return null
  }

  const user = normalizeUser(context.user)
  if (!user) {
    return null
  }

  const cart = context.cart ? normalizeCart(context.cart as Cart) : { userId: '', items: [], total: 0 }
  const wishlist = normalizeWishlist(context.wishlist)
  const addresses = normalizeAddresses(context.addresses)

  return {
    user,
    cart,
    wishlist: wishlist ?? { userId: '', products: [] },
    addresses,
  }
}
