import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState, type ReactNode } from 'react'
import {
  LightMenu,
  LightMenuButton,
  LightMenuDivider,
  LightMenuItem,
  LightMenuSubMenu,
} from 'light-menu'

function OpenMenu({
  onClose = jest.fn(),
  children,
  role,
}: {
  onClose?: () => void
  children: ReactNode
  role?: 'menu' | 'listbox'
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  return (
    <div>
      <button type="button" ref={setAnchorEl}>
        Anchor
      </button>
      <button type="button">Outside</button>
      {anchorEl ? (
        <LightMenu open anchorEl={anchorEl} onClose={onClose} role={role}>
          {children}
        </LightMenu>
      ) : null}
    </div>
  )
}

describe('LightMenu', () => {
  it('does not render while closed', () => {
    render(
      <LightMenu open={false} anchorEl={null} onClose={jest.fn()}>
        <LightMenuItem>Profile</LightMenuItem>
      </LightMenu>,
    )

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('does not attach document or window listeners for closed instances', () => {
    const documentAdd = jest.spyOn(document, 'addEventListener')
    const windowAdd = jest.spyOn(window, 'addEventListener')

    render(
      <>
        {Array.from({ length: 40 }, (_, index) => (
          <LightMenuButton key={index} label={`Menu ${index}`}>
            <LightMenuItem>Profile</LightMenuItem>
          </LightMenuButton>
        ))}
      </>,
    )

    expect(
      documentAdd.mock.calls.filter(([type]) => type === 'pointerdown'),
    ).toHaveLength(0)
    expect(
      windowAdd.mock.calls.filter(
        ([type]) => type === 'scroll' || type === 'resize',
      ),
    ).toHaveLength(0)
    documentAdd.mockRestore()
    windowAdd.mockRestore()
  })

  it('renders items when open', async () => {
    render(
      <OpenMenu>
        <LightMenuItem>Profile</LightMenuItem>
        <LightMenuItem>My account</LightMenuItem>
      </OpenMenu>,
    )

    expect(await screen.findByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'My account' })).toBeInTheDocument()
  })

  it('calls onClick and closes the tree when an item is chosen', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    const onClose = jest.fn()

    render(
      <OpenMenu onClose={onClose}>
        <LightMenuItem onClick={onClick}>Profile</LightMenuItem>
      </OpenMenu>,
    )

    await user.click(await screen.findByRole('menuitem', { name: 'Profile' }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not select a disabled item', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    const onClose = jest.fn()

    render(
      <OpenMenu onClose={onClose}>
        <LightMenuItem>Profile</LightMenuItem>
        <LightMenuItem disabled onClick={onClick}>
          Logout
        </LightMenuItem>
      </OpenMenu>,
    )

    const item = await screen.findByRole('menuitem', { name: 'Logout' })
    expect(item).toBeDisabled()
    await user.click(item)

    expect(onClick).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes on Escape and returns focus to the anchor', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    render(
      <OpenMenu onClose={onClose}>
        <LightMenuItem>Profile</LightMenuItem>
      </OpenMenu>,
    )

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Profile' })).toHaveFocus()
    })
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Anchor' })).toHaveFocus()
  })

  it('closes when clicking outside the paper', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    render(
      <OpenMenu onClose={onClose}>
        <LightMenuItem>Profile</LightMenuItem>
      </OpenMenu>,
    )

    await screen.findByRole('menu')
    await user.click(screen.getByRole('button', { name: 'Outside' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('moves focus with arrow, Home, and End keys', async () => {
    const user = userEvent.setup()

    render(
      <OpenMenu>
        <LightMenuItem>Profile</LightMenuItem>
        <LightMenuItem>My account</LightMenuItem>
        <LightMenuItem>Logout</LightMenuItem>
      </OpenMenu>,
    )

    const profile = await screen.findByRole('menuitem', { name: 'Profile' })
    await waitFor(() => expect(profile).toHaveFocus())

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'My account' })).toHaveFocus()

    await user.keyboard('{End}')
    expect(screen.getByRole('menuitem', { name: 'Logout' })).toHaveFocus()

    await user.keyboard('{Home}')
    expect(profile).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('menuitem', { name: 'Logout' })).toHaveFocus()
  })

  it('renders a divider as a separator', async () => {
    render(
      <OpenMenu>
        <LightMenuItem>Profile</LightMenuItem>
        <LightMenuDivider />
        <LightMenuItem>Logout</LightMenuItem>
      </OpenMenu>,
    )

    expect(await screen.findByRole('separator')).toBeInTheDocument()
  })

  it('exposes listbox options and selected state', async () => {
    render(
      <OpenMenu role="listbox">
        <LightMenuItem selected>Ten</LightMenuItem>
        <LightMenuItem>Twenty</LightMenuItem>
      </OpenMenu>,
    )

    expect(await screen.findByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Ten' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('option', { name: 'Twenty' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })
})

describe('LightMenuButton', () => {
  it('toggles the menu and closes after a selection', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()

    render(
      <LightMenuButton label="Dashboard">
        <LightMenuItem onClick={onClick}>Profile</LightMenuItem>
        <LightMenuItem>Logout</LightMenuItem>
      </LightMenuButton>,
    )

    const trigger = screen.getByRole('button', { name: 'Dashboard' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(await screen.findByRole('menu')).toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: 'Profile' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('LightMenuSubMenu', () => {
  function NestedMenu() {
    return (
      <OpenMenu>
        <LightMenuItem>Cut</LightMenuItem>
        <LightMenuSubMenu label="Export">
          <LightMenuItem>SVG</LightMenuItem>
          <LightMenuItem>PNG</LightMenuItem>
        </LightMenuSubMenu>
      </OpenMenu>
    )
  }

  it('opens a nested menu on hover', async () => {
    const user = userEvent.setup()
    render(<NestedMenu />)

    const exportItem = await screen.findByRole('menuitem', { name: 'Export' })
    expect(exportItem).toHaveAttribute('aria-expanded', 'false')

    await user.hover(exportItem)

    expect(await screen.findByRole('menuitem', { name: 'SVG' })).toBeInTheDocument()
    expect(exportItem).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('menu')).toHaveLength(2)
  })

  it('opens a nested menu with ArrowRight and focuses the first item', async () => {
    const user = userEvent.setup()
    render(<NestedMenu />)

    const exportItem = await screen.findByRole('menuitem', { name: 'Export' })
    exportItem.focus()
    await user.keyboard('{ArrowRight}')

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'SVG' })).toHaveFocus()
    })
  })

  it('closes only the nested menu on Escape', async () => {
    const user = userEvent.setup()
    render(<NestedMenu />)

    await user.hover(await screen.findByRole('menuitem', { name: 'Export' }))
    const svg = await screen.findByRole('menuitem', { name: 'SVG' })
    svg.focus()
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'SVG' })).not.toBeInTheDocument()
    })
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Export' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})
