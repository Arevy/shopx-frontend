'use client'

import Link from 'next/link'
import { Button } from '@components/ui'
import { ModularImage } from '@components/ui/ModularImage'
import { useTranslation } from '@/i18n'
import type { Product } from '@/types/product'
import styles from './Hero.module.scss'

type HeroProps = { product: Product | null }
export const Hero = ({ product }: HeroProps) => {
  const { t, language } = useTranslation('Page_Home')
  if (!product) return null
  return (
    <section className={`section ${styles.heroSection}`}>
      <div className={styles.content}>
        <span className={styles.eyebrow}>{t('hero.badge')}</span>
        <h1>{t('hero.title')}</h1>
        <p className={styles.description}>{t('hero.description')}</p>
        <div className={styles.actions}>
          <Button href="/products">
            {t('hero.actions.view_catalog')} <span aria-hidden="true">↗</span>
          </Button>
          <Button href={`/products/${product.id}`} variant="outline">
            {t('hero.featured_badge')}
          </Button>
        </div>
        <span className={styles.note}>{t('hero.price_note')}</span>
      </div>
      <Link href={`/products/${product.id}`} className={styles.showcase}>
        <div className={styles.imageWrapper}>
          <ModularImage
            src={product.image?.url ?? null}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 800px) 90vw, 50vw"
            className={styles.productImage}
          />
        </div>
        <div className={styles.details}>
          <div>
            <span className={styles.eyebrow}>
              {product.category?.name ?? t('hero.featured_badge')}
            </span>
            <h2>{product.name}</h2>
          </div>
          <span className={styles.productPrice}>
            {product.price.toLocaleString(language, {
              style: 'currency',
              currency: 'EUR',
            })}
          </span>
        </div>
      </Link>
    </section>
  )
}
