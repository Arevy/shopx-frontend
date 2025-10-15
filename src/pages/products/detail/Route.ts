import type { RouteDefinition } from '@/routes/types'

const productDetailRoute: RouteDefinition = {
  id: 'product-detail',
  path: '/products/[id]',
  translationKey: 'routes.product_detail',
  showInNavigation: false,
  match: (pathname) => /\/products\//.test(pathname),
}

export default productDetailRoute
