import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

describe('App', () => {
  it('renders the page heading', () => {
    render(<App />)
    expect(screen.getByText('Job Search Tracker')).toBeInTheDocument()
  })

  it('loads leads from localStorage on mount', () => {
    const leads = [
      { id: '1', company: 'Acme', contact: '', status: 'Applied', lastUpdated: '2026-04-01' },
    ]
    localStorage.setItem('jobs-tracker-leads', JSON.stringify(leads))
    render(<App />)
    expect(screen.getByText('Acme')).toBeInTheDocument()
  })

  it('persists a new lead to localStorage after adding', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByPlaceholderText('Company *'), 'Globex')
    await user.click(screen.getByRole('button', { name: /add/i }))
    const stored = JSON.parse(localStorage.getItem('jobs-tracker-leads'))
    expect(stored).toHaveLength(1)
    expect(stored[0].company).toBe('Globex')
  })

  it('persists a status change to localStorage', async () => {
    const user = userEvent.setup()
    const leads = [
      { id: '1', company: 'Acme', contact: '', status: 'Applied', lastUpdated: '2026-04-01' },
    ]
    localStorage.setItem('jobs-tracker-leads', JSON.stringify(leads))
    render(<App />)
    const rowSelect = screen.getAllByRole('combobox').find(el => el.value === 'Applied')
    await user.selectOptions(rowSelect, 'Interview')
    const stored = JSON.parse(localStorage.getItem('jobs-tracker-leads'))
    expect(stored[0].status).toBe('Interview')
  })
})
