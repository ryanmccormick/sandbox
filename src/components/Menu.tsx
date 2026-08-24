import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/cn'
import { ChevronRightIcon } from './icons'

type MenuPlacement = 'overlay' | 'bottom' | 'right'

type MenuTree = {
  register: (id: string, el: HTMLElement) => () => void
  contains: (node: Node) => boolean
  closeRoot: () => void
  isTop: (id: string) => boolean
}

type MenuContextValue = {
  close: () => void
  closeRoot: () => void
  dense: boolean
  itemRole: 'menuitem' | 'option'
  openSubmenuId: string | null
  setOpenSubmenuId: (id: string | null) => void
  depth: number
}

const MenuContext = createContext<MenuContextValue | null>(null)
const MenuTreeContext = createContext<MenuTree | null>(null)

function createMenuTree(closeRoot: () => void): MenuTree {
  const papers = new Map<string, HTMLElement>()
  const order: string[] = []

  return {
    register(id, el) {
      papers.set(id, el)
      order.push(id)
      return () => {
        papers.delete(id)
        const index = order.indexOf(id)
        if (index >= 0) order.splice(index, 1)
      }
    },
    contains(node) {
      for (const el of papers.values()) {
        if (el.contains(node)) return true
      }
      return false
    },
    closeRoot,
    isTop(id) {
      return order.at(-1) === id
    },
  }
}

function menuItemClass({
  dense,
  selected,
  highlighted,
  disabled,
  open,
}: {
  dense?: boolean
  selected?: boolean
  highlighted?: boolean
  disabled?: boolean
  open?: boolean
}) {
  return cn(
    'relative flex w-full cursor-pointer items-center border-0 bg-transparent px-4 text-left font-sans text-base leading-[1.5] tracking-[0.00938em] text-mui-text outline-none select-none',
    dense ? 'min-h-9 py-1.5' : 'min-h-12 py-[6px]',
    'hover:bg-black/[0.04] focus:bg-black/[0.04]',
    (highlighted || open) && !selected && 'bg-black/[0.04]',
    selected &&
      'bg-mui-primary/8 text-mui-primary hover:bg-mui-primary/12 focus:bg-mui-primary/12',
    disabled && 'pointer-events-none text-black/[0.38]',
  )
}

export type MenuProps = {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  children: ReactNode
  dense?: boolean
  matchWidth?: boolean
  placement?: MenuPlacement
  minWidth?: number
  role?: 'menu' | 'listbox'
  autoFocus?: boolean
}

export function Menu({
  open,
  anchorEl,
  onClose,
  children,
  dense = false,
  matchWidth = false,
  placement = 'overlay',
  minWidth = 112,
  role = 'menu',
  autoFocus = role === 'menu',
}: MenuProps) {
  const menuId = useId()
  const paperRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const parentTree = useContext(MenuTreeContext)
  const parentMenu = useContext(MenuContext)
  const treeRef = useRef<MenuTree | null>(null)
  if (!parentTree && !treeRef.current) {
    treeRef.current = createMenuTree(() => onCloseRef.current())
  }
  const tree = parentTree ?? treeRef.current!
  const isRoot = !parentTree
  const depth = (parentMenu?.depth ?? -1) + 1

  const [style, setStyle] = useState<CSSProperties>({})
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null)

  useLayoutEffect(() => {
    if (!open || !anchorEl) return

    const place = () => {
      const paper = paperRef.current
      const rect = anchorEl.getBoundingClientRect()
      const paperRect = paper?.getBoundingClientRect()
      const width = paperRect?.width || minWidth
      const height = paperRect?.height || 0

      let top =
        placement === 'bottom'
          ? rect.bottom + 4
          : placement === 'right'
            ? rect.top
            : rect.top
      let left =
        placement === 'right' ? rect.right - 2 : rect.left

      if (placement === 'right' && left + width > window.innerWidth - 8) {
        left = rect.left - width + 2
      }
      if (top + height > window.innerHeight - 8 && height > 0) {
        top = Math.max(8, window.innerHeight - height - 8)
      }

      const next: CSSProperties = {
        top,
        left,
        minWidth,
        zIndex: 1300 + depth,
      }
      if (matchWidth) next.width = rect.width
      setStyle(next)
    }

    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, anchorEl, matchWidth, minWidth, placement, depth])

  useLayoutEffect(() => {
    if (!open || !paperRef.current) return
    return tree.register(menuId, paperRef.current)
  }, [open, tree, menuId])

  useEffect(() => {
    if (!open) {
      setOpenSubmenuId(null)
      return
    }

    const items = () =>
      Array.from(
        paperRef.current?.querySelectorAll<HTMLButtonElement>(
          '[role="menuitem"]:not(:disabled), [role="option"]:not(:disabled)',
        ) ?? [],
      )

    const onPointerDown = (event: PointerEvent) => {
      if (!isRoot) return
      const target = event.target as Node
      if (tree.contains(target)) return
      if (anchorEl?.contains(target)) return
      tree.closeRoot()
    }

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (!tree.isTop(menuId)) return

      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        anchorEl?.focus()
        return
      }

      if (role !== 'menu') return

      const enabled = items()
      const current = enabled.findIndex((item) => item === document.activeElement)

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        enabled[(current + 1 + enabled.length) % enabled.length]?.focus()
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        enabled[(current - 1 + enabled.length) % enabled.length]?.focus()
      } else if (event.key === 'Home') {
        event.preventDefault()
        enabled[0]?.focus()
      } else if (event.key === 'End') {
        event.preventDefault()
        enabled.at(-1)?.focus()
      } else if (event.key === 'ArrowLeft' && !isRoot) {
        event.preventDefault()
        onClose()
        anchorEl?.focus()
      } else if (event.key === 'Tab') {
        tree.closeRoot()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    const frame = window.requestAnimationFrame(() => {
      if (autoFocus) items()[0]?.focus()
    })

    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, anchorEl, onClose, role, autoFocus, isRoot, menuId, tree])

  if (!open) return null

  const paper = (
    <MenuContext.Provider
      value={{
        close: onClose,
        closeRoot: () => tree.closeRoot(),
        dense,
        itemRole: role === 'listbox' ? 'option' : 'menuitem',
        openSubmenuId,
        setOpenSubmenuId,
        depth,
      }}
    >
      <div
        ref={paperRef}
        role={role}
        tabIndex={-1}
        style={style}
        className={cn(
          'mui-menu-enter fixed rounded bg-white py-2 shadow-mui-8 outline-none',
          matchWidth ? 'origin-top' : 'origin-top-left',
        )}
      >
        <ul className="m-0 max-h-[calc(100vh-96px)] list-none overflow-auto p-0">
          {children}
        </ul>
      </div>
    </MenuContext.Provider>
  )

  const portaled = createPortal(paper, document.body)
  if (isRoot) {
    return (
      <MenuTreeContext.Provider value={tree}>{portaled}</MenuTreeContext.Provider>
    )
  }
  return portaled
}

export type MenuItemProps = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  selected?: boolean
  highlighted?: boolean
  icon?: ReactNode
  shortcut?: string
}

export function MenuItem({
  children,
  onClick,
  disabled = false,
  selected = false,
  highlighted = false,
  icon,
  shortcut,
}: MenuItemProps) {
  const ctx = useContext(MenuContext)

  return (
    <li role="none">
      <button
        type="button"
        role={ctx?.itemRole ?? 'menuitem'}
        disabled={disabled}
        aria-selected={ctx?.itemRole === 'option' ? selected : undefined}
        onMouseEnter={() => ctx?.setOpenSubmenuId(null)}
        onClick={() => {
          if (disabled) return
          onClick?.()
          ctx?.closeRoot()
        }}
        className={menuItemClass({
          dense: ctx?.dense,
          selected,
          highlighted,
          disabled,
        })}
      >
        {icon ? (
          <span
            className={cn(
              'mr-4 inline-flex h-6 w-6 shrink-0 items-center justify-center',
              selected ? 'text-mui-primary' : 'text-black/54',
              disabled && 'text-black/[0.38]',
            )}
          >
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">{children}</span>
        {shortcut ? (
          <span className="ml-6 text-[0.8125rem] tracking-[0.03333em] text-black/54">
            {shortcut}
          </span>
        ) : null}
      </button>
    </li>
  )
}

export function MenuDivider() {
  return <li role="separator" className="my-2 h-px list-none bg-black/[0.12]" />
}

export type SubMenuProps = {
  label: ReactNode
  children: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

export function SubMenu({
  label,
  children,
  icon,
  disabled = false,
}: SubMenuProps) {
  const ctx = useContext(MenuContext)
  const id = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [focusOnOpen, setFocusOnOpen] = useState(false)

  const open = ctx?.openSubmenuId === id

  function openSubmenu(withFocus: boolean) {
    if (disabled || !ctx) return
    setFocusOnOpen(withFocus)
    ctx.setOpenSubmenuId(id)
  }

  return (
    <li role="none">
      <button
        ref={triggerRef}
        type="button"
        role="menuitem"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onMouseEnter={() => openSubmenu(false)}
        onClick={() => openSubmenu(false)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'Enter') {
            event.preventDefault()
            event.stopPropagation()
            openSubmenu(true)
          }
        }}
        className={menuItemClass({
          dense: ctx?.dense,
          disabled,
          open,
        })}
      >
        {icon ? (
          <span className="mr-4 inline-flex h-6 w-6 shrink-0 items-center justify-center text-black/54">
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">{label}</span>
        <span className="ml-4 inline-flex text-black/54">
          <ChevronRightIcon />
        </span>
      </button>
      <Menu
        open={Boolean(open && triggerRef.current)}
        anchorEl={triggerRef.current}
        onClose={() => ctx?.setOpenSubmenuId(null)}
        placement="right"
        dense={ctx?.dense}
        autoFocus={focusOnOpen}
        minWidth={160}
      >
        {children}
      </Menu>
    </li>
  )
}

export type MenuButtonProps = {
  label: ReactNode
  children: ReactNode
  dense?: boolean
  variant?: 'contained' | 'outlined' | 'text'
  minWidth?: number
}

export function MenuButton({
  label,
  children,
  dense,
  variant = 'text',
  minWidth,
}: MenuButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  return (
    <>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          setAnchorEl((current) => (current ? null : event.currentTarget))
        }}
        className={cn(
          'relative inline-flex items-center justify-center overflow-hidden rounded font-sans text-sm font-medium tracking-[0.02857em] uppercase',
          'min-h-[36.5px] px-2 py-[6px] text-mui-primary',
          'hover:bg-mui-primary/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mui-primary',
          variant === 'contained' &&
            'bg-mui-primary px-4 text-white shadow-mui-2 hover:bg-mui-primary-dark hover:shadow-mui-4',
          variant === 'outlined' &&
            'border border-mui-primary/50 px-4 hover:bg-mui-primary/[0.04]',
        )}
      >
        {label}
      </button>
      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        dense={dense}
        minWidth={minWidth ?? 112}
      >
        {children}
      </Menu>
    </>
  )
}
