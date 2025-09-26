import classNames from 'classnames'
import { forwardRef, type SelectHTMLAttributes } from 'react'
import styles from './FormControl.module.scss'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  block?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, block = true, ...props }, ref) => {
  return (
    <span className={classNames(styles.selectWrapper, block && styles.block)}>
      <select
        ref={ref}
        className={classNames(styles.control, styles.select, className)}
        {...props}
      />
    </span>
  )
})

Select.displayName = 'Select'
