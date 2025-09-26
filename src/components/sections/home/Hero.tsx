'use client'

import { motion } from 'framer-motion'
import { Button } from '@components/ui'
import { usePrefersReducedMotion } from '@hooks/usePrefersReducedMotion'
import { useStores } from '@stores/StoreProvider'
import type { Product } from '@/types/product'

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
    <section className="section" style={{ display: 'grid', gap: '3rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '620px' }}
          initial={revealInitial}
          animate={revealAnimate}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.16 }}
        >
          Explore expert-curated collections, sustainable products, and limited offers. With ShopX, every interaction is seamless, personal, and conversion-ready.
        </motion.p>
        <motion.div
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
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
          style={{
            background:
              'linear-gradient(140deg, rgba(99,102,241,0.18) 0%, rgba(34,211,238,0.14) 45%, rgba(255,255,255,0.12) 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.75rem',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '320px',
            border: '1px solid rgba(99,102,241,0.18)',
            boxShadow: '0 35px 80px -50px rgba(99,102,241,0.55)',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <motion.span
              initial={prefersReducedMotion ? undefined : { opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { opacity: 0.2 }}
              transition={{ duration: 1 }}
              style={{
                position: 'absolute',
                top: '-60%',
                left: '10%',
                width: '80%',
                height: '160%',
                background: 'conic-gradient(from 90deg at 50% 50%, rgba(255,255,255,0.5), rgba(99,102,241,0.22))',
                filter: 'blur(120px)',
              }}
            />
          </div>
          <div style={{ position: 'relative', display: 'grid', gap: '1.2rem' }}>
            <span className="tag">{"Featured · Editor's pick"}</span>
            <h3 style={{ fontSize: '2rem', fontWeight: 700 }}>{product.name}</h3>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '540px' }}>
              {product.description ?? "Premium product selected by our team for impeccable performance and aesthetics."}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
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
          </div>
        </motion.div>
      )}
    </section>
  )
}
