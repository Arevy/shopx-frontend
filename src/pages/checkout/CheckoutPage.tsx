'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { Button, FormField, Input, SectionHeader, Select, Surface } from '@components/ui'
import { useStores } from '@stores/StoreProvider'
import { getUserFriendlyMessage } from '@lib/getUserFriendlyMessage'
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

const CheckoutPage = observer(() => {
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
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('card')
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
    if (!isLoggedIn || !Number.isFinite(userId)) {
      userStore.resetAddresses()
      setSelectedAddressId('new')
      return
    }

    let cancelled = false

    userStore
      .loadAddresses()
      .then((list) => {
        if (cancelled) return
        if (list.length) {
          setSelectedAddressId((current) => (current === 'new' ? String(list[0].id) : current))
        }
      })
      .catch((err) => {
        console.error('Failed to load addresses', err)
      })

    return () => {
      cancelled = true
    }
  }, [userStore, isLoggedIn, userId])

  const addresses = userStore.addresses

  useEffect(() => {
    if (!addresses.length) {
      setSelectedAddressId('new')
      return
    }

    if (
      selectedAddressId !== 'new' &&
      !addresses.some((address) => address.id === selectedAddressId)
    ) {
      setSelectedAddressId(String(addresses[0].id))
    }
  }, [addresses, selectedAddressId])

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

    setError(null)

    try {
      if (selectedAddressId === 'new') {
        const createdAddress = await userStore.createAddress(form)
        setSelectedAddressId(createdAddress.id)
      }

      const order = await cartStore.placeOrder({
        cartItems,
        total,
        paymentMethod,
        missingProductMessage: t('form.errors.missing_product'),
      })

      setOrderCompleted(order)
      uiStore.addToast(t('toast.success'), 'success')
    } catch (err) {
      console.error('Checkout failed', err)
      const message = getUserFriendlyMessage(
        err,
        t('form.errors.generic'),
      )
      setError(message)
      uiStore.addToast(message, 'error')
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

          {userStore.addressesError ? (
            <div className={styles.error}>{userStore.addressesError}</div>
          ) : null}

          {addresses.length > 0 && (
            <FormField label={t('form.address.saved_label')} htmlFor="saved-address">
              <Select
                id="saved-address"
                value={selectedAddressId}
                onChange={(event) => setSelectedAddressId(event.target.value)}
                disabled={userStore.addressesLoading || userStore.savingAddress}
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
                  disabled={userStore.savingAddress || cartStore.checkoutSubmitting}
                />
              </FormField>
              <FormField label={t('form.address.fields.city')} htmlFor="shipping-city">
                <Input
                  id="shipping-city"
                  value={form.city}
                  onChange={(event) => handleChange('city', event.target.value)}
                  required
                  autoComplete="address-level2"
                  disabled={userStore.savingAddress || cartStore.checkoutSubmitting}
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
                  disabled={userStore.savingAddress || cartStore.checkoutSubmitting}
                />
              </FormField>
              <FormField label={t('form.address.fields.country')} htmlFor="shipping-country">
                <Input
                  id="shipping-country"
                  value={form.country}
                  onChange={(event) => handleChange('country', event.target.value)}
                  required
                  autoComplete="country-name"
                  disabled={userStore.savingAddress || cartStore.checkoutSubmitting}
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
          <Button
            type="submit"
            block
            loading={cartStore.checkoutSubmitting || userStore.savingAddress}
          >
            {cartStore.checkoutSubmitting || userStore.savingAddress
              ? t('form.payment.actions.processing')
              : t('form.payment.actions.submit')}
          </Button>
        </Surface>
      </div>
    </form>
  )
})

export default CheckoutPage
