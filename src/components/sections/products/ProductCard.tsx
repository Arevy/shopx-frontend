'use client'

import Link from 'next/link'
import { observer } from 'mobx-react-lite'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/types/product'
import { useStores } from '@stores/StoreProvider'
import styles from './ProductCard.module.scss'

interface ProductCardProps {
  product: Product
  index?: number
}

export const ProductCard = observer(({ product, index = 0 }: ProductCardProps) => {
  const { cartStore, wishlistStore } = useStores()
  const isInWishlist = wishlistStore.items.some((item) => item.id === product.id)

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25) }}
    >
      <div className={styles.imageMock}>
        <motion.div
          className={styles.imageShine}
          animate={{ transform: ['translateX(-80%)', 'translateX(40%)', 'translateX(-80%)'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <Link
        href={{ pathname: '/products/[id]', query: { id: product.id } }}
        className={styles.title}
      >
        {product.name}
      </Link>
      <p className={styles.description}>
        {product.description ?? 'Premium experience with sustainable materials and extended warranty.'}
      </p>
      <div className={styles.priceRow}>
        <span style={{ fontWeight: 700 }}>
          {product.price.toLocaleString('ro-RO', {
            style: 'currency',
            currency: 'RON',
          })}
        </span>
        <Button
          href={{ pathname: '/products/[id]', query: { id: product.id } }}
          variant="outline"
          size="sm"
        >
          Product details
        </Button>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => wishlistStore.toggle(product)}
        >
          {isInWishlist ? 'Remove from wishlist' : 'Save' }
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => cartStore.addItem(product)}
        >
          Add to cart
        </button>
      </div>
    </motion.div>
  )
})
