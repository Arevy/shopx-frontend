'use client'

import classNames from 'classnames'
import { motion } from 'framer-motion'
import { Button } from '@components/ui'
import { usePrefersReducedMotion } from '@hooks/usePrefersReducedMotion'
import { useStores } from '@stores/StoreProvider'
import type { Product } from '@/types/product'
import styles from './Hero.module.scss'

type HeroProps = {
  product: Product | null
}

export const Hero = ({ product }: HeroProps) => {
  const { cartStore, wishlistStore } = useStores()
  const prefersReducedMotion = usePrefersReducedMotion()

  const revealInitial = prefersReducedMotion ? undefined : { opacity: 0, y: 12 }
  const revealAnimate = prefersReducedMotion ? undefined : { opacity: 1, y: 0 }

  if (!product) {
    return null
  }

  return (
    <section className={classNames('section', styles.heroSection)}>
      <div className={styles.content}>
        <motion.span
          className="tag"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          New on ShopX · Premium experience
        </motion.span>
        <motion.h1
          className="section-title"
          initial={revealInitial}
          animate={revealAnimate}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        >
          Contemporary design, smart technology, rapid delivery
        </motion.h1>
        <motion.p
          className={styles.description}
          initial={revealInitial}
          animate={revealAnimate}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.16 }}
        >
          Explore expert-curated collections, sustainable products, and limited offers. With ShopX, every interaction is seamless, personal, and conversion-ready.
        </motion.p>
        <motion.div
          className={styles.actions}
          initial={revealInitial}
          animate={revealAnimate}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.22 }}
        >
          <Button href={{ pathname: '/products' }}>View full catalog</Button>
          <Button href={{ pathname: '/checkout' }} variant="outline">
            Instant checkout
          </Button>
        </motion.div>
      </div>

      {product && (
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.28 }}
          className={styles.showcase}
        >
          <div className={styles.overlay}>
            <motion.span
              initial={prefersReducedMotion ? undefined : { opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { opacity: 0.2 }}
              transition={{ duration: 1 }}
              className={styles.glow}
            />
          </div>
          <div className={styles.details}>
            <span className="tag">{"Featured · Editor's pick"}</span>
            <h3 className={styles.productTitle}>{product.name}</h3>
            <p className={styles.productDescription}>
              {product.description ?? "Premium product selected by our team for impeccable performance and aesthetics."}
            </p>
            <div className={styles.productActions}>
              <span className={styles.productPrice}>
                {product.price.toLocaleString('ro-RO', {
                  style: 'currency',
                  currency: 'RON',
                })}
              </span>
              <Button onClick={() => cartStore.addItem(product)}>Add to cart</Button>
              <Button variant="outline" onClick={() => wishlistStore.toggle(product)}>
                Save for later
              </Button>
            </div>
            {product.image?.url && (
              <motion.img
                initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
                animate={prefersReducedMotion ? undefined : { opacity: 0.95, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.35 }}
                src={product.image.url}
                alt={product.image.filename ?? product.name}
                className={styles.productImage}
              />
            )}
          </div>
        </motion.div>
      )}
    </section>
  )
}
