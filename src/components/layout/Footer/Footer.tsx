'use client'

import Link from 'next/link'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { LanguageSelector } from '@components/layout/LanguageSelector'
import { useStores } from '@stores/StoreProvider'
import { useRTL, useTranslation } from '@/i18n'
import styles from './Footer.module.scss'

export const Footer = observer(() => {
  const { t } = useTranslation('Common')
  const isRtl = useRTL()
  const { cmsStore } = useStores()

  return (
    <footer
      className={classNames(styles.footer, { [styles.footerRtl]: isRtl })}
    >
      <div className={styles.inner}>
        <div>
          <Link href="/" className={styles.brand}>
            ShopX
          </Link>
          <p className={styles.description}>{t('footer.description')}</p>
        </div>
        <nav aria-label={t('header.nav.catalog')}>
          <div className={styles.sectionTitle}>{t('header.nav.catalog')}</div>
          <Link href="/products" className={styles.link}>
            {t('header.nav.catalog')}
          </Link>
          <Link href="/wishlist" className={styles.link}>
            {t('header.nav.wishlist')}
          </Link>
          <Link href="/cart" className={styles.link}>
            {t('header.nav.cart')}
          </Link>
          <Link href="/account" className={styles.link}>
            {t('header.actions.profile')}
          </Link>
        </nav>
        {cmsStore.pages.length > 0 && (
          <nav
            className={styles.contentLinks}
            aria-label={t('header.nav.more')}
          >
            <div className={styles.sectionTitle}>{t('header.nav.more')}</div>
            <div className={styles.pages}>
              {cmsStore.pages.map((page) => (
                <Link
                  key={page.id}
                  href={{ pathname: '/cms/[slug]', query: { slug: page.slug } }}
                  className={styles.link}
                >
                  {page.title}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
      <div
        className={classNames(styles.bottomBar, {
          [styles.bottomBarRtl]: isRtl,
        })}
      >
        <LanguageSelector className={styles.languageSelector} />
        <span>
          {t('footer.bottom.copyright', { year: new Date().getFullYear() })}
        </span>
        <span>EUR · {t('product.vat')}</span>
      </div>
    </footer>
  )
})
