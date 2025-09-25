'use client'

import { SectionHeader } from '@components/ui'
import { ProductFilters } from './ProductFilters'
import { ProductGrid } from './ProductGrid'

export const ProductListingPage = () => {
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
