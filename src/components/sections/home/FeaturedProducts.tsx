'use client'

import { ProductCard } from '@components/sections/products/ProductCard'
import { SectionHeader } from '@components/ui'
import type { Product } from '@/types/product'

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
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  )
}
