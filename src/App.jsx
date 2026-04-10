import { useState } from 'react'
import { STORAGE_KEY } from './constants'
import { today } from './utils'
import AddLeadForm from './components/AddLeadForm'
import LeadsTable from './components/LeadsTable'
import './App.css'

function loadLeads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLeads(leads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
}

export default function App() {
  const [leads, setLeads] = useState(loadLeads)
  const [sortConfig, setSortConfig] = useState({ column: 'lastUpdated', direction: 'desc' })

  function addLead(lead) {
    const updated = [...leads, lead]
    setLeads(updated)
    saveLeads(updated)
  }

  function updateStatus(id, status) {
    const updated = leads.map(l =>
      l.id === id ? { ...l, status, lastUpdated: today() } : l
    )
    setLeads(updated)
    saveLeads(updated)
  }

  function toggleSort(column) {
    setSortConfig(prev =>
      prev.column === column
        ? { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'asc' }
    )
  }

  return (
    <div className="app">
      <h1>Job Search Tracker</h1>
      <AddLeadForm onAdd={addLead} />
      <LeadsTable
        leads={leads}
        sortConfig={sortConfig}
        onSort={toggleSort}
        onStatusChange={updateStatus}
      />
    </div>
  )
}
