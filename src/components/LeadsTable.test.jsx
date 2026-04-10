import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LeadsTable from './LeadsTable'

const leads = [
  { id: '1', company: 'Zebra', contact: 'Bob', status: 'Applied', lastUpdated: '2026-04-07' },
  { id: '2', company: 'Acme', contact: 'Ann', status: 'Interview', lastUpdated: '2026-04-09' },
]

describe('LeadsTable', () => {
  it('renders all leads', () => {
    render(<LeadsTable leads={leads} sortConfig={{ column: 'lastUpdated', direction: 'desc' }} onSort={vi.fn()} onStatusChange={vi.fn()} />)
    expect(screen.getByText('Zebra')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
  })

  it('sorts by lastUpdated desc — Acme (Apr 9) appears before Zebra (Apr 7)', () => {
    render(<LeadsTable leads={leads} sortConfig={{ column: 'lastUpdated', direction: 'desc' }} onSort={vi.fn()} onStatusChange={vi.fn()} />)
    const rows = screen.getAllByRole('row')
    // rows[0] is the header row; rows[1] is first data row
    expect(rows[1]).toHaveTextContent('Acme')
    expect(rows[2]).toHaveTextContent('Zebra')
  })

  it('calls onSort with the column key when a header is clicked', async () => {
    const user = userEvent.setup()
    const onSort = vi.fn()
    render(<LeadsTable leads={leads} sortConfig={{ column: 'lastUpdated', direction: 'desc' }} onSort={onSort} onStatusChange={vi.fn()} />)
    await user.click(screen.getByText(/^Company/))
    expect(onSort).toHaveBeenCalledWith('company')
  })

  it('shows ↑ indicator on active asc column', () => {
    render(<LeadsTable leads={leads} sortConfig={{ column: 'company', direction: 'asc' }} onSort={vi.fn()} onStatusChange={vi.fn()} />)
    expect(screen.getByText('Company ↑')).toBeInTheDocument()
  })

  it('shows ↓ indicator on active desc column', () => {
    render(<LeadsTable leads={leads} sortConfig={{ column: 'company', direction: 'desc' }} onSort={vi.fn()} onStatusChange={vi.fn()} />)
    expect(screen.getByText('Company ↓')).toBeInTheDocument()
  })

  it('renders empty table body when leads array is empty', () => {
    render(<LeadsTable leads={[]} sortConfig={{ column: 'lastUpdated', direction: 'desc' }} onSort={vi.fn()} onStatusChange={vi.fn()} />)
    expect(screen.getAllByRole('row')).toHaveLength(1) // header only
  })
})
