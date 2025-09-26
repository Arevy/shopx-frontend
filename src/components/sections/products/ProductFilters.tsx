'use client'

import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useState } from 'react'
import { Button, Input, Surface } from '@components/ui'
import { useDebouncedValue } from '@hooks/useDebouncedValue'
import { useStores } from '@stores/StoreProvider'

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
    <Surface
      as="section"
      style={{ display: 'grid', gap: '1.2rem', padding: '1.8rem', marginBottom: '2rem' }}
    >
      <div>
        <label
          htmlFor="search"
          style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}
        >
          Search
        </label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Input
            id="search"
            type="search"
            placeholder="Search products, collections, keywords..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ flex: 1, minWidth: '240px', borderRadius: '999px' }}
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
        <label
          htmlFor="category"
          style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}
        >
          Category
        </label>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
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
