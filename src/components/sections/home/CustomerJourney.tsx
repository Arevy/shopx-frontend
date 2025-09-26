'use client'

import { motion } from 'framer-motion'
import { SectionHeader, Surface } from '@components/ui'

const journeySteps = [
  {
    title: 'Discover',
    description: 'Curated collections, smart filters, and instant search to quickly find the right product.',
  },
  {
    title: 'Evaluate',
    description: 'Rich product pages, real reviews, and contextual recommendations for cross-sell opportunities.',
  },
  {
    title: 'Checkout',
    description: 'Optimized checkout, multiple payment integrations, and real-time cart updates.',
  },
]

export const CustomerJourney = () => (
  <section className="section">
    <SectionHeader
      title="A complete flow built for conversion"
      description="From the first interaction to the final order, ShopX delivers a cohesive, fast experience that boosts customer satisfaction."
    />
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
      {journeySteps.map((step, index) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, delay: index * 0.07 }}
        >
          <Surface style={{ display: 'grid', gap: '0.8rem' }}>
            <span className="tag" style={{ marginBottom: '1rem' }}>
              Step {index + 1}
            </span>
            <h3 style={{ fontSize: '1.2rem' }}>{step.title}</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>{step.description}</p>
          </Surface>
        </motion.div>
      ))}
    </div>
  </section>
)
