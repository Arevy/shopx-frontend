'use client'

import classNames from 'classnames'
import { motion } from 'framer-motion'
import { SectionHeader, Surface } from '@components/ui'
import { useTranslation } from '@/i18n'
import styles from './Highlights.module.scss'

export const Highlights = () => {
  const { t } = useTranslation('Page_Home')
  const items = [0, 1, 2]

  return (
    <section className="section">
      <SectionHeader
        title={t('highlights.title')}
        description={t('highlights.description')}
      />
      <div className={classNames('grid', styles.gridColumns)}>
        {items.map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <Surface className={styles.highlightCard}>
              <h3 className={styles.highlightTitle}>{t(`highlights.items.${index}.title`)}</h3>
              <p className={styles.highlightDescription}>{t(`highlights.items.${index}.description`)}</p>
            </Surface>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
