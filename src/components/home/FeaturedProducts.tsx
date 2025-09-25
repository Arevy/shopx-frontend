'use client'

import { observer } from 'mobx-react-lite'
import { ProductCard } from '@components/products/ProductCard'
import { SectionHeader } from '@components/ui'
import { useStores } from '@stores/StoreProvider'

export const FeaturedProducts = observer(() => {
  const { productStore } = useStores()

  if (!productStore.featured.length) {
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
        {productStore.featured.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  )
})
