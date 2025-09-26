'use client'

import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button, SectionHeader, Surface } from '@components/ui'
import { useStores } from '@stores/StoreProvider'
import { ProductCard } from './ProductCard'

interface ProductDetailPageProps {
  productId: string
}

export const ProductDetailPage = observer(({ productId }: ProductDetailPageProps) => {
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
    return <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>Loading product details...</div>
  }

  if (!product) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center', gap: '1rem' }}>
        <span>The product was not found.</span>
        <Button href={{ pathname: '/products' }}>
          Back to catalog
        </Button>
      </div>
    )
  }

  const isInWishlist = wishlistStore.items.some((item) => item.id === product.id)

  return (
    <div style={{ display: 'grid', gap: '4rem' }}>
      <section className="section" style={{ marginBottom: 0 }}>
        <div style={{ display: 'grid', gap: '2.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              borderRadius: 'var(--radius-lg)',
              minHeight: '360px',
              overflow: 'hidden',
              background: product.image?.url
                ? 'transparent'
                : 'radial-gradient(circle at top, rgba(37,99,235,0.25), rgba(14,165,233,0.3))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {product.image?.url ? (
              <img
                src={product.image.url}
                alt={product.image.filename ?? product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>No image available</span>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ display: 'grid', gap: '1.2rem' }}
          >
            <span className="tag">ShopX Collection · Available now</span>
            <h1 className="section-title" style={{ marginBottom: 0 }}>{product.name}</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem' }}>
              {product.description ?? 'An innovative product designed to give you a real advantage every day. Durable materials, extended warranty, premium support.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700 }}>
                {product.price.toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}
              </span>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <Button onClick={() => cartStore.addItem(product)}>
                  Add to cart
                </Button>
                <Button variant="outline" onClick={() => wishlistStore.toggle(product)}>
                  {isInWishlist ? 'In wishlist' : 'Save'}
                </Button>
              </div>
            </div>
            <ul style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
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
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {reviews.map((review) => (
              <Surface key={review.id} style={{ display: 'grid', gap: '0.8rem' }}>
                <span style={{ fontWeight: 600 }}>Rating: {review.rating}/5</span>
                <p style={{ color: 'var(--color-text-muted)' }}>{review.reviewText ?? 'Excellent experience, highly recommend!'}</p>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
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
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {recommended.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
})
