import { SectionHeader, Surface } from '@components/ui'
import type { CmsPage } from '@/types/cms'
import type { Product } from '@/types/product'
import { Hero } from './components/Hero/Hero'
import { Highlights } from './components/Highlights/Highlights'
import { FeaturedProducts } from './components/FeaturedProducts/FeaturedProducts'
import { NewArrivals } from './components/NewArrivals/NewArrivals'
import { CustomerJourney } from './components/CustomerJourney/CustomerJourney'
import styles from './HomePage.module.scss'

export type HomePageProps = {
  heroProduct: Product | null
  featuredProducts: Product[]
  newArrivals: Product[]
  cmsPage: CmsPage | null
}

const HomePage = ({ heroProduct, featuredProducts, newArrivals, cmsPage }: HomePageProps) => {
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
            className={styles.cmsContent}
          />
        </section>
      )}
    </>
  )
}

export default HomePage
