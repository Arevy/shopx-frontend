'use client'

import { useEffect } from 'react'
import { SectionHeader } from '@components/ui'
import { useStores } from '@stores/StoreProvider'
import { ProductFilters } from './ProductFilters'
import { ProductGrid } from './ProductGrid'

export const ProductListingPage = () => {
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
        description="Explore carefully curated products, filter by interests, and discover limited editions before they launch."
      />
      <ProductFilters />
      <ProductGrid />
    </div>
  )
}
