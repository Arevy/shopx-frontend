'use client'

import { Button, SectionHeader } from '@components/ui'
import { ProductCard } from '@pages/products/components/ProductCard/ProductCard'
import { useTranslation } from '@/i18n'
import type { Product } from '@/types/product'
import styles from './NewArrivals.module.scss'

export const NewArrivals = ({ products }: { products: Product[] }) => {
  const { t } = useTranslation('Page_Home')
  if (!products.length) return null
  return (
    <section className="section">
      <SectionHeader
        title={t('new_arrivals.title')}
        description={t('new_arrivals.description')}
        actions={
          <Button href="/products" variant="outline">
            {t('new_arrivals.actions.view_all')}
          </Button>
        }
      />
      <div className={styles.carousel}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
