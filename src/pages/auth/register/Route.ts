import type { RouteDefinition } from '@/routes/types'

const registerRoute: RouteDefinition = {
  id: 'register',
  path: '/auth/register',
  translationKey: 'routes.register',
  showInNavigation: false,
}

export default registerRoute
