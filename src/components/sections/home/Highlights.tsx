'use client'

import classNames from 'classnames'
import { motion } from 'framer-motion'
import { SectionHeader, Surface } from '@components/ui'
import styles from './Highlights.module.scss'

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
    <div className={classNames('grid', styles.gridColumns)}>
      {highlights.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: index * 0.08 }}
        >
          <Surface className={styles.highlightCard}>
            <h3 className={styles.highlightTitle}>{item.title}</h3>
            <p className={styles.highlightDescription}>{item.description}</p>
          </Surface>
        </motion.div>
      ))}
    </div>
  </section>
)
