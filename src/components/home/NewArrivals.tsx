'use client'

import { observer } from 'mobx-react-lite'
import { motion } from 'framer-motion'
import { Button, SectionHeader, Surface } from '@components/ui'
import { useStores } from '@stores/StoreProvider'

export const NewArrivals = observer(() => {
  const { productStore } = useStores()

  if (!productStore.newArrivals.length) {
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
        {productStore.newArrivals.map((product) => (
          <Surface
            key={product.id}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
          >
            <div
              style={{
                background:
                  'linear-gradient(120deg, rgba(37,99,235,0.1), rgba(14,165,233,0.26))',
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
})
