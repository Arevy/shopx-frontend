'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from '@/i18n'
import { navigationRoutes } from '@/routes'
import type { NavigationRoute } from '@/routes/types'

export interface NavigationItem extends NavigationRoute {
  label: string
}

const isPathActive = (pathname: string, candidate: string): boolean => {
  if (candidate === '/') {
    return pathname === '/'
  }

  return pathname === candidate || pathname.startsWith(`${candidate}/`)
}

export const useStorefrontNavigation = () => {
  const router = useRouter()
  const pathname = router.asPath ? router.asPath.split('?')[0] : router.pathname
  const { t } = useTranslation('Common')

  const routes = useMemo<NavigationItem[]>(
    () =>
      navigationRoutes.map((route) => ({
        ...route,
        label: t(route.translationKey),
      })),
    [t],
  )

  return {
    routes,
    pathname,
    isActive: (candidate: string) => isPathActive(pathname, candidate),
  }
}
