export type RouteMatcher = (pathname: string) => boolean

export interface RouteDefinition {
  id: string
  path: string
  translationKey: string
  showInNavigation?: boolean
  order?: number
  match?: RouteMatcher
}

export interface NavigationRoute extends RouteDefinition {
  showInNavigation?: true
}
