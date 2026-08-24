import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronRightIcon } from './ChevronRightIcon'
import { cn } from './cn'

type LightMenuPlacement = 'overlay' | 'bottom' | 'right'

type LightMenuTree = {
  register: (id: string, el: HTMLElement) => () => void
  contains: (node: Node) => boolean
  closeRoot: () => void
}

type LightMenuSession = {
  close: () => void
  closeRoot: () => void
  dense: boolean
  itemRole: 'menuitem' | 'option'
  setOpenSubmenuId: (id: string | null) => void
  depth: number
}

const LightMenuSessionContext = createContext<LightMenuSession | null>(null)
const LightMenuSubmenuIdContext = createContext<string | null>(null)
const LightMenuTreeContext = createContext<LightMenuTree | null>(null)

const PAPER_CLASS =
  'group/menu light-menu-enter fixed rounded bg-white py-2 shadow-light-menu-8 outline-none contain-layout'
const ITEM_BASE =
  'relative flex w-full cursor-pointer items-center border-0 bg-transparent px-4 text-left font-sans text-base leading-[1.5] tracking-[0.00938em] text-light-menu-text outline-none select-none focus-visible:bg-black/[0.04] group-data-[allow-hover]/menu:hover:bg-black/[0.04]'
const ITEM_DENSE = 'min-h-9 py-1.5'
const ITEM_COMFORTABLE = 'min-h-12 py-[6px]'
const ITEM_HIGHLIGHTED = 'bg-black/[0.04]'
const ITEM_SELECTED =
  'bg-light-menu-primary/8 text-light-menu-primary focus-visible:bg-light-menu-primary/12 group-data-[allow-hover]/menu:hover:bg-light-menu-primary/12'
const ITEM_DISABLED = 'pointer-events-none text-black/[0.38]'

const BUTTON_BASE =
  'relative inline-flex items-center justify-center overflow-hidden rounded font-sans text-sm font-medium tracking-[0.02857em] uppercase min-h-[36.5px] px-2 py-1.5 text-light-menu-primary hover:bg-light-menu-primary/4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-menu-primary'
const BUTTON_CONTAINED =
  'bg-light-menu-primary px-4 text-white shadow-light-menu-2 hover:bg-light-menu-primary-dark hover:shadow-light-menu-4'
const BUTTON_OUTLINED =
  'border border-light-menu-primary/50 px-4 hover:bg-light-menu-primary/4'

function createMenuTree(closeRoot: () => void): LightMenuTree {
  const papers = new Map<string, HTMLElement>()

  return {
    register(id, el) {
      papers.set(id, el)
      return () => {
        papers.delete(id)
      }
    },
    contains(node) {
      for (const el of papers.values()) {
        if (el.contains(node)) return true
      }
      return false
    },
    closeRoot,
  }
}

function lightMenuItemClass({
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
    ITEM_BASE,
    dense ? ITEM_DENSE : ITEM_COMFORTABLE,
    (highlighted || open) && !selected && ITEM_HIGHLIGHTED,
    selected && ITEM_SELECTED,
    disabled && ITEM_DISABLED,
  )
}

export type LightMenuProps = {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  children: ReactNode
  dense?: boolean
  matchWidth?: boolean
  placement?: LightMenuPlacement
  minWidth?: number
  role?: 'menu' | 'listbox'
  autoFocus?: boolean
}

export function LightMenu(props: LightMenuProps) {
  if (!props.open) return null
  return <LightMenuSurface {...props} />
}

function LightMenuSurface({
  anchorEl,
  onClose,
  children,
  dense = false,
  matchWidth = false,
  placement = 'overlay',
  minWidth = 112,
  role = 'menu',
  autoFocus = false,
}: LightMenuProps) {
  const menuId = useId()
  const paperRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const parentTree = useContext(LightMenuTreeContext)
  const parentSession = useContext(LightMenuSessionContext)
  const treeRef = useRef<LightMenuTree | null>(null)
  if (!parentTree && !treeRef.current) {
    treeRef.current = createMenuTree(() => onCloseRef.current())
  }
  const tree = parentTree ?? treeRef.current!
  const isRoot = !parentTree
  const depth = (parentSession?.depth ?? -1) + 1

  const [style, setStyle] = useState<CSSProperties>({})
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null)
  const [allowHover, setAllowHover] = useState(false)

  const session = useMemo<LightMenuSession>(
    () => ({
      close: () => onCloseRef.current(),
      closeRoot: () => tree.closeRoot(),
      dense,
      itemRole: role === 'listbox' ? 'option' : 'menuitem',
      setOpenSubmenuId,
      depth,
    }),
    [dense, role, depth, tree],
  )

  useLayoutEffect(() => {
    if (!anchorEl) return
    const paper = paperRef.current
    if (!paper) return

    const unregister = tree.register(menuId, paper)

    const place = () => {
      const rect = anchorEl.getBoundingClientRect()
      const paperRect = paper.getBoundingClientRect()
      const width = paperRect.width || minWidth
      const height = paperRect.height

      let top =
        placement === 'bottom'
          ? rect.bottom + 4
          : placement === 'right'
            ? rect.top
            : rect.top
      let left = placement === 'right' ? rect.right - 2 : rect.left

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
    if (autoFocus) {
      paper
        .querySelector<HTMLButtonElement>(
          '[role="menuitem"]:not(:disabled), [role="option"]:not(:disabled)',
        )
        ?.focus()
    } else if (role === 'menu') {
      paper.focus({ preventScroll: true })
    }
    // Viewport events are not in React's synthetic system: resize has no
    // element target, and scroll does not bubble (hence capture: true).
    window.addEventListener('resize', place, { passive: true })
    window.addEventListener('scroll', place, { capture: true, passive: true })
    return () => {
      unregister()
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [anchorEl, matchWidth, minWidth, placement, depth, tree, menuId, autoFocus, role])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!isRoot) return
      const target = event.target as Node
      if (tree.contains(target)) return
      if (anchorEl?.contains(target)) return
      tree.closeRoot()
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [anchorEl, isRoot, tree])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onCloseRef.current()
      anchorEl?.focus()
      return
    }

    if (event.key === 'Tab') {
      tree.closeRoot()
      return
    }

    if (role !== 'menu') return

    const enabled = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not(:disabled), [role="option"]:not(:disabled)',
      ),
    )
    const current = enabled.findIndex((item) => item === document.activeElement)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()
      const next = current < 0 ? 0 : (current + 1) % enabled.length
      enabled[next]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      const next =
        current < 0
          ? enabled.length - 1
          : (current - 1 + enabled.length) % enabled.length
      enabled[next]?.focus()
    } else if (event.key === 'Home') {
      event.preventDefault()
      event.stopPropagation()
      enabled[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      event.stopPropagation()
      enabled.at(-1)?.focus()
    } else if (event.key === 'ArrowLeft' && !isRoot) {
      event.preventDefault()
      event.stopPropagation()
      onCloseRef.current()
      anchorEl?.focus()
    }
  }

  const paper = (
    <LightMenuSessionContext.Provider value={session}>
      <LightMenuSubmenuIdContext.Provider value={openSubmenuId}>
        <div
          ref={paperRef}
          role={role}
          tabIndex={-1}
          style={style}
          data-allow-hover={allowHover ? '' : undefined}
          className={cn(PAPER_CLASS, matchWidth ? 'origin-top' : 'origin-top-left')}
          onKeyDown={handleKeyDown}
          onPointerMove={() => {
            if (!allowHover) setAllowHover(true)
          }}
        >
          <ul className="m-0 max-h-[calc(100vh-96px)] list-none overflow-auto p-0">
            {children}
          </ul>
        </div>
      </LightMenuSubmenuIdContext.Provider>
    </LightMenuSessionContext.Provider>
  )

  const portaled = createPortal(paper, document.body)
  if (isRoot) {
    return (
      <LightMenuTreeContext.Provider value={tree}>{portaled}</LightMenuTreeContext.Provider>
    )
  }
  return portaled
}

export type LightMenuItemProps = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  selected?: boolean
  highlighted?: boolean
  icon?: ReactNode
  shortcut?: string
}

export const LightMenuItem = memo(function LightMenuItem({
  children,
  onClick,
  disabled = false,
  selected = false,
  highlighted = false,
  icon,
  shortcut,
}: LightMenuItemProps) {
  const session = useContext(LightMenuSessionContext)

  return (
    <li role="none">
      <button
        type="button"
        role={session?.itemRole ?? 'menuitem'}
        disabled={disabled}
        aria-selected={session?.itemRole === 'option' ? selected : undefined}
        onMouseEnter={() => session?.setOpenSubmenuId(null)}
        onClick={() => {
          if (disabled) return
          onClick?.()
          session?.closeRoot()
        }}
        className={lightMenuItemClass({
          dense: session?.dense,
          selected,
          highlighted,
          disabled,
        })}
      >
        {icon ? (
          <span
            className={cn(
              'mr-4 inline-flex h-6 w-6 shrink-0 items-center justify-center',
              selected ? 'text-light-menu-primary' : 'text-black/54',
              disabled && 'text-black/38',
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
})

export const LightMenuDivider = memo(function LightMenuDivider() {
  return <li role="separator" className="my-2 h-px list-none bg-black/12" />
})

export type LightMenuSubMenuProps = {
  label: ReactNode
  children: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

export const LightMenuSubMenu = memo(function LightMenuSubMenu({
  label,
  children,
  icon,
  disabled = false,
}: LightMenuSubMenuProps) {
  const session = useContext(LightMenuSessionContext)
  const openSubmenuId = useContext(LightMenuSubmenuIdContext)
  const id = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [focusOnOpen, setFocusOnOpen] = useState(false)

  const open = openSubmenuId === id

  const closeSubmenu = useCallback(() => {
    session?.setOpenSubmenuId(null)
  }, [session])

  function openSubmenu(withFocus: boolean) {
    if (disabled || !session) return
    setFocusOnOpen(withFocus)
    session.setOpenSubmenuId(id)
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
        className={lightMenuItemClass({
          dense: session?.dense,
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
      {open ? (
        <LightMenu
          open
          anchorEl={triggerRef.current}
          onClose={closeSubmenu}
          placement="right"
          dense={session?.dense}
          autoFocus={focusOnOpen}
          minWidth={160}
        >
          {children}
        </LightMenu>
      ) : null}
    </li>
  )
})

export type LightMenuButtonProps = {
  label: ReactNode
  children: ReactNode
  dense?: boolean
  variant?: 'contained' | 'outlined' | 'text'
  minWidth?: number
}

export const LightMenuButton = memo(function LightMenuButton({
  label,
  children,
  dense,
  variant = 'text',
  minWidth,
}: LightMenuButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const close = useCallback(() => setAnchorEl(null), [])

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
          BUTTON_BASE,
          variant === 'contained' && BUTTON_CONTAINED,
          variant === 'outlined' && BUTTON_OUTLINED,
        )}
      >
        {label}
      </button>
      {open ? (
        <LightMenu
          open
          anchorEl={anchorEl}
          onClose={close}
          dense={dense}
          minWidth={minWidth ?? 112}
        >
          {children}
        </LightMenu>
      ) : null}
    </>
  )
})
