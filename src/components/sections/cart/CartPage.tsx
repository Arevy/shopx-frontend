'use client'

import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { Button, SectionHeader, Surface } from '@components/ui'
import { ModularImage } from '@components/ui/ModularImage'
import { useStores } from '@stores/StoreProvider'
import styles from './CartPage.module.scss'

export const CartPage = observer(() => {
  const { cartStore, userStore } = useStores()

  const items = cartStore.items
  const total = cartStore.totalAmount

  return (
    <div className={styles.container}>
      <SectionHeader
        title="Your cart"
        description="Review the items you selected before placing your order. Adjust quantities or save them for later."
      />

      {items.length === 0 ? (
        <Surface className={styles.emptyState}>
          <p className={styles.emptyMessage}>Your cart is currently empty.</p>
          <Button href={{ pathname: '/products' }}>Continue shopping</Button>
        </Surface>
      ) : (
        <div className={styles.layout}>
          <div className={classNames('grid', styles.itemsGrid)}>
            {items.map((item) => (
              <Surface key={item.product.id} className={styles.itemCard}>
                <div className={styles.imageFrame}>
                  <ModularImage
                    src={item.product.image?.url ?? null}
                    alt={item.product.image?.filename ?? item.product.name}
                    fill
                    sizes="96px"
                    className={styles.productImage}
                    fallback={
                      <span className={styles.imageFallback}>
                        No image
                      </span>
                    }
                  />
                </div>
                <div className={styles.details}>
                  <span className={styles.productName}>{item.product.name}</span>
                  <p className={styles.productDescription}>
                    {item.product.description ?? 'Premium product backed by an extended warranty.'}
                  </p>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>
                      {item.product.price.toLocaleString('ro-RO', {
                        style: 'currency',
                        currency: 'RON',
                      })}
                    </span>
                    <div className={styles.quantityControl}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => cartStore.setQuantity(item.product.id, item.quantity - 1)}
                      >
                        −
                      </Button>
                      <span className={styles.quantityValue}>{item.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => cartStore.setQuantity(item.product.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => cartStore.removeItem(item.product.id)}>
                  Remove
                </Button>
              </Surface>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => cartStore.clearCart()}
              className={styles.clearButton}
            >
              Empty cart
            </Button>
          </div>

          <Surface className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order summary</h2>
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
              <span>Calculated at checkout</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Estimated total</span>
              <span>
                {total.toLocaleString('ro-RO', {
                  style: 'currency',
                  currency: 'RON',
                })}
              </span>
            </div>

            {userStore.isAuthenticated ? (
              <Button href={{ pathname: '/checkout' }} block>
                Proceed to checkout
              </Button>
            ) : (
              <div className={styles.authPrompt}>
                <span className={styles.authCopy}>
                  Please sign in to complete your order.
                </span>
                <Button href={{ pathname: '/auth/login' }} block>
                  Sign in to checkout
                </Button>
              </div>
            )}
          </Surface>
        </div>
      )}
    </div>
  )
})
