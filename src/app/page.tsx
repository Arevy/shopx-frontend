import { HomePage } from '@components/sections/home/HomePage'
import { GET_CMS_PAGE, GET_PRODUCTS } from '@graphql/operations'
import { requestGraphQL } from '@lib/graphqlClient'
import type { CmsPage } from '@/types/cms'
import type { Product } from '@/types/product'

const HOME_CMS_SLUG = 'homepage'

export const revalidate = 120

type ProductsResponse = {
  getProducts: Product[]
}

type CmsResponse = {
  getCmsPage: CmsPage | null
}

export default async function Page() {
  const [productsResult, cmsResult] = await Promise.allSettled([
    requestGraphQL<ProductsResponse>(GET_PRODUCTS, { limit: 24 }),
    requestGraphQL<CmsResponse>(GET_CMS_PAGE, { slug: HOME_CMS_SLUG }),
  ])

  const products =
    productsResult.status === 'fulfilled' ? productsResult.value.getProducts : []

  const heroProduct = products[0] ?? null
  const featuredProducts = products.slice(0, 4)
  const newArrivals = products.slice(-6).reverse()

  const cmsPage =
    cmsResult.status === 'fulfilled' ? cmsResult.value.getCmsPage : null

  return (
    <HomePage
      heroProduct={heroProduct}
      featuredProducts={featuredProducts}
      newArrivals={newArrivals}
      cmsPage={cmsPage}
    />
  )
}
