import type { ReactNode } from 'react'
import classNames from 'classnames'
import styles from './SectionHeader.module.scss'

type SectionHeaderProps = {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  align?: 'start' | 'center'
  className?: string
}

export const SectionHeader = ({
  eyebrow,
  title,
  description,
  actions,
  align = 'start',
  className,
}: SectionHeaderProps) => {
  return (
    <header
      className={classNames(styles.sectionHeader, className)}
      style={{ textAlign: align === 'center' ? 'center' : 'left' }}
    >
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  )
}
