import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LeadRow from './LeadRow'

const lead = { id: '1', company: 'Acme', contact: 'Jane', status: 'Applied', lastUpdated: '2026-04-09' }

describe('LeadRow', () => {
  it('renders company, contact, status dropdown, and date', () => {
    render(<table><tbody><LeadRow lead={lead} onStatusChange={vi.fn()} /></tbody></table>)
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveValue('Applied')
    expect(screen.getByText('2026-04-09')).toBeInTheDocument()
  })

  it('renders — when contact is empty', () => {
    render(<table><tbody><LeadRow lead={{ ...lead, contact: '' }} onStatusChange={vi.fn()} /></tbody></table>)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('calls onStatusChange with lead id and new status when dropdown changes', async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn()
    render(<table><tbody><LeadRow lead={lead} onStatusChange={onStatusChange} /></tbody></table>)
    await user.selectOptions(screen.getByRole('combobox'), 'Interview')
    expect(onStatusChange).toHaveBeenCalledWith('1', 'Interview')
  })
})
