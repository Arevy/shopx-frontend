'use client'

import { motion } from 'framer-motion'
import { Button, SectionHeader, Surface } from '@components/ui'
import type { Product } from '@/types/product'

type NewArrivalsProps = {
  products: Product[]
}

export const NewArrivals = ({ products }: NewArrivalsProps) => {
  if (!products.length) {
    return null
  }

  return (
    <section className="section" style={{ overflow: 'hidden' }}>
      <SectionHeader
        title="New Arrivals"
        description="Fresh drops straight from the studio. Limited stock, fast delivery, extended warranty."
        actions={
          <Button href={{ pathname: '/products' }} variant="outline">
            View all
          </Button>
        }
      />
      <motion.div
        initial={{ x: '-3%' }}
        whileInView={{ x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          display: 'grid',
          gap: '1.2rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}
      >
        {products.map((product) => (
          <Surface
            key={product.id}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
          >
            <div
              style={{
                background:
                  'linear-gradient(120deg, rgba(99,102,241,0.14), rgba(34,211,238,0.24))',
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
            <span style={{ fontWeight: 700 }}>
              {product.price.toLocaleString('ro-RO', {
                style: 'currency',
                currency: 'RON',
              })}
            </span>
          </Surface>
        ))}
      </motion.div>
    </section>
  )
}
