'use client'

import Link from 'next/link'
import type { Route } from 'next'
import type { UrlObject } from 'url'
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react'
import classNames from 'classnames'
import styles from './Button.module.scss'

type BaseProps = {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  loading?: boolean
  block?: boolean
  className?: string
  children: ReactNode
}

type ButtonProps = BaseProps & ComponentPropsWithoutRef<'button'> & { href?: never }

type ButtonLinkProps = BaseProps & Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  href: Route | UrlObject
  prefetch?: boolean
}

type Props = ButtonProps | ButtonLinkProps

const isLinkProps = (props: Props): props is ButtonLinkProps => 'href' in props

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>((props, ref) => {
  if (isLinkProps(props)) {
    const {
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      loading = false,
      block = false,
      className,
      children,
      href,
      prefetch,
      ...anchorProps
    } = props

    const classes = classNames(
      styles.button,
      styles[variant],
      size !== 'md' && styles[size],
      block && styles.isBlock,
      loading && styles.isLoading,
      className,
    )

    return (
      <Link
        href={href}
        prefetch={prefetch}
        className={classes}
        {...anchorProps}
        ref={ref as Ref<HTMLAnchorElement>}
      >
        {leftIcon ? <span className={styles.icon}>{leftIcon}</span> : null}
        <span>{children}</span>
        {rightIcon ? <span className={styles.icon}>{rightIcon}</span> : null}
      </Link>
    )
  }

  const {
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    loading = false,
    block = false,
    className,
    children,
    ...buttonProps
  } = props

  const classes = classNames(
    styles.button,
    styles[variant],
    size !== 'md' && styles[size],
    block && styles.isBlock,
    loading && styles.isLoading,
    className,
  )

  return (
    <button
      {...buttonProps}
      className={classes}
      ref={ref as Ref<HTMLButtonElement>}
      aria-busy={loading || undefined}
      disabled={loading || buttonProps.disabled}
    >
      {leftIcon ? <span className={styles.icon}>{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className={styles.icon}>{rightIcon}</span> : null}
    </button>
  )
})

Button.displayName = 'Button'
