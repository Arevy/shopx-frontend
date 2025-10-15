'use client'

import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { ProductCard } from '../ProductCard/ProductCard'
import { useStores } from '@stores/StoreProvider'
import styles from './ProductGrid.module.scss'

export const ProductGrid = observer(() => {
  const { productStore } = useStores()

  if (!productStore.listLoaded || productStore.loading) {
    return <div>Loading the catalog...</div>
  }

  if (!productStore.filteredProducts.length) {
    return <div>No products match the selected filters.</div>
  }

  return (
    <div className={classNames('grid', styles.grid)}>
      {productStore.filteredProducts.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )
})
