'use client'

import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useState } from 'react'
import { Button, Input, Surface } from '@components/ui'
import { useDebouncedValue } from '@hooks/useDebouncedValue'
import { useStores } from '@stores/StoreProvider'
import styles from './ProductFilters.module.scss'

export const ProductFilters = observer(() => {
  const { productStore } = useStores()

  const [search, setSearch] = useState(productStore.filters.search)
  const debouncedSearch = useDebouncedValue(search, 200)

  useEffect(() => {
    productStore.setSearch(debouncedSearch)
  }, [debouncedSearch, productStore])


  useEffect(() => {
    setSearch(productStore.filters.search)
  }, [productStore.filters.search])
  const categories = useMemo(
    () => [{ id: 'all', name: 'All categories' }, ...productStore.categories],
    [productStore.categories],
  )

  return (
    <Surface as="section" className={styles.filters}>
      <div>
        <label htmlFor="search" className={styles.label}>
          Search
        </label>
        <div className={styles.searchControls}>
          <Input
            id="search"
            type="search"
            placeholder="Search products, collections, keywords..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={styles.searchInput}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearch('')
              productStore.setSearch('')
            }}
          >
            Clear filters
          </Button>
        </div>
      </div>
      <div>
        <label htmlFor="category" className={styles.label}>
          Category
        </label>
        <div className={styles.categoryControls}>
          {categories.map((category) => {
            const isActive = productStore.filters.categoryId === category.id
            return (
              <Button
                key={category.id}
                type="button"
                variant={isActive ? 'primary' : 'outline'}
                size="sm"
                onClick={() => productStore.setCategory(category.id)}
              >
                {category.name}
              </Button>
            )
          })}
        </div>
      </div>
    </Surface>
  )
})
