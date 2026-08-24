import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'contained' | 'outlined' | 'text'
  color?: 'primary' | 'inherit'
  size?: 'small' | 'medium' | 'large'
  startIcon?: ReactNode
}

export function Button({
  variant = 'text',
  color = 'primary',
  size = 'medium',
  startIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'relative inline-flex items-center justify-center rounded align-middle font-sans text-sm font-medium tracking-[0.02857em] uppercase transition-[background-color,box-shadow,border-color] duration-150 select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-menu-primary',
        size === 'small' && 'min-h-8 px-2.5 py-1 text-[0.8125rem]',
        size === 'medium' && 'min-h-[36.5px] px-2 py-[6px]',
        size === 'large' && 'min-h-[42px] px-3.5 py-2',
        variant === 'contained' && size === 'medium' && 'px-4 shadow-light-menu-2',
        variant === 'contained' &&
          color === 'primary' &&
          'bg-light-menu-primary text-white hover:bg-light-menu-primary-dark hover:shadow-light-menu-4',
        variant === 'outlined' &&
          'border border-light-menu-primary/50 px-4 text-light-menu-primary hover:border-light-menu-primary hover:bg-light-menu-primary/[0.04]',
        variant === 'text' &&
          color === 'primary' &&
          'text-light-menu-primary hover:bg-light-menu-primary/[0.04]',
        variant === 'text' &&
          color === 'inherit' &&
          'text-light-menu-text hover:bg-black/[0.04]',
        disabled && 'pointer-events-none opacity-[0.38] shadow-none',
        className,
      )}
      {...props}
    >
      {startIcon ? (
        <span className="mr-2 inline-flex text-[1.25em]">{startIcon}</span>
      ) : null}
      {children}
    </button>
  )
}
