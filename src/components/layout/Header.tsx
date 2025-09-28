'use client'

import Link from 'next/link'
import type { Route } from 'next'
import type { UrlObject } from 'url'
import { usePathname } from 'next/navigation'
import { observer } from 'mobx-react-lite'
import { motion, AnimatePresence } from 'framer-motion'
import classNames from 'classnames'
import { Button } from '@components/ui'
import { useDisclosure } from '@hooks/useDisclosure'
import { useStores } from '@stores/StoreProvider'
import { useRTL, useTranslation } from '@/i18n'
import styles from './Header.module.scss'

export const Header = observer(() => {
  const pathname = usePathname()
  const { cartStore, wishlistStore, userStore, cmsStore } = useStores()
  const { t } = useTranslation('Common')
  const isRtl = useRTL()
  type NavLink = {
    href: Route | UrlObject
    label: string
    matchPath: string
  }

  const staticLinks: NavLink[] = [
    { href: '/' as Route, label: t('header.nav.home'), matchPath: '/' },
    { href: '/products' as Route, label: t('header.nav.catalog'), matchPath: '/products' },
    { href: '/wishlist' as Route, label: t('header.nav.wishlist'), matchPath: '/wishlist' },
    { href: '/cart' as Route, label: t('header.nav.cart'), matchPath: '/cart' },
  ]

  const cmsLinks: NavLink[] = cmsStore.pages.map((page) => ({
    href: { pathname: '/cms/[slug]', query: { slug: page.slug } },
    label: page.title,
    matchPath: `/cms/${page.slug}`,
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
              key={link.matchPath}
              href={link.href}
              className={`${styles.navLink} ${
                pathname === link.matchPath ? styles.navLinkActive : ''
              }`}
            >
              {link.label}
              {link.matchPath === '/cart' && cartCount > 0 && (
                <span className={styles.badge}>{cartCount}</span>
              )}
              {link.matchPath === '/wishlist' && wishlistCount > 0 && (
                <span className={styles.badge}>{wishlistCount}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className={classNames(styles.actions, { [styles.actionsRtl]: isRtl })}>
          {userStore.isAuthenticated ? (
            <Button variant="secondary" size="sm" onClick={userStore.logout}>
              {userStore.user?.name ?? userStore.user?.email ?? t('header.actions.sign_out')}
            </Button>
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
                key={link.matchPath}
                href={link.href}
                onClick={onClose}
                className={`${styles.mobileLink} ${
                  pathname === link.matchPath ? styles.mobileLinkActive : ''
                }`}
              >
                {link.label}
                {link.matchPath === '/cart' && cartCount > 0 && (
                  <span className={styles.badge}>{cartCount}</span>
                )}
                {link.matchPath === '/wishlist' && wishlistCount > 0 && (
                  <span className={styles.badge}>{wishlistCount}</span>
                )}
              </Link>
            ))}
            {userStore.isAuthenticated ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  await userStore.logout()
                  onClose()
                }}
              >
                {t('header.actions.sign_out')}
              </Button>
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
