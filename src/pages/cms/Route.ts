import type { RouteDefinition } from '@/routes/types'

const cmsPageRoute: RouteDefinition = {
  id: 'cms-page',
  path: '/cms/[slug]',
  translationKey: 'routes.cms_page',
  showInNavigation: false,
  match: (pathname) => pathname.startsWith('/cms/'),
}

export default cmsPageRoute
