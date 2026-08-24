import { useState } from 'react'
import { Button } from './components/Button'
import {
  CheckIcon,
  DraftsIcon,
  InboxIcon,
  LogoutIcon,
  PersonIcon,
  SendIcon,
  SettingsIcon,
} from './components/icons'
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  SubMenu,
} from './components/Menu'
import { Select } from './components/Select'

const ages = [
  { value: '', label: 'None' },
  { value: '10', label: 'Ten' },
  { value: '20', label: 'Twenty' },
  { value: '30', label: 'Thirty' },
]

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'jp', label: 'Japan' },
  { value: 'br', label: 'Brazil', disabled: true },
]

export default function App() {
  const [age, setAge] = useState<string | ''>('')
  const [filled, setFilled] = useState<string | ''>('20')
  const [standard, setStandard] = useState<string | ''>('')
  const [small, setSmall] = useState<string | ''>('10')
  const [country, setCountry] = useState<string | ''>('')
  const [selected, setSelected] = useState('Profile')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  return (
    <div className="min-h-svh bg-[#f5f5f5] font-sans text-mui-text">
      <header className="border-b border-black/[0.12] bg-[#1976d2] px-6 py-8 text-white shadow-mui-4">
        <p className="m-0 text-sm font-medium tracking-[0.1em] uppercase opacity-80">
          Tailwind CSS only
        </p>
        <h1 className="mt-1 mb-2 font-sans text-[2.125rem] leading-[1.235] font-normal tracking-[0.00735em]">
          Dropdown menu
        </h1>
        <p className="m-0 max-w-xl text-base leading-6 text-white/80">
          Material UI Select and Menu, rebuilt with React and Tailwind — same
          outlined notch, paper elevation, Roboto type, and grow animation. No
          MUI, Headless UI, or Radix.
        </p>
      </header>

      <main className="mx-auto flex max-w-[920px] flex-col gap-6 px-4 py-8">
        <section className="rounded bg-white p-6 shadow-mui-1">
          <h2 className="mt-0 mb-1 font-sans text-xl font-normal tracking-[0.00735em]">
            Basic select
          </h2>
          <p className="mt-0 mb-6 text-sm text-black/60">
            Outlined field with a floating label and notched border, matching
            MUI&apos;s default Select.
          </p>
          <div className="flex flex-wrap items-start gap-6">
            <Select
              label="Age"
              value={age}
              onChange={setAge}
              options={ages}
              helperText={age ? `Selected: ${age}` : 'Please select your age'}
            />
            <Select
              label="Age"
              value={age}
              onChange={setAge}
              options={ages}
              error={!age}
              helperText={!age ? 'This field is required' : 'Looks good'}
            />
            <Select label="Disabled" value="20" onChange={() => {}} options={ages} disabled />
          </div>
        </section>

        <section className="rounded bg-white p-6 shadow-mui-1">
          <h2 className="mt-0 mb-1 font-sans text-xl font-normal tracking-[0.00735em]">
            Variants and sizes
          </h2>
          <p className="mt-0 mb-6 text-sm text-black/60">
            Outlined, filled, and standard — plus a compact 40px size.
          </p>
          <div className="flex flex-wrap items-start gap-6">
            <Select
              label="Filled"
              variant="filled"
              value={filled}
              onChange={setFilled}
              options={ages}
            />
            <Select
              label="Standard"
              variant="standard"
              value={standard}
              onChange={setStandard}
              options={ages}
            />
            <Select
              label="Small"
              size="small"
              value={small}
              onChange={setSmall}
              options={ages}
            />
            <Select
              label="Country"
              value={country}
              onChange={setCountry}
              options={countries}
              className="min-w-[220px]"
              helperText="Brazil is disabled"
            />
          </div>
        </section>

        <section className="rounded bg-white p-6 shadow-mui-1">
          <h2 className="mt-0 mb-1 font-sans text-xl font-normal tracking-[0.00735em]">
            Basic menu
          </h2>
          <p className="mt-0 mb-6 text-sm text-black/60">
            MUI Menu opens from the trigger&apos;s top-left and overlays the
            button. Keyboard: arrows, Enter, Escape.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <MenuButton label="Dashboard">
              <MenuItem>Profile</MenuItem>
              <MenuItem>My account</MenuItem>
              <MenuDivider />
              <MenuItem>Logout</MenuItem>
            </MenuButton>

            <Button
              variant="contained"
              onClick={(event) =>
                setAnchorEl((current) =>
                  current ? null : event.currentTarget,
                )
              }
            >
              Open menu
            </Button>
            <Menu
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem icon={<SendIcon />} shortcut="⌘X">
                Cut
              </MenuItem>
              <MenuItem icon={<DraftsIcon />} shortcut="⌘C">
                Copy
              </MenuItem>
              <MenuItem icon={<InboxIcon />} shortcut="⌘V">
                Paste
              </MenuItem>
              <MenuDivider />
              <MenuItem disabled>Web Clipboard</MenuItem>
            </Menu>
          </div>
        </section>

        <section className="rounded bg-white p-6 shadow-mui-1">
          <h2 className="mt-0 mb-1 font-sans text-xl font-normal tracking-[0.00735em]">
            Nested menu
          </h2>
          <p className="mt-0 mb-6 text-sm text-black/60">
            Hover or press Arrow Right on an item with a chevron. Nested paper
            opens to the side; Escape or Arrow Left closes one level.
          </p>
          <div className="flex flex-wrap items-start gap-8">
            <MenuButton label="Options" variant="contained" minWidth={200}>
              <MenuItem>New file</MenuItem>
              <MenuItem>Save</MenuItem>
              <MenuDivider />
              <SubMenu label="Export">
                <MenuItem>PDF</MenuItem>
                <MenuItem>PNG</MenuItem>
                <SubMenu label="SVG">
                  <MenuItem>Optimized</MenuItem>
                  <MenuItem>Original</MenuItem>
                </SubMenu>
              </SubMenu>
              <SubMenu label="Share">
                <MenuItem>Email</MenuItem>
                <MenuItem>Copy link</MenuItem>
                <MenuItem disabled>Embed</MenuItem>
              </SubMenu>
              <MenuDivider />
              <MenuItem>Delete</MenuItem>
            </MenuButton>

            <MenuButton label="Account" variant="outlined" minWidth={220}>
              <MenuItem icon={<PersonIcon />}>Profile</MenuItem>
              <SubMenu label="Settings" icon={<SettingsIcon />}>
                <MenuItem>Account</MenuItem>
                <MenuItem>Appearance</MenuItem>
                <SubMenu label="Notifications">
                  <MenuItem>Email</MenuItem>
                  <MenuItem>Push</MenuItem>
                  <MenuItem>SMS</MenuItem>
                </SubMenu>
              </SubMenu>
              <MenuDivider />
              <MenuItem icon={<LogoutIcon />}>Logout</MenuItem>
            </MenuButton>
          </div>
        </section>

        <section className="rounded bg-white p-6 shadow-mui-1">
          <h2 className="mt-0 mb-1 font-sans text-xl font-normal tracking-[0.00735em]">
            Icon menu and selected item
          </h2>
          <p className="mt-0 mb-6 text-sm text-black/60">
            Leading icons, selected state in primary blue, and a dense list.
          </p>
          <div className="flex flex-wrap items-start gap-8">
            <MenuButton label="Account" variant="outlined">
              <MenuItem icon={<PersonIcon />}>Profile</MenuItem>
              <MenuItem icon={<SettingsIcon />}>My account</MenuItem>
              <MenuDivider />
              <MenuItem icon={<LogoutIcon />}>Logout</MenuItem>
            </MenuButton>

            <div>
              <p className="mt-0 mb-2 text-sm text-black/60">Selected menu</p>
              <MenuButton label={selected} variant="contained">
                {['Profile', 'My account', 'Logout'].map((item) => (
                  <MenuItem
                    key={item}
                    selected={selected === item}
                    icon={selected === item ? <CheckIcon /> : <span className="w-5" />}
                    onClick={() => setSelected(item)}
                  >
                    {item}
                  </MenuItem>
                ))}
              </MenuButton>
            </div>

            <div>
              <p className="mt-0 mb-2 text-sm text-black/60">Dense</p>
              <MenuButton label="Dense menu" dense>
                <MenuItem>New file</MenuItem>
                <MenuItem>New folder</MenuItem>
                <MenuItem>Open recent</MenuItem>
                <MenuDivider />
                <MenuItem>Save</MenuItem>
                <MenuItem>Save as…</MenuItem>
              </MenuButton>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
