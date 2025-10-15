'use client'

import classNames from 'classnames'
import { motion } from 'framer-motion'
import { SectionHeader, Surface } from '@components/ui'
import { useTranslation } from '@/i18n'
import styles from './CustomerJourney.module.scss'

export const CustomerJourney = () => {
  const { t } = useTranslation('Page_Home')
  const steps = [0, 1, 2]

  return (
    <section className="section">
      <SectionHeader
        title={t('journey.title')}
        description={t('journey.description')}
      />
      <div className={classNames('grid', styles.stepsGrid)}>
        {steps.map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: index * 0.07 }}
          >
            <Surface className={styles.stepCard}>
              <span className={classNames('tag', styles.stepBadge)}>
                {t('journey.step_badge', { step: index + 1 })}
              </span>
              <h3 className={styles.stepTitle}>{t(`journey.steps.${index}.title`)}</h3>
              <p className={styles.stepDescription}>{t(`journey.steps.${index}.description`)}</p>
            </Surface>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
