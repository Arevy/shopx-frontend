import classNames from 'classnames'
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import styles from './Surface.module.scss'

type SurfaceProps<T extends ElementType = 'div'> = {
  as?: T
  children?: ReactNode
  padding?: 'default' | 'compact' | 'flush'
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, 'children'>

export const Surface = <T extends ElementType = 'div'>({
  as,
  children,
  padding = 'default',
  className,
  ...rest
}: SurfaceProps<T>) => {
  const Component = (as ?? 'div') as ElementType

  return (
    <Component
      className={classNames(
        styles.surface,
        padding !== 'default' && styles[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}
