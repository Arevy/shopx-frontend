'use client'

import { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Button, FormField, Input, SectionHeader, Select, Surface } from '@components/ui'
import { useStores } from '@stores/StoreProvider'
import { requestGraphQL } from '@lib/graphqlClient'
import {
  ADD_ADDRESS,
  CREATE_ORDER,
  CREATE_PAYMENT,
  GET_ADDRESSES,
} from '@graphql/operations'
import type { Address } from '@/types/address'
import type { Order } from '@/types/order'

const paymentMethods = [
  { id: 'card', label: 'Credit/debit card (Visa / Mastercard)' },
  { id: 'transfer', label: 'Bank transfer' },
  { id: 'cash', label: 'Cash on delivery' },
]

interface CheckoutFormState {
  street: string
  city: string
  postalCode: string
  country: string
}

const defaultForm: CheckoutFormState = {
  street: '',
  city: '',
  postalCode: '',
  country: 'Romania',
}

export const CheckoutPage = observer(() => {
  const { cartStore, userStore, uiStore } = useStores()
  const [form, setForm] = useState<CheckoutFormState>(defaultForm)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new')
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderCompleted, setOrderCompleted] = useState<Order | null>(null)

  const cartItems = cartStore.items
  const total = cartStore.totalAmount

  const isLoggedIn = userStore.isAuthenticated
  const userIdRaw = userStore.user?.id
  const userId = Number(userIdRaw)
  const token = userStore.token ?? undefined

  useEffect(() => {
    if (!isLoggedIn || !Number.isFinite(userId)) return

    let isMounted = true

    requestGraphQL<{ getAddresses: Address[] }>(GET_ADDRESSES, { userId }, token)
      .then(({ getAddresses }) => {
        if (!isMounted) return
        setAddresses(getAddresses)
        if (getAddresses.length) {
          setSelectedAddressId(getAddresses[0].id)
        }
      })
      .catch((err) => {
        console.error('Failed to load addresses', err)
      })

    return () => {
      isMounted = false
    }
  }, [isLoggedIn, userId, token])

  const selectedAddress = useMemo(() => {
    if (selectedAddressId === 'new') return null
    return addresses.find((address) => address.id === selectedAddressId) ?? null
  }, [addresses, selectedAddressId])

  const handleChange = (field: keyof CheckoutFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!Number.isFinite(userId)) return

    setLoading(true)
    setError(null)

    try {
      let addressId = selectedAddressId !== 'new' ? selectedAddressId : undefined

      if (!addressId) {
        const { addAddress } = await requestGraphQL<{ addAddress: Address }>(
          ADD_ADDRESS,
          {
            userId,
            ...form,
          },
          token,
        )
        addressId = addAddress.id
        setAddresses((prev) => [addAddress, ...prev])
        setSelectedAddressId(addAddress.id)
      }

      const orderProducts = cartItems.map((item) => ({
        productId: Number(item.product.id),
        quantity: item.quantity,
        price: item.product.price,
      }))

      if (orderProducts.some((product) => !Number.isFinite(product.productId))) {
        throw new Error('We could not process one of the products in your cart. Please refresh and try again.')
      }

      const { createOrder } = await requestGraphQL<{ createOrder: Order }>(
        CREATE_ORDER,
        {
          userId,
          products: orderProducts,
        },
        token,
      )

      await requestGraphQL(
        CREATE_PAYMENT,
        {
          orderId: createOrder.id,
          amount: total,
          method: paymentMethod,
        },
        token,
      )

      await cartStore.clearCart()

      setOrderCompleted(createOrder)
      uiStore.addToast('Order placed successfully!', 'success')
    } catch (err) {
      console.error('Checkout failed', err)
      const message = err instanceof Error ? err.message : 'Checkout failed'
      setError(message)
      uiStore.addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <Surface as="section" style={{ padding: '3rem', textAlign: 'center', display: 'grid', gap: '1.2rem' }}>
        <h1 className="section-title">You need an account to check out</h1>
        <p className="section-subtitle">
          Sign in or create an account in just a few seconds to complete your order.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button href={{ pathname: '/auth/login' }}>Sign in</Button>
          <Button href={{ pathname: '/auth/register' }} variant="outline">
            Create account
          </Button>
        </div>
      </Surface>
    )
  }

  if (!cartItems.length) {
    return (
      <Surface as="section" style={{ padding: '3rem', textAlign: 'center', display: 'grid', gap: '1.2rem' }}>
        <p>Your cart is empty. Add products to continue.</p>
        <Button href={{ pathname: '/products' }}>Back to catalog</Button>
      </Surface>
    )
  }

  if (orderCompleted) {
    return (
      <Surface as="section" style={{ padding: '3rem', display: 'grid', gap: '1.2rem', textAlign: 'center' }}>
        <h1 className="section-title">Order completed</h1>
        <p className="section-subtitle">
          {`Thank you! Your order number is #${orderCompleted.id}. We'll email the details and tracking link shortly.`}
        </p>
        <Button href={{ pathname: '/products' }}>Continue shopping</Button>
      </Surface>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
      <SectionHeader
        title="Checkout"
        description="Enter your shipping details and choose a payment method. Processing is secure and only takes a few seconds."
      />

      <div
        style={{
          display: 'grid',
          gap: '2rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        <Surface as="section" style={{ display: 'grid', gap: '1.2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Shipping address</h2>

          {addresses.length > 0 && (
            <FormField label="Saved address" htmlFor="saved-address">
              <Select
                id="saved-address"
                value={selectedAddressId}
                onChange={(event) => setSelectedAddressId(event.target.value)}
              >
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.street}, {address.city}
                  </option>
                ))}
                <option value="new">Add a new address</option>
              </Select>
            </FormField>
          )}

          {(selectedAddressId === 'new' || !addresses.length) && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <FormField label="Street" htmlFor="shipping-street">
                <Input
                  id="shipping-street"
                  value={form.street}
                  onChange={(event) => handleChange('street', event.target.value)}
                  required
                  autoComplete="address-line1"
                />
              </FormField>
              <FormField label="City" htmlFor="shipping-city">
                <Input
                  id="shipping-city"
                  value={form.city}
                  onChange={(event) => handleChange('city', event.target.value)}
                  required
                  autoComplete="address-level2"
                />
              </FormField>
              <FormField label="Postal code" htmlFor="shipping-postal">
                <Input
                  id="shipping-postal"
                  value={form.postalCode}
                  onChange={(event) => handleChange('postalCode', event.target.value)}
                  required
                  autoComplete="postal-code"
                />
              </FormField>
              <FormField label="Country" htmlFor="shipping-country">
                <Input
                  id="shipping-country"
                  value={form.country}
                  onChange={(event) => handleChange('country', event.target.value)}
                  required
                  autoComplete="country-name"
                />
              </FormField>
            </div>
          )}

          {selectedAddress && (
            <Surface
              padding="compact"
              style={{
                background: 'var(--color-surface-translucent)',
                border: '1px solid rgba(99,102,241,0.14)',
                display: 'grid',
                gap: '0.35rem',
              }}
            >
              <strong>Selected address:</strong>
              <p>{selectedAddress.street}</p>
              <p>
                {selectedAddress.city}, {selectedAddress.postalCode}
              </p>
              <p>{selectedAddress.country}</p>
            </Surface>
          )}
        </Surface>

        <Surface as="section" style={{ display: 'grid', gap: '1.2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Payment</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.9rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  border:
                    paymentMethod === method.id
                      ? '1px solid rgba(99,102,241,0.4)'
                      : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  background:
                    paymentMethod === method.id
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.16), rgba(34,211,238,0.12))'
                      : 'var(--color-surface-translucent)',
                  transition:
                    'border 0.2s var(--transition-base), background 0.2s var(--transition-base), transform 0.2s var(--transition-base), box-shadow 0.2s var(--transition-base)',
                  boxShadow:
                    paymentMethod === method.id
                      ? '0 18px 35px -28px rgba(99,102,241,0.5)'
                      : 'none',
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />
                {method.label}
              </label>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(99,102,241,0.16)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal</span>
              <span>
                {total.toLocaleString('ro-RO', {
                  style: 'currency',
                  currency: 'RON',
                })}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total</span>
              <span>
                {total.toLocaleString('ro-RO', {
                  style: 'currency',
                  currency: 'RON',
                })}
              </span>
            </div>
          </div>
          {error && <div style={{ color: 'var(--color-danger)' }}>{error}</div>}
          <Button type="submit" block loading={loading}>
            {loading ? 'Processing order...' : 'Place order'}
          </Button>
        </Surface>
      </div>
    </form>
  )
})
