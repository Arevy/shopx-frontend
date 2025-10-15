import homeRoute from '@pages/home/Route'
import productsRoute from '@pages/products/Route'
import wishlistRoute from '@pages/wishlist/Route'
import cartRoute from '@pages/cart/Route'
import checkoutRoute from '@pages/checkout/Route'
import impersonateRoute from '@pages/impersonate/Route'
import loginRoute from '@pages/auth/login/Route'
import registerRoute from '@pages/auth/register/Route'
import productDetailRoute from '@pages/products/detail/Route'
import cmsPageRoute from '@pages/cms/Route'
import type { NavigationRoute, RouteDefinition } from '@/routes/types'

const toOrderKey = (route: RouteDefinition) => route.order ?? Number.MAX_SAFE_INTEGER

const rawNavigationRoutes: NavigationRoute[] = [homeRoute, productsRoute, wishlistRoute, cartRoute]

export const navigationRoutes = [...rawNavigationRoutes].sort((a, b) => toOrderKey(a) - toOrderKey(b))

const additionalRoutes: RouteDefinition[] = [
  checkoutRoute,
  impersonateRoute,
  loginRoute,
  registerRoute,
  productDetailRoute,
  cmsPageRoute,
]

export const allRoutes: RouteDefinition[] = [...navigationRoutes, ...additionalRoutes].sort(
  (a, b) => toOrderKey(a) - toOrderKey(b),
)

const normalize = (pathname: string) => pathname.replace(/\/$/, '') || '/'

const matchesRoute = (route: RouteDefinition, pathname: string): boolean => {
  const target = normalize(pathname)
  const base = normalize(route.path)

  if (route.match) {
    return route.match(target)
  }

  return target === base || target.startsWith(`${base}/`)
}

export const findRouteForPath = (pathname: string): RouteDefinition | undefined => {
  const normalizedPath = normalize(pathname)
  return allRoutes.find((route) => matchesRoute(route, normalizedPath))
}
