'use client'

import { motion } from 'framer-motion'
import { SectionHeader, Surface } from '@components/ui'

const highlights = [
  {
    title: '24h delivery',
    description: 'Integrated logistics with real-time track & trace and flexible delivery options.',
  },
  {
    title: 'Personalized experience',
    description: 'Dynamic recommendations based on user behavior and best sellers.',
  },
  {
    title: 'Secure payments',
    description: 'Optimized checkout with multiple payment methods and guaranteed security.',
  },
]

export const Highlights = () => (
  <section className="section">
    <SectionHeader
      title="Built for conversion"
      description="ShopX blends intelligent analytics with contemporary design to improve conversion and retention rates."
    />
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
      {highlights.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: index * 0.08 }}
        >
          <Surface style={{ display: 'grid', gap: '0.6rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>{item.title}</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{item.description}</p>
          </Surface>
        </motion.div>
      ))}
    </div>
  </section>
)
