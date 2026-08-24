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
  LightMenu,
  LightMenuButton,
  LightMenuDivider,
  LightMenuItem,
  LightMenuSubMenu,
} from 'light-menu'
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
    <div className="min-h-svh bg-[#f5f5f5] font-sans text-light-menu-text">
      <header className="border-b border-black/[0.12] bg-[#1976d2] px-6 py-8 text-white shadow-light-menu-4">
        <p className="m-0 text-sm font-medium tracking-[0.1em] uppercase opacity-80">
          Tailwind CSS only
        </p>
        <h1 className="mt-1 mb-2 font-sans text-[2.125rem] leading-[1.235] font-normal tracking-[0.00735em]">
          Dropdown menu
        </h1>
        <p className="m-0 max-w-xl text-base leading-6 text-white/80">
          Light Menu select and dropdown, rebuilt with React and Tailwind — same
          outlined notch, paper elevation, Roboto type, and grow animation. No
          extra UI libraries.
        </p>
      </header>

      <main className="mx-auto flex max-w-[920px] flex-col gap-6 px-4 py-8">
        <section className="rounded bg-white p-6 shadow-light-menu-1">
          <h2 className="mt-0 mb-1 font-sans text-xl font-normal tracking-[0.00735em]">
            Basic select
          </h2>
          <p className="mt-0 mb-6 text-sm text-black/60">
            Outlined field with a floating label and notched border, matching
            the default Light Menu select.
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

        <section className="rounded bg-white p-6 shadow-light-menu-1">
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

        <section className="rounded bg-white p-6 shadow-light-menu-1">
          <h2 className="mt-0 mb-1 font-sans text-xl font-normal tracking-[0.00735em]">
            Basic menu
          </h2>
          <p className="mt-0 mb-6 text-sm text-black/60">
            The menu opens from the trigger&apos;s top-left and overlays the
            button. Keyboard: arrows, Enter, Escape.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <LightMenuButton label="Dashboard">
              <LightMenuItem>Profile</LightMenuItem>
              <LightMenuItem>My account</LightMenuItem>
              <LightMenuDivider />
              <LightMenuItem>Logout</LightMenuItem>
            </LightMenuButton>

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
            <LightMenu
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
            >
              <LightMenuItem icon={<SendIcon />} shortcut="⌘X">
                Cut
              </LightMenuItem>
              <LightMenuItem icon={<DraftsIcon />} shortcut="⌘C">
                Copy
              </LightMenuItem>
              <LightMenuItem icon={<InboxIcon />} shortcut="⌘V">
                Paste
              </LightMenuItem>
              <LightMenuDivider />
              <LightMenuItem disabled>Web Clipboard</LightMenuItem>
            </LightMenu>
          </div>
        </section>

        <section className="rounded bg-white p-6 shadow-light-menu-1">
          <h2 className="mt-0 mb-1 font-sans text-xl font-normal tracking-[0.00735em]">
            Nested menu
          </h2>
          <p className="mt-0 mb-6 text-sm text-black/60">
            Hover or press Arrow Right on an item with a chevron. Nested paper
            opens to the side; Escape or Arrow Left closes one level.
          </p>
          <div className="flex flex-wrap items-start gap-8">
            <LightMenuButton label="Options" variant="contained" minWidth={200}>
              <LightMenuItem>New file</LightMenuItem>
              <LightMenuItem>Save</LightMenuItem>
              <LightMenuDivider />
              <LightMenuSubMenu label="Export">
                <LightMenuItem>PDF</LightMenuItem>
                <LightMenuItem>PNG</LightMenuItem>
                <LightMenuSubMenu label="SVG">
                  <LightMenuItem>Optimized</LightMenuItem>
                  <LightMenuItem>Original</LightMenuItem>
                </LightMenuSubMenu>
              </LightMenuSubMenu>
              <LightMenuSubMenu label="Share">
                <LightMenuItem>Email</LightMenuItem>
                <LightMenuItem>Copy link</LightMenuItem>
                <LightMenuItem disabled>Embed</LightMenuItem>
              </LightMenuSubMenu>
              <LightMenuDivider />
              <LightMenuItem>Delete</LightMenuItem>
            </LightMenuButton>

            <LightMenuButton label="Account" variant="outlined" minWidth={220}>
              <LightMenuItem icon={<PersonIcon />}>Profile</LightMenuItem>
              <LightMenuSubMenu label="Settings" icon={<SettingsIcon />}>
                <LightMenuItem>Account</LightMenuItem>
                <LightMenuItem>Appearance</LightMenuItem>
                <LightMenuSubMenu label="Notifications">
                  <LightMenuItem>Email</LightMenuItem>
                  <LightMenuItem>Push</LightMenuItem>
                  <LightMenuItem>SMS</LightMenuItem>
                </LightMenuSubMenu>
              </LightMenuSubMenu>
              <LightMenuDivider />
              <LightMenuItem icon={<LogoutIcon />}>Logout</LightMenuItem>
            </LightMenuButton>
          </div>
        </section>

        <section className="rounded bg-white p-6 shadow-light-menu-1">
          <h2 className="mt-0 mb-1 font-sans text-xl font-normal tracking-[0.00735em]">
            Icon menu and selected item
          </h2>
          <p className="mt-0 mb-6 text-sm text-black/60">
            Leading icons, selected state in primary blue, and a dense list.
          </p>
          <div className="flex flex-wrap items-start gap-8">
            <LightMenuButton label="Account" variant="outlined">
              <LightMenuItem icon={<PersonIcon />}>Profile</LightMenuItem>
              <LightMenuItem icon={<SettingsIcon />}>My account</LightMenuItem>
              <LightMenuDivider />
              <LightMenuItem icon={<LogoutIcon />}>Logout</LightMenuItem>
            </LightMenuButton>

            <div>
              <p className="mt-0 mb-2 text-sm text-black/60">Selected menu</p>
              <LightMenuButton label={selected} variant="contained">
                {['Profile', 'My account', 'Logout'].map((item) => (
                  <LightMenuItem
                    key={item}
                    selected={selected === item}
                    icon={selected === item ? <CheckIcon /> : <span className="w-5" />}
                    onClick={() => setSelected(item)}
                  >
                    {item}
                  </LightMenuItem>
                ))}
              </LightMenuButton>
            </div>

            <div>
              <p className="mt-0 mb-2 text-sm text-black/60">Dense</p>
              <LightMenuButton label="Dense menu" dense>
                <LightMenuItem>New file</LightMenuItem>
                <LightMenuItem>New folder</LightMenuItem>
                <LightMenuItem>Open recent</LightMenuItem>
                <LightMenuDivider />
                <LightMenuItem>Save</LightMenuItem>
                <LightMenuItem>Save as…</LightMenuItem>
              </LightMenuButton>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
