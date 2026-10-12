'use client'

import Link from 'next/link'
import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { ModularImage } from '@components/ui/ModularImage'
import type { Product } from '@/types/product'
import { useStores } from '@stores/StoreProvider'
import { useTranslation } from '@/i18n'
import styles from './ProductCard.module.scss'

interface ProductCardProps {
  product: Product
  index?: number
}

export const ProductCard = observer(({ product }: ProductCardProps) => {
  const { cartStore, wishlistStore } = useStores()
  const { t, language } = useTranslation('Common')
  const [adding, setAdding] = useState(false)
  const saved = wishlistStore.items.some((item) => item.id === product.id)
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Link
          href={`/products/${product.id}`}
          className={styles.imageWrapper}
          aria-label={product.name}
        >
          <ModularImage
            src={product.image?.url ?? null}
            alt={product.name}
            fill
            className={styles.productImage}
            sizes="(max-width: 600px) 45vw, (max-width: 1000px) 45vw, 25vw"
            fallback={
              <span className={styles.imagePlaceholder}>
                {t('product.no_image')}
              </span>
            }
          />
        </Link>
        <button
          type="button"
          className={styles.save}
          aria-pressed={saved}
          aria-label={saved ? t('product.unsave') : t('product.save')}
          onClick={() => wishlistStore.toggle(product)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </button>
      </div>
      <div className={styles.body}>
        {product.category?.name && (
          <span className={styles.category}>{product.category.name}</span>
        )}
        <Link href={`/products/${product.id}`} className={styles.title}>
          {product.name}
        </Link>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.priceRow}>
          <div>
            <span className={styles.price}>
              {product.price.toLocaleString(language, {
                style: 'currency',
                currency: 'EUR',
              })}
            </span>
            <span className={styles.tax}>{t('product.vat')}</span>
          </div>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={adding}
            onClick={async () => {
              setAdding(true)
              try {
                await cartStore.addItem(product)
              } finally {
                setAdding(false)
              }
            }}
          >
            {adding ? t('product.adding') : t('product.add')}
          </button>
        </div>
      </div>
    </article>
  )
})
