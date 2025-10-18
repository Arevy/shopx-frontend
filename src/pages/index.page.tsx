import type { GetStaticProps } from 'next'
import { createRootStore } from '@stores/rootStore'
import type { CmsPage } from '@/types/cms'
import type { Product } from '@/types/product'
import HomePage from './home/HomePage'

const HOME_CMS_SLUG = 'homepage'

type HomeProps = {
  heroProduct: Product | null
  featuredProducts: Product[]
  newArrivals: Product[]
  cmsPage: CmsPage | null
}

const IndexPage = ({ heroProduct, featuredProducts, newArrivals, cmsPage }: HomeProps) => {
  return (
    <HomePage
      heroProduct={heroProduct}
      featuredProducts={featuredProducts}
      newArrivals={newArrivals}
      cmsPage={cmsPage}
    />
  )
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const store = createRootStore()

  await store.productStore.fetchProducts()
  const products = store.productStore.products.slice(0, 24)

  const heroProduct = products[0] ?? null
  const featuredProducts = products.slice(0, 4)
  const newArrivals = products.slice(-6).reverse()

  const cmsPage = await store.cmsStore.getPage(HOME_CMS_SLUG)

  return {
    props: {
      heroProduct,
      featuredProducts,
      newArrivals,
      cmsPage,
    },
    revalidate: 120,
  }
}

export default IndexPage
