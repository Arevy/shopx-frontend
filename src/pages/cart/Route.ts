import type { NavigationRoute } from '@/routes/types'

const cartRoute: NavigationRoute = {
  id: 'cart',
  path: '/cart',
  translationKey: 'header.nav.cart',
  showInNavigation: true,
  order: 40,
}

export default cartRoute
