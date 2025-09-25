'use client'

import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { SectionHeader, Surface } from '@components/ui'
import type { CmsPage } from '@/types/cms'
import { useStores } from '@stores/StoreProvider'
import { Hero } from './Hero'
import { Highlights } from './Highlights'
import { FeaturedProducts } from './FeaturedProducts'
import { NewArrivals } from './NewArrivals'
import { CustomerJourney } from './CustomerJourney'

export const HomePage = observer(() => {
  const { productStore, cmsStore } = useStores()
  const [homeCmsPage, setHomeCmsPage] = useState<CmsPage | null>(null)

  useEffect(() => {
    let mounted = true
    cmsStore
      .getPage('homepage')
      .then((page) => {
        if (mounted) {
          setHomeCmsPage(page)
        }
      })
      .catch(() => {
        // handled via toast inside store
      })

    return () => {
      mounted = false
    }
  }, [cmsStore])

  if (productStore.loading && !productStore.products.length) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}>
        <span>Loading the ShopX collection...</span>
      </div>
    )
  }

  return (
    <>
      <Hero />
      <Highlights />
      <FeaturedProducts />
      <NewArrivals />
      <CustomerJourney />
      {homeCmsPage && (
        <section className="section">
          <SectionHeader
            title={homeCmsPage.title}
            description={homeCmsPage.excerpt ?? undefined}
          />
          <Surface
            dangerouslySetInnerHTML={{ __html: homeCmsPage.body }}
            style={{ display: 'grid', gap: '1.2rem', lineHeight: 1.7 }}
          />
        </section>
      )}
    </>
  )
})
