'use client'

import classNames from 'classnames'
import { LanguageSelector } from '@components/layout/LanguageSelector'
import { useRTL, useTranslation } from '@/i18n'
import styles from './Footer.module.scss'

const supportLinkKeys = ['contact', 'faq', 'returns'] as const
const companyLinkKeys = ['about', 'careers', 'blog'] as const
const socialLinkKeys = ['instagram', 'facebook', 'tiktok'] as const

export const Footer = () => {
  const { t } = useTranslation('Common')
  const isRtl = useRTL()

  return (
    <footer className={classNames(styles.footer, { [styles.footerRtl]: isRtl })}>
      <div className={styles.inner}>
        <div>
          <div className={styles.brand}>ShopX</div>
          <p className={styles.description}>{t('footer.description')}</p>
        </div>
        <div>
          <div className={styles.sectionTitle}>{t('footer.sections.support')}</div>
          {supportLinkKeys.map((key) => (
            <a key={key} href="#" className={styles.link}>
              {t(`footer.links.support.${key}`)}
            </a>
          ))}
        </div>
        <div>
          <div className={styles.sectionTitle}>{t('footer.sections.company')}</div>
          {companyLinkKeys.map((key) => (
            <a key={key} href="#" className={styles.link}>
              {t(`footer.links.company.${key}`)}
            </a>
          ))}
        </div>
        <div>
          <div className={styles.sectionTitle}>{t('footer.sections.social')}</div>
          {socialLinkKeys.map((key) => (
            <a key={key} href="#" className={styles.link}>
              {t(`footer.links.social.${key}`)}
            </a>
          ))}
        </div>
      </div>
      <div className={classNames(styles.bottomBar, { [styles.bottomBarRtl]: isRtl })}>
        <LanguageSelector className={styles.languageSelector} />
        <span>{t('footer.bottom.copyright', { year: new Date().getFullYear() })}</span>
        <span>{t('footer.bottom.credit')}</span>
      </div>
    </footer>
  )
}
