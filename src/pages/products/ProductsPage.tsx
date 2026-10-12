'use client'

import { useEffect } from 'react'
import { SectionHeader } from '@components/ui'
import { useStores } from '@stores/StoreProvider'
import { ProductFilters } from './components/ProductFilters/ProductFilters'
import { ProductGrid } from './components/ProductGrid/ProductGrid'

const ProductsPage = () => {
  const { productStore } = useStores()

  useEffect(() => {
    if (!productStore.products.length) {
      void productStore.fetchProducts()
    }
    if (!productStore.categories.length) {
      void productStore.fetchCategories()
    }
  }, [productStore])

  return (
    <div>
      <SectionHeader
        title="ShopX catalog"
        description="Explore tech, home and lifestyle. Filter by category or find a specific model."
      />
      <ProductFilters />
      <ProductGrid />
    </div>
  )
}

export default ProductsPage
