'use client'

import classNames from 'classnames'
import { motion } from 'framer-motion'
import { Button, SectionHeader, Surface } from '@components/ui'
import { useTranslation } from '@/i18n'
import type { Product } from '@/types/product'
import styles from './NewArrivals.module.scss'

type NewArrivalsProps = {
  products: Product[]
}

export const NewArrivals = ({ products }: NewArrivalsProps) => {
  const { t } = useTranslation('Page_Home')

  if (!products.length) {
    return null
  }

  return (
    <section className={classNames('section', styles.section)}>
      <SectionHeader
        title={t('new_arrivals.title')}
        description={t('new_arrivals.description')}
        actions={
          <Button href={{ pathname: '/products' }} variant="outline">
            {t('new_arrivals.actions.view_all')}
          </Button>
        }
      />
      <motion.div
        initial={{ x: '-3%' }}
        whileInView={{ x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={styles.carousel}
      >
        {products.map((product) => (
          <Surface key={product.id} className={styles.card}>
            <div className={styles.imagePlaceholder} />
            <Button
              href={`/products/${product.id}`}
              variant="ghost"
              size="sm"
              className={styles.link}
            >
              {product.name}
            </Button>
            <span className={styles.price}>
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
