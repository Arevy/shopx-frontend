'use client'

import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button, SectionHeader, Surface } from '@components/ui'
import { ModularImage } from '@components/ui/ModularImage'
import { useStores } from '@stores/StoreProvider'
import { ProductCard } from '@pages/products/components/ProductCard/ProductCard'
import styles from './ProductDetailPage.module.scss'

interface ProductDetailPageProps {
  productId: string
}

const ProductDetailPage = observer(({ productId }: ProductDetailPageProps) => {
  const { productStore, cartStore, wishlistStore } = useStores()

  useEffect(() => {
    productStore.fetchProductDetail(productId)
  }, [productId, productStore])

  useEffect(() => {
    if (!productStore.products.length) {
      void productStore.fetchProducts()
    }
  }, [productStore])

  const product = productStore.productDetail
  const reviews = productStore.productReviews
  const recommended = productStore.products
    .filter((item) => item.id !== productId)
    .slice(0, 4)

  if (productStore.detailLoading && !product) {
    return <div className={styles.loader}>Loading product details...</div>
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <span>The product was not found.</span>
        <Button href={{ pathname: '/products' }}>
          Back to catalog
        </Button>
      </div>
    )
  }

  const isInWishlist = wishlistStore.items.some((item) => item.id === product.id)

  return (
    <div className={styles.page}>
      <section className={classNames('section', styles.heroSection)}>
        <div className={styles.heroGrid}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className={classNames(
              styles.imageWrapper,
              product.image?.url && styles.imageHasMedia,
            )}
          >
            <ModularImage
              src={product.image?.url ?? null}
              alt={product.image?.filename ?? product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.productImage}
              fallback={<span className={styles.imageFallback}>No image available</span>}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={styles.details}
          >
            <span className="tag">ShopX Collection · Available now</span>
            <h1 className={classNames('section-title', styles.title)}>{product.name}</h1>
            <p className={styles.description}>
              {product.description ?? 'An innovative product designed to give you a real advantage every day. Durable materials, extended warranty, premium support.'}
            </p>
            <div className={styles.infoRow}>
              <span className={styles.price}>
                {product.price.toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}
              </span>
              <div className={styles.actions}>
                <Button onClick={() => cartStore.addItem(product)}>
                  Add to cart
                </Button>
                <Button variant="outline" onClick={() => wishlistStore.toggle(product)}>
                  {isInWishlist ? 'In wishlist' : 'Save'}
                </Button>
              </div>
            </div>
            <ul className={styles.featureList}>
              <li>Scheduled delivery in 24-48h with confirmation SMS.</li>
              <li>Dedicated support 6 days a week, live chat, and 30-day returns.</li>
              <li>Integration with the ShopX mobile app for real-time tracking.</li>
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <SectionHeader
          title="Authentic reviews"
          description="Real feedback from the ShopX community. Tell us how it improved your life."
        />
        {reviews.length ? (
          <div className={classNames('grid', styles.reviewsGrid)}>
            {reviews.map((review) => (
              <Surface key={review.id} className={styles.reviewCard}>
                <span className={styles.reviewHeading}>Rating: {review.rating}/5</span>
                <p className={styles.reviewBody}>{review.reviewText ?? 'Excellent experience, highly recommend!'}</p>
                <span className={styles.reviewMeta}>
                  {new Date(review.createdAt).toLocaleDateString('ro-RO')}
                </span>
              </Surface>
            ))}
          </div>
        ) : (
          <Surface padding="compact">{`This product doesn't have any reviews yet. Be the first to share your experience!`}</Surface>
        )}
      </section>

      {recommended.length > 0 && (
        <section className="section">
          <SectionHeader title="Recommended for you" />
          <div className={classNames('grid', styles.recommendationsGrid)}>
            {recommended.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
})

export default ProductDetailPage
