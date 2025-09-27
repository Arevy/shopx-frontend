'use client'

import classNames from 'classnames'
import { motion } from 'framer-motion'
import { SectionHeader, Surface } from '@components/ui'
import styles from './CustomerJourney.module.scss'

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
    <div className={classNames('grid', styles.stepsGrid)}>
      {journeySteps.map((step, index) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, delay: index * 0.07 }}
        >
          <Surface className={styles.stepCard}>
            <span className={classNames('tag', styles.stepBadge)}>
              Step {index + 1}
            </span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
          </Surface>
        </motion.div>
      ))}
    </div>
  </section>
)
