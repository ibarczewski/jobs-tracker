import { useState } from 'react'
import { STATUSES } from '../constants'
import { generateId, today } from '../utils'

export default function AddLeadForm({ onAdd }) {
  const [company, setCompany] = useState('')
  const [contact, setContact] = useState('')
  const [status, setStatus] = useState(STATUSES[0])

  function handleSubmit(e) {
    e.preventDefault()
    if (!company.trim()) return
    onAdd({
      id: generateId(),
      company: company.trim(),
      contact: contact.trim(),
      status,
      lastUpdated: today(),
    })
    setCompany('')
    setContact('')
    setStatus(STATUSES[0])
  }

  return (
    <form onSubmit={handleSubmit} className="add-form">
      <input
        placeholder="Company *"
        value={company}
        onChange={e => setCompany(e.target.value)}
      />
      <input
        placeholder="Contact"
        value={contact}
        onChange={e => setContact(e.target.value)}
      />
      <select value={status} onChange={e => setStatus(e.target.value)}>
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <button type="submit">Add</button>
    </form>
  )
}
