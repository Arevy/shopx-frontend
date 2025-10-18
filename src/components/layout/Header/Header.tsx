'use client'

import Link from 'next/link'
import type { UrlObject } from 'url'
import { useRouter } from 'next/router'
import { observer } from 'mobx-react-lite'
import { motion, AnimatePresence } from 'framer-motion'
import classNames from 'classnames'
import { Button } from '@components/ui'
import { useDisclosure } from '@hooks/useDisclosure'
import { useStores } from '@stores/StoreProvider'
import { useRTL, useTranslation } from '@/i18n'
import { useStorefrontNavigation } from '@/routes/useStorefrontNavigation'
import styles from './Header.module.scss'

export const Header = observer(() => {
  const router = useRouter()
  const pathname = router.asPath ? router.asPath.split('?')[0] : router.pathname
  const { cartStore, wishlistStore, userStore, cmsStore } = useStores()
  const { t } = useTranslation('Common')
  const isRtl = useRTL()
  const { routes: navigationRoutes, isActive } = useStorefrontNavigation()

  type StaticNavLink = {
    key: string
    href: string
    label: string
    type: 'static'
  }

  type CmsNavLink = {
    key: string
    href: UrlObject
    label: string
    matchPath: string
    type: 'cms'
  }

  type NavLink = StaticNavLink | CmsNavLink

  const staticLinks: StaticNavLink[] = navigationRoutes.map((route) => ({
    key: route.id,
    href: route.path,
    label: route.label,
    type: 'static',
  }))

  const cmsLinks: NavLink[] = cmsStore.pages.map((page) => ({
    key: `cms-${page.slug}`,
    href: { pathname: '/cms/[slug]', query: { slug: page.slug } },
    label: page.title,
    matchPath: `/cms/${page.slug}`,
    type: 'cms',
  }))

  const navLinks = [...staticLinks, ...cmsLinks]
  const { isOpen: mobileOpen, onToggle, onClose } = useDisclosure()

  const cartCount = cartStore.items.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = wishlistStore.items.length

  return (
    <header className={classNames(styles.header, { [styles.headerRtl]: isRtl })}>
      <div className={classNames(styles.inner, { [styles.innerRtl]: isRtl })}>
        <Link href="/" className={styles.brand}>
          <motion.span
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            ShopX
          </motion.span>
        </Link>

        <nav className={classNames(styles.nav, { [styles.navRtl]: isRtl })}>
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={classNames(styles.navLink, {
                [styles.navLinkActive]:
                  link.type === 'static' ? isActive(link.href) : pathname === link.matchPath,
              })}
            >
              {link.label}
              {link.type === 'static' && link.key === 'cart' && cartCount > 0 && (
                <span className={styles.badge}>{cartCount}</span>
              )}
              {link.type === 'static' && link.key === 'wishlist' && wishlistCount > 0 && (
                <span className={styles.badge}>{wishlistCount}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className={classNames(styles.actions, { [styles.actionsRtl]: isRtl })}>
          {userStore.isAuthenticated ? (
            <>
              <Link href="/account" className={styles.userButton}>
                {userStore.user?.name ?? userStore.user?.email ?? t('header.actions.profile')}
              </Link>
              <Button variant="outline" size="sm" onClick={userStore.logout}>
                {t('header.actions.sign_out')}
              </Button>
            </>
          ) : (
            <Button href={{ pathname: '/auth/login' }} variant="outline" size="sm">
              {t('header.actions.sign_in')}
            </Button>
          )}
          <button
            type="button"
            className={styles.menuToggle}
            onClick={onToggle}
            aria-label={t('header.actions.toggle_navigation')}
          >
            ☰
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={classNames(styles.mobileNav, { [styles.mobileNavRtl]: isRtl })}
          >
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={onClose}
                className={classNames(styles.mobileLink, {
                  [styles.mobileLinkActive]:
                    link.type === 'static' ? isActive(link.href) : pathname === link.matchPath,
                })}
              >
                {link.label}
                {link.type === 'static' && link.key === 'cart' && cartCount > 0 && (
                  <span className={styles.badge}>{cartCount}</span>
                )}
                {link.type === 'static' && link.key === 'wishlist' && wishlistCount > 0 && (
                  <span className={styles.badge}>{wishlistCount}</span>
                )}
              </Link>
            ))}
            {userStore.isAuthenticated ? (
              <>
                <Link href="/account" className={styles.mobileUserLink} onClick={onClose}>
                  {userStore.user?.name ?? userStore.user?.email ?? t('header.actions.profile')}
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await userStore.logout()
                    onClose()
                  }}
                >
                  {t('header.actions.sign_out')}
                </Button>
              </>
            ) : (
              <Button
                href={{ pathname: '/auth/login' }}
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                {t('header.actions.sign_in')}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
})
