'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
import { useRTL, useTranslation } from '@/i18n'
import styles from './CheckoutPage.module.scss'

type PaymentMethodId = 'card' | 'transfer' | 'cash'

interface CheckoutFormState {
  street: string
  city: string
  postalCode: string
  country: string
}

export const CheckoutPage = observer(() => {
  const { cartStore, userStore, uiStore } = useStores()
  const { t } = useTranslation('Page_Checkout')
  const isRtl = useRTL()

  const defaultCountryRef = useRef<string>(t('form.default_country'))

  const [form, setForm] = useState<CheckoutFormState>(() => ({
    street: '',
    city: '',
    postalCode: '',
    country: defaultCountryRef.current,
  }))
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('card')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderCompleted, setOrderCompleted] = useState<Order | null>(null)

  const paymentMethods = useMemo(
    () => [
      { id: 'card' as PaymentMethodId, label: t('form.payment.methods.card') },
      { id: 'transfer' as PaymentMethodId, label: t('form.payment.methods.transfer') },
      { id: 'cash' as PaymentMethodId, label: t('form.payment.methods.cash') },
    ],
    [t],
  )

  useEffect(() => {
    setForm((current) => {
      const nextDefaultCountry = t('form.default_country')
      if (current.country === defaultCountryRef.current) {
        defaultCountryRef.current = nextDefaultCountry
        return { ...current, country: nextDefaultCountry }
      }
      defaultCountryRef.current = nextDefaultCountry
      return current
    })
  }, [t])

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
          setSelectedAddressId(String(getAddresses[0].id))
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
        addressId = String(addAddress.id)
        setAddresses((prev) => [addAddress, ...prev])
        setSelectedAddressId(String(addAddress.id))
      }

      const orderProducts = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }))

      if (orderProducts.some((product) => !product.productId)) {
        throw new Error(t('form.errors.missing_product'))
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
      uiStore.addToast(t('toast.success'), 'success')
    } catch (err) {
      console.error('Checkout failed', err)
      const message = getUserFriendlyMessage(
        err,
        t('form.errors.generic'),
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
        <h1 className="section-title">{t('guard.title')}</h1>
        <p className="section-subtitle">{t('guard.subtitle')}</p>
        <div className={styles.guardActions}>
          <Button href="/auth/login">{t('guard.actions.sign_in')}</Button>
          <Button href="/auth/register" variant="outline">
            {t('guard.actions.register')}
          </Button>
        </div>
      </Surface>
    )
  }

  if (!cartItems.length) {
    return (
      <Surface as="section" className={styles.guard}>
        <p>{t('empty.message')}</p>
        <Button href="/products">{t('empty.cta')}</Button>
      </Surface>
    )
  }

  if (orderCompleted) {
    return (
      <Surface as="section" className={styles.successState}>
        <h1 className="section-title">{t('success.title')}</h1>
        <p className="section-subtitle">{t('success.subtitle', { orderId: orderCompleted.id })}</p>
        <Button href="/products">{t('success.cta')}</Button>
      </Surface>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={classNames(styles.checkoutForm, { [styles.checkoutFormRtl]: isRtl })}
    >
      <SectionHeader
        title={t('intro.title')}
        description={t('intro.description')}
      />

      <div className={styles.columns}>
        <Surface as="section" className={styles.section}>
          <h2 className={styles.sectionHeading}>{t('form.address.title')}</h2>

          {addresses.length > 0 && (
            <FormField label={t('form.address.saved_label')} htmlFor="saved-address">
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
                <option value="new">{t('form.address.add_new')}</option>
              </Select>
            </FormField>
          )}

          {(selectedAddressId === 'new' || !addresses.length) && (
            <div className={styles.addressForm}>
              <FormField label={t('form.address.fields.street')} htmlFor="shipping-street">
                <Input
                  id="shipping-street"
                  value={form.street}
                  onChange={(event) => handleChange('street', event.target.value)}
                  required
                  autoComplete="address-line1"
                />
              </FormField>
              <FormField label={t('form.address.fields.city')} htmlFor="shipping-city">
                <Input
                  id="shipping-city"
                  value={form.city}
                  onChange={(event) => handleChange('city', event.target.value)}
                  required
                  autoComplete="address-level2"
                />
              </FormField>
              <FormField
                label={t('form.address.fields.postal_code')}
                htmlFor="shipping-postal"
              >
                <Input
                  id="shipping-postal"
                  value={form.postalCode}
                  onChange={(event) => handleChange('postalCode', event.target.value)}
                  required
                  autoComplete="postal-code"
                />
              </FormField>
              <FormField label={t('form.address.fields.country')} htmlFor="shipping-country">
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
              <strong>{t('form.address.selected_heading')}:</strong>
              <p>{selectedAddress.street}</p>
              <p>
                {selectedAddress.city}, {selectedAddress.postalCode}
              </p>
              <p>{selectedAddress.country}</p>
            </Surface>
          )}
        </Surface>

        <Surface as="section" className={styles.section}>
          <h2 className={styles.sectionHeading}>{t('form.payment.title')}</h2>
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
                  onChange={(event) => setPaymentMethod(event.target.value as PaymentMethodId)}
                />
                {method.label}
              </label>
            ))}
          </div>
          <div className={styles.paymentSummary}>
            <div className={styles.summaryRow}>
              <span>{t('form.payment.summary.subtotal')}</span>
              <span>
                {total.toLocaleString('ro-RO', {
                  style: 'currency',
                  currency: 'RON',
                })}
              </span>
            </div>
            <div className={classNames(styles.summaryRow, styles.summaryRowMuted)}>
              <span>{t('form.payment.summary.shipping')}</span>
              <span>{t('form.payment.summary.shipping_free')}</span>
            </div>
            <div className={classNames(styles.summaryRow, styles.summaryTotal)}>
              <span>{t('form.payment.summary.total')}</span>
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
            {loading
              ? t('form.payment.actions.processing')
              : t('form.payment.actions.submit')}
          </Button>
        </Surface>
      </div>
    </form>
  )
})
