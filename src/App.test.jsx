import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

vi.mock('./api', () => ({
  fetchLeads: vi.fn(),
  persistLeads: vi.fn(),
}))

import { fetchLeads, persistLeads } from './api'

beforeEach(() => {
  vi.clearAllMocks()
  fetchLeads.mockResolvedValue([])
  persistLeads.mockResolvedValue(undefined)
})

describe('App', () => {
  it('shows loading state then renders heading', async () => {
    fetchLeads.mockResolvedValue([])
    render(<App />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Job Search Tracker')).toBeInTheDocument())
  })

  it('renders leads returned by fetchLeads', async () => {
    fetchLeads.mockResolvedValue([
      { id: '1', company: 'Acme', contact: '', status: 'Applied', lastUpdated: '2026-04-01' },
    ])
    render(<App />)
    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument())
  })

  it('calls persistLeads when a lead is added', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => screen.getByPlaceholderText('Company *'))
    await user.type(screen.getByPlaceholderText('Company *'), 'Globex')
    await user.click(screen.getByRole('button', { name: /add/i }))
    expect(persistLeads).toHaveBeenCalledOnce()
    expect(persistLeads.mock.calls[0][0][0].company).toBe('Globex')
  })

  it('calls persistLeads when a status is changed', async () => {
    const user = userEvent.setup()
    fetchLeads.mockResolvedValue([
      { id: '1', company: 'Acme', contact: '', status: 'Applied', lastUpdated: '2026-04-01' },
    ])
    render(<App />)
    await waitFor(() => screen.getByText('Acme'))
    const rowSelect = screen.getAllByRole('combobox').find(el => el.value === 'Applied')
    await user.selectOptions(rowSelect, 'Interview')
    expect(persistLeads).toHaveBeenCalledOnce()
    expect(persistLeads.mock.calls[0][0][0].status).toBe('Interview')
  })

  it('shows error banner when fetchLeads fails', async () => {
    fetchLeads.mockRejectedValue(new Error('Failed to fetch leads: 401'))
    render(<App />)
    await waitFor(() => expect(screen.getByText(/failed to fetch leads/i)).toBeInTheDocument())
  })
})
