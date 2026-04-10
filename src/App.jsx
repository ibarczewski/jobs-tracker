import { useState, useEffect } from 'react'
import { today } from './utils'
import { fetchLeads, persistLeads } from './api'
import AddLeadForm from './components/AddLeadForm'
import LeadsTable from './components/LeadsTable'
import './App.css'

export default function App() {
  const [leads, setLeads] = useState([])
  const [sortConfig, setSortConfig] = useState({ column: 'lastUpdated', direction: 'desc' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLeads()
      .then(data => {
        setLeads(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  function addLead(lead) {
    const updated = [...leads, lead]
    setLeads(updated)
    setError(null)
    persistLeads(updated).catch(err => setError(err.message))
  }

  function updateStatus(id, status) {
    const updated = leads.map(l =>
      l.id === id ? { ...l, status, lastUpdated: today() } : l
    )
    setLeads(updated)
    setError(null)
    persistLeads(updated).catch(err => setError(err.message))
  }

  function toggleSort(column) {
    setSortConfig(prev =>
      prev.column === column
        ? { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'asc' }
    )
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="app">
      <h1>Job Search Tracker</h1>
      {error && <p className="error">{error}</p>}
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
