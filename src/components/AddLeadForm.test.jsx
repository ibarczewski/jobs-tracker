import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddLeadForm from './AddLeadForm'

describe('AddLeadForm', () => {
  it('renders company input, contact input, status select, and Add button', () => {
    render(<AddLeadForm onAdd={vi.fn()} />)
    expect(screen.getByPlaceholderText('Company *')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Contact')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })

  it('calls onAdd with correct shape when submitted with company only', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<AddLeadForm onAdd={onAdd} />)
    await user.type(screen.getByPlaceholderText('Company *'), 'Acme')
    await user.click(screen.getByRole('button', { name: /add/i }))
    expect(onAdd).toHaveBeenCalledOnce()
    const arg = onAdd.mock.calls[0][0]
    expect(arg.company).toBe('Acme')
    expect(arg.contact).toBe('')
    expect(arg.status).toBe('Contacted')
    expect(typeof arg.id).toBe('string')
    expect(arg.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('includes contact when provided', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<AddLeadForm onAdd={onAdd} />)
    await user.type(screen.getByPlaceholderText('Company *'), 'Acme')
    await user.type(screen.getByPlaceholderText('Contact'), 'Jane')
    await user.click(screen.getByRole('button', { name: /add/i }))
    expect(onAdd.mock.calls[0][0].contact).toBe('Jane')
  })

  it('clears all fields after a successful submit', async () => {
    const user = userEvent.setup()
    render(<AddLeadForm onAdd={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('Company *'), 'Acme')
    await user.type(screen.getByPlaceholderText('Contact'), 'Jane')
    await user.click(screen.getByRole('button', { name: /add/i }))
    expect(screen.getByPlaceholderText('Company *')).toHaveValue('')
    expect(screen.getByPlaceholderText('Contact')).toHaveValue('')
    expect(screen.getByRole('combobox')).toHaveValue('Contacted')
  })

  it('does not call onAdd when company is blank', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<AddLeadForm onAdd={onAdd} />)
    await user.click(screen.getByRole('button', { name: /add/i }))
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('trims whitespace from company and contact', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<AddLeadForm onAdd={onAdd} />)
    await user.type(screen.getByPlaceholderText('Company *'), '  Acme  ')
    await user.click(screen.getByRole('button', { name: /add/i }))
    expect(onAdd.mock.calls[0][0].company).toBe('Acme')
  })
})
