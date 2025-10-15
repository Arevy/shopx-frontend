'use client'

import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { Button, SectionHeader, Surface } from '@components/ui'
import { ModularImage } from '@components/ui/ModularImage'
import { useStores } from '@stores/StoreProvider'
import styles from './WishlistPage.module.scss'

const WishlistPage = observer(() => {
  const { wishlistStore, cartStore, userStore } = useStores()
  const items = wishlistStore.items

  return (
    <div className={styles.container}>
      <SectionHeader
        title="Wishlist"
        description="Save the products that inspire you and return anytime to add them to the cart."
      />

      {items.length === 0 ? (
        <Surface className={styles.emptyState}>
          <p className={styles.emptyMessage}>{"You haven't saved any products yet."}</p>
          <Button href={{ pathname: '/products' }}>Browse the collections</Button>
        </Surface>
      ) : (
        <div className={classNames('grid', styles.grid)}>
          {items.map((product) => (
            <Surface key={product.id} className={styles.itemCard}>
              <div className={styles.imageFrame}>
                <ModularImage
                  src={product.image?.url ?? null}
                  alt={product.image?.filename ?? product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={styles.productImage}
                  fallback={<span className={styles.imageFallback}>No image</span>}
                />
              </div>
              <Button
                href={`/products/${product.id}`}
                variant="ghost"
                size="sm"
                className={styles.productLink}
              >
                {product.name}
              </Button>
              <p className={styles.description}>
                {product.description ?? 'Curated pick recommended by the ShopX team.'}
              </p>
              <span className={styles.price}>
                {product.price.toLocaleString('ro-RO', {
                  style: 'currency',
                  currency: 'RON',
                })}
              </span>
              <div className={styles.actions}>
                <Button
                  type="button"
                  className={styles.actionButton}
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
                  className={styles.actionButton}
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
        <Surface className={styles.proTip}>
          <strong>Pro tip:</strong> Create an account to keep your wishlist synced across every device.
        </Surface>
      )}
    </div>
  )
})

export default WishlistPage
