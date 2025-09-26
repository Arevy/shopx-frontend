import { SectionHeader, Surface } from '@components/ui'
import type { CmsPage } from '@/types/cms'
import type { Product } from '@/types/product'
import { Hero } from './Hero'
import { Highlights } from './Highlights'
import { FeaturedProducts } from './FeaturedProducts'
import { NewArrivals } from './NewArrivals'
import { CustomerJourney } from './CustomerJourney'

type HomePageProps = {
  heroProduct: Product | null
  featuredProducts: Product[]
  newArrivals: Product[]
  cmsPage: CmsPage | null
}

export const HomePage = ({ heroProduct, featuredProducts, newArrivals, cmsPage }: HomePageProps) => {
  return (
    <>
      <Hero product={heroProduct} />
      <Highlights />
      <FeaturedProducts products={featuredProducts} />
      <NewArrivals products={newArrivals} />
      <CustomerJourney />
      {cmsPage && (
        <section className="section">
          <SectionHeader
            title={cmsPage.title}
            description={cmsPage.excerpt ?? undefined}
          />
          <Surface
            dangerouslySetInnerHTML={{ __html: cmsPage.body }}
            style={{ display: 'grid', gap: '1.2rem', lineHeight: 1.7 }}
          />
        </section>
      )}
    </>
  )
}
