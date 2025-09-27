'use client'

import { useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { Button, FormField, Input, SectionHeader, Select, Surface } from '@components/ui'
import { useStores } from '@stores/StoreProvider'
import { requestGraphQL } from '@lib/graphqlClient'
import { getUserFriendlyMessage } from '@lib/getUserFriendlyMessage'
import {
  ADD_ADDRESS,
  CREATE_ORDER,
  CREATE_PAYMENT,
  GET_ADDRESSES,
} from '@graphql/operations'
import type { Address } from '@/types/address'
import type { Order } from '@/types/order'
import styles from './CheckoutPage.module.scss'

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

  useEffect(() => {
    if (!isLoggedIn || !Number.isFinite(userId)) return

    let isMounted = true

    requestGraphQL<{ getAddresses: Address[] }>(GET_ADDRESSES, { userId })
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
  }, [isLoggedIn, userId])

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
        const { addAddress } = await requestGraphQL<{ addAddress: Address }>(ADD_ADDRESS, {
          userId,
          ...form,
        })
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

      const { createOrder } = await requestGraphQL<{ createOrder: Order }>(CREATE_ORDER, {
        userId,
        products: orderProducts,
      })

      await requestGraphQL(CREATE_PAYMENT, {
        orderId: createOrder.id,
        amount: total,
        method: paymentMethod,
      })

      await cartStore.clearCart()

      setOrderCompleted(createOrder)
      uiStore.addToast('Order placed successfully!', 'success')
    } catch (err) {
      console.error('Checkout failed', err)
      const message = getUserFriendlyMessage(
        err,
        'Checkout failed. Please try again.',
      )
      setError(message)
      uiStore.addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <Surface as="section" className={styles.guard}>
        <h1 className="section-title">You need an account to check out</h1>
        <p className="section-subtitle">
          Sign in or create an account in just a few seconds to complete your order.
        </p>
        <div className={styles.guardActions}>
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
      <Surface as="section" className={styles.guard}>
        <p>Your cart is empty. Add products to continue.</p>
        <Button href={{ pathname: '/products' }}>Back to catalog</Button>
      </Surface>
    )
  }

  if (orderCompleted) {
    return (
      <Surface as="section" className={styles.successState}>
        <h1 className="section-title">Order completed</h1>
        <p className="section-subtitle">
          {`Thank you! Your order number is #${orderCompleted.id}. We'll email the details and tracking link shortly.`}
        </p>
        <Button href={{ pathname: '/products' }}>Continue shopping</Button>
      </Surface>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.checkoutForm}>
      <SectionHeader
        title="Checkout"
        description="Enter your shipping details and choose a payment method. Processing is secure and only takes a few seconds."
      />

      <div className={styles.columns}>
        <Surface as="section" className={styles.section}>
          <h2 className={styles.sectionHeading}>Shipping address</h2>

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
            <div className={styles.addressForm}>
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
              className={styles.selectedAddress}
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

        <Surface as="section" className={styles.section}>
          <h2 className={styles.sectionHeading}>Payment</h2>
          <div className={styles.paymentOptions}>
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={classNames(
                  styles.paymentOption,
                  paymentMethod === method.id && styles.paymentOptionSelected,
                )}
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
          <div className={styles.paymentSummary}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>
                {total.toLocaleString('ro-RO', {
                  style: 'currency',
                  currency: 'RON',
                })}
              </span>
            </div>
            <div className={classNames(styles.summaryRow, styles.summaryRowMuted)}>
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className={classNames(styles.summaryRow, styles.summaryTotal)}>
              <span>Total</span>
              <span>
                {total.toLocaleString('ro-RO', {
                  style: 'currency',
                  currency: 'RON',
                })}
              </span>
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <Button type="submit" block loading={loading}>
            {loading ? 'Processing order...' : 'Place order'}
          </Button>
        </Surface>
      </div>
    </form>
  )
})
