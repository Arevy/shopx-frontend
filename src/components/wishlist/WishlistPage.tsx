'use client'

import { observer } from 'mobx-react-lite'
import { Button, SectionHeader, Surface } from '@components/ui'
import { useStores } from '@stores/StoreProvider'

export const WishlistPage = observer(() => {
  const { wishlistStore, cartStore, userStore } = useStores()
  const items = wishlistStore.items

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <SectionHeader
        title="Wishlist"
        description="Save the products that inspire you and return anytime to add them to the cart."
      />

      {items.length === 0 ? (
        <Surface style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ marginBottom: '1.5rem' }}>You haven't saved any products yet.</p>
          <Button href={{ pathname: '/products' }}>Browse the collections</Button>
        </Surface>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {items.map((product) => (
            <Surface key={product.id} style={{ display: 'grid', gap: '0.8rem' }}>
              <div
                style={{
                  background:
                    'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(14,165,233,0.22))',
                  borderRadius: 'var(--radius-md)',
                  aspectRatio: '4 / 3',
                }}
              />
              <Button
                href={{ pathname: '/products/[id]', query: { id: product.id } }}
                variant="ghost"
                size="sm"
                style={{ justifyContent: 'flex-start' }}
              >
                {product.name}
              </Button>
              <p style={{ color: 'var(--color-text-muted)' }}>
                {product.description ?? 'Curated pick recommended by the ShopX team.'}
              </p>
              <span style={{ fontWeight: 600 }}>
                {product.price.toLocaleString('ro-RO', {
                  style: 'currency',
                  currency: 'RON',
                })}
              </span>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <Button
                  type="button"
                  style={{ flex: 1 }}
                  onClick={() => {
                    cartStore.addItem(product)
                    wishlistStore.remove(product)
                  }}
                >
                  Move to cart
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={() => wishlistStore.remove(product)}
                >
                  Remove
                </Button>
              </div>
            </Surface>
          ))}
        </div>
      )}

      {!userStore.isAuthenticated && items.length > 0 && (
        <Surface style={{ padding: '1.5rem' }}>
          <strong>Pro tip:</strong> Create an account to keep your wishlist synced across every device.
        </Surface>
      )}
    </div>
  )
})
