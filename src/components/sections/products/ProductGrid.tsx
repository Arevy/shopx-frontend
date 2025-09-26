'use client'

import { observer } from 'mobx-react-lite'
import { ProductCard } from './ProductCard'
import { useStores } from '@stores/StoreProvider'

export const ProductGrid = observer(() => {
  const { productStore } = useStores()

  if (!productStore.listLoaded || productStore.loading) {
    return <div>Loading the catalog...</div>
  }

  if (!productStore.filteredProducts.length) {
    return <div>No products match the selected filters.</div>
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
      {productStore.filteredProducts.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )
})
