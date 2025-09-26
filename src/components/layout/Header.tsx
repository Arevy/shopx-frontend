'use client'

import Link from 'next/link'
import type { Route } from 'next'
import type { UrlObject } from 'url'
import { usePathname } from 'next/navigation'
import { observer } from 'mobx-react-lite'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@components/ui'
import { useDisclosure } from '@hooks/useDisclosure'
import { useStores } from '@stores/StoreProvider'
import styles from './Header.module.scss'

export const Header = observer(() => {
  const pathname = usePathname()
  const { cartStore, wishlistStore, userStore, cmsStore } = useStores()
  type NavLink = {
    href: Route | UrlObject
    label: string
    matchPath: string
  }

  const staticLinks: NavLink[] = [
    { href: '/' as Route, label: 'Home', matchPath: '/' },
    { href: '/products' as Route, label: 'Catalog', matchPath: '/products' },
    { href: '/wishlist' as Route, label: 'Wishlist', matchPath: '/wishlist' },
    { href: '/cart' as Route, label: 'Cart', matchPath: '/cart' },
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
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <motion.span
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            ShopX
          </motion.span>
        </Link>

        <nav className={styles.nav}>
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

        <div className={styles.actions}>
          {userStore.isAuthenticated ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={userStore.logout}
            >
              {userStore.user?.name ?? userStore.user?.email}
            </Button>
          ) : (
            <Button href={{ pathname: '/auth/login' }} variant="outline" size="sm">
              Sign in
            </Button>
          )}
          <button
            type="button"
            className={styles.menuToggle}
            onClick={onToggle}
            aria-label="Toggle navigation"
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
            className={styles.mobileNav}
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
                Sign out
              </Button>
            ) : (
              <Button
                href={{ pathname: '/auth/login' }}
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Sign in
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
})
