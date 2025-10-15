import classNames from 'classnames'
import type { ReactNode } from 'react'
import styles from './FormField.module.scss'

type FormFieldProps = {
  label: ReactNode
  children: ReactNode
  helper?: ReactNode
  htmlFor?: string
  className?: string
}

export const FormField = ({ label, children, helper, htmlFor, className }: FormFieldProps) => {
  return (
    <label className={classNames(styles.field, className)} htmlFor={htmlFor}>
      <span className={styles.label}>{label}</span>
      {children}
      {helper ? <span className={styles.helper}>{helper}</span> : null}
    </label>
  )
}
