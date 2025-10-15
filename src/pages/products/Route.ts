import type { NavigationRoute } from '@/routes/types'

const productsRoute: NavigationRoute = {
  id: 'catalog',
  path: '/products',
  translationKey: 'header.nav.catalog',
  showInNavigation: true,
  order: 20,
}

export default productsRoute
