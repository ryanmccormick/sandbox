import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from './Select'

const ages = [
  { value: '', label: 'None' },
  { value: '10', label: 'Ten' },
  { value: '20', label: 'Twenty' },
  { value: '30', label: 'Thirty', disabled: true },
]

describe('Select', () => {
  it('shows the label, helper text, and selected value', () => {
    render(
      <Select
        label="Age"
        value="20"
        onChange={jest.fn()}
        options={ages}
        helperText="Please select your age"
      />,
    )

    expect(screen.getByRole('button', { name: 'Age' })).toHaveTextContent('Twenty')
    expect(screen.getByText('Please select your age')).toBeInTheDocument()
    expect(screen.getByLabelText('Age')).toBeInTheDocument()
  })

  it('opens a listbox and reports the chosen option', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(<Select label="Age" value="" onChange={onChange} options={ages} />)

    await user.click(screen.getByRole('button', { name: 'Age' }))
    expect(await screen.findByRole('listbox')).toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: 'Ten' }))
    expect(onChange).toHaveBeenCalledWith('10')
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  it('does not open when disabled', async () => {
    const user = userEvent.setup()

    render(
      <Select
        label="Age"
        value=""
        onChange={jest.fn()}
        options={ages}
        disabled
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Age' })
    expect(trigger).toBeDisabled()
    await user.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('selects the highlighted option with the keyboard', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(<Select label="Age" value="" onChange={onChange} options={ages} />)

    screen.getByRole('button', { name: 'Age' }).focus()
    await user.keyboard('{ArrowDown}')
    expect(await screen.findByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenCalledWith('10')
  })

  it('does not choose a disabled option', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(<Select label="Age" value="10" onChange={onChange} options={ages} />)

    await user.click(screen.getByRole('button', { name: 'Age' }))
    await user.click(await screen.findByRole('option', { name: 'Thirty' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('closes on Escape without changing the value', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(<Select label="Age" value="20" onChange={onChange} options={ages} />)

    await user.click(screen.getByRole('button', { name: 'Age' }))
    await screen.findByRole('listbox')
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Age' })).toHaveFocus()
  })
})
