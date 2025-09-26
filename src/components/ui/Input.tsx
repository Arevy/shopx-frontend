import classNames from 'classnames'
import { forwardRef, type InputHTMLAttributes } from 'react'
import styles from './FormControl.module.scss'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  block?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, block = true, ...props }, ref) => {
  return <input ref={ref} className={classNames(styles.control, block && styles.block, className)} {...props} />
})

Input.displayName = 'Input'
