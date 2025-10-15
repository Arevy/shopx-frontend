import type { RouteDefinition } from '@/routes/types'

const loginRoute: RouteDefinition = {
  id: 'login',
  path: '/auth/login',
  translationKey: 'routes.login',
  showInNavigation: false,
}

export default loginRoute
