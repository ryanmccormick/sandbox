import {
  memo,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { cn } from '../lib/cn'
import { LightMenu, LightMenuItem } from 'light-menu'

export type SelectOption<T extends string | number = string> = {
  value: T | ''
  label: string
  disabled?: boolean
}

export type SelectProps<T extends string | number = string> = {
  label: string
  value: T | ''
  onChange: (value: T | '') => void
  options: SelectOption<T>[]
  variant?: 'outlined' | 'filled' | 'standard'
  size?: 'medium' | 'small'
  helperText?: string
  error?: boolean
  disabled?: boolean
  fullWidth?: boolean
  className?: string
}

function SelectInner<T extends string | number = string>({
  label,
  value,
  onChange,
  options,
  variant = 'outlined',
  size = 'medium',
  helperText,
  error = false,
  disabled = false,
  fullWidth = false,
  className,
}: SelectProps<T>) {
  const id = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)

  const selected = options.find((option) => option.value === value)
  const hasValue = value !== ''
  const shrink = open || hasValue
  const enabledIndexes = useMemo(
    () =>
      options
        .map((option, index) => ({ option, index }))
        .filter(({ option }) => !option.disabled),
    [options],
  )

  function highlightForValue() {
    const selectedIndex = options.findIndex((option) => option.value === value)
    return selectedIndex >= 0 ? selectedIndex : (enabledIndexes[0]?.index ?? 0)
  }

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function openMenu() {
    setHighlight(highlightForValue())
    setOpen(true)
  }

  function selectIndex(index: number) {
    const option = options[index]
    if (!option || option.disabled) return
    onChange(option.value)
    close()
  }

  function moveHighlight(delta: number) {
    if (enabledIndexes.length === 0) return
    const currentPos = enabledIndexes.findIndex(({ index }) => index === highlight)
    const nextPos =
      (currentPos + delta + enabledIndexes.length) % enabledIndexes.length
    setHighlight(enabledIndexes[nextPos]!.index)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault()
        openMenu()
      }
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveHighlight(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveHighlight(-1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setHighlight(enabledIndexes[0]?.index ?? 0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setHighlight(enabledIndexes.at(-1)?.index ?? 0)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectIndex(highlight)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Tab') {
      close()
    }
  }

  const labelColor = error
    ? 'text-light-menu-error'
    : open
      ? 'text-light-menu-primary'
      : 'text-black/60'

  const borderColor = error
    ? 'border-light-menu-error'
    : open
      ? 'border-light-menu-primary'
      : 'border-black/[0.23] group-hover:border-black/[0.87]'

  return (
    <div className={cn('inline-flex flex-col', fullWidth && 'w-full', className)}>
      <div
        className={cn('group relative', disabled && 'pointer-events-none opacity-[0.55]')}
      >
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute z-[1] origin-top-left font-sans tracking-[0.00938em] transition-[color,transform] duration-200',
            variant === 'outlined' &&
              size === 'medium' &&
              !shrink &&
              'translate-x-[14px] translate-y-4 text-base',
            variant === 'outlined' &&
              size === 'small' &&
              !shrink &&
              'translate-x-[14px] translate-y-2 text-base',
            variant === 'filled' &&
              !shrink &&
              'translate-x-3 translate-y-4 text-base',
            variant === 'standard' &&
              !shrink &&
              'translate-x-0 translate-y-4 text-base',
            shrink && 'text-xs',
            variant === 'outlined' &&
              shrink &&
              'translate-x-[14px] -translate-y-[9px] scale-75',
            variant === 'filled' &&
              shrink &&
              'translate-x-3 translate-y-[7px] scale-75',
            variant === 'standard' &&
              shrink &&
              'translate-x-0 -translate-y-[9px] scale-75',
            labelColor,
          )}
        >
          {label}
        </label>

        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? `${id}-menu` : undefined}
          aria-label={label}
          onClick={() => (open ? close() : openMenu())}
          onKeyDown={onKeyDown}
          className={cn(
            'relative box-border flex w-full min-w-[120px] cursor-pointer items-center bg-transparent text-left font-sans text-base leading-[1.4375] tracking-[0.00938em] text-light-menu-text outline-none',
            size === 'medium' && variant === 'outlined' && 'h-14 pr-8 pl-3.5',
            size === 'small' && variant === 'outlined' && 'h-10 pr-8 pl-3.5',
            variant === 'filled' &&
              'rounded-t bg-black/[0.06] pt-[25px] pr-8 pb-2 pl-3 hover:bg-black/[0.09]',
            variant === 'filled' && size === 'medium' && 'h-14',
            variant === 'filled' && size === 'small' && 'h-12 pt-5 pb-1',
            variant === 'standard' && 'h-12 rounded-none px-0 pr-7',
            variant === 'outlined' && 'rounded',
          )}
        >
          <span className={cn('min-w-0 flex-1 truncate', !hasValue && 'opacity-0')}>
            {selected?.label ?? label}
          </span>
          <svg
            className={cn(
              'pointer-events-none absolute top-1/2 right-[7px] h-6 w-6 -translate-y-1/2 text-black/54 transition-transform duration-200',
              open && 'rotate-180',
              variant === 'standard' && 'right-0',
            )}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path fill="currentColor" d="M7 10l5 5 5-5z" />
          </svg>
        </button>

        {variant === 'outlined' ? (
          <fieldset
            className={cn(
              'pointer-events-none absolute inset-0 m-0 min-w-0 overflow-visible rounded px-2 py-0',
              open || error ? 'border-2' : 'border',
              borderColor,
            )}
          >
            <legend
              className={cn(
                'invisible block h-[11px] overflow-hidden p-0 text-xs leading-[11px] whitespace-nowrap transition-[max-width] duration-100',
                shrink ? 'max-w-full px-[5px]' : 'max-w-[0.01px]',
              )}
            >
              <span>{label}</span>
            </legend>
          </fieldset>
        ) : (
          <span
            className={cn(
              'pointer-events-none absolute right-0 bottom-0 left-0',
              variant === 'filled' && 'rounded-t',
              open || error ? 'h-0.5' : 'h-px',
              error
                ? 'bg-light-menu-error'
                : open
                  ? 'bg-light-menu-primary'
                  : 'bg-black/[0.42] group-hover:bg-black/87',
            )}
          />
        )}
      </div>

      {helperText ? (
        <p
          className={cn(
            'mx-[14px] mt-[3px] mb-0 font-sans text-xs leading-[1.66] tracking-[0.03333em]',
            error ? 'text-light-menu-error' : 'text-black/60',
          )}
        >
          {helperText}
        </p>
      ) : null}

      {open ? (
        <LightMenu
          open
          anchorEl={triggerRef.current}
          onClose={close}
          matchWidth
          placement="bottom"
          role="listbox"
        >
          {options.map((option, index) => (
            <LightMenuItem
              key={`${String(option.value)}-${option.label}`}
              disabled={option.disabled}
              selected={option.value === value}
              highlighted={highlight === index}
              onClick={() => selectIndex(index)}
            >
              {option.label}
            </LightMenuItem>
          ))}
        </LightMenu>
      ) : null}
    </div>
  )
}

export const Select = memo(SelectInner) as typeof SelectInner
