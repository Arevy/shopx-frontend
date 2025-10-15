import type { NavigationRoute } from '@/routes/types'

const homeRoute: NavigationRoute = {
  id: 'home',
  path: '/',
  translationKey: 'header.nav.home',
  showInNavigation: true,
  order: 10,
  match: (pathname) => pathname === '/' || pathname.startsWith('/?'),
}

export default homeRoute
