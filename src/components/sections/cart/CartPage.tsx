'use client'

import { observer } from 'mobx-react-lite'
import { Button, SectionHeader, Surface } from '@components/ui'
import { useStores } from '@stores/StoreProvider'

export const CartPage = observer(() => {
  const { cartStore, userStore } = useStores()

  const items = cartStore.items
  const total = cartStore.totalAmount

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <SectionHeader
        title="Your cart"
        description="Review the items you selected before placing your order. Adjust quantities or save them for later."
      />

      {items.length === 0 ? (
        <Surface style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ marginBottom: '1.5rem' }}>Your cart is currently empty.</p>
          <Button href={{ pathname: '/products' }}>Continue shopping</Button>
        </Surface>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 320px)',
          }}
        >
          <div className="grid" style={{ gap: '1rem' }}>
            {items.map((item) => (
              <Surface
                key={item.product.id}
                style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'minmax(0, 1fr) auto' }}
              >
                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 600 }}>{item.product.name}</span>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                    {item.product.description ?? 'Premium product backed by an extended warranty.'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>
                      {item.product.price.toLocaleString('ro-RO', {
                        style: 'currency',
                        currency: 'RON',
                      })}
                    </span>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: '999px',
                        padding: '0.25rem',
                        background: 'var(--color-surface-translucent)',
                      }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => cartStore.setQuantity(item.product.id, item.quantity - 1)}
                      >
                        −
                      </Button>
                      <span style={{ minWidth: '2rem', textAlign: 'center' }}>{item.quantity}</span>
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
              style={{ justifySelf: 'flex-start' }}
            >
              Empty cart
            </Button>
          </div>

          <Surface style={{ display: 'grid', gap: '1rem', alignSelf: 'start' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Order summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>
                {total.toLocaleString('ro-RO', {
                  style: 'currency',
                  currency: 'RON',
                })}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(99,102,241,0.16)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
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
              <div style={{ display: 'grid', gap: '0.8rem' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
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
