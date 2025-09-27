'use client'

import classNames from 'classnames'
import { ProductCard } from '@components/sections/products/ProductCard'
import { SectionHeader } from '@components/ui'
import type { Product } from '@/types/product'
import styles from './FeaturedProducts.module.scss'

type FeaturedProductsProps = {
  products: Product[]
}

export const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
  if (!products.length) {
    return null
  }

  return (
    <section className="section">
      <SectionHeader
        eyebrow="ShopX collection"
        title="Curated selections"
        description="ShopX community bestsellers designed for contemporary lifestyles and dynamic needs."
      />
      <div className={classNames('grid', styles.productsGrid)}>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  )
}
