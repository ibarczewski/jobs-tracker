import LeadRow from './LeadRow'

const COLUMNS = [
  { key: 'company', label: 'Company' },
  { key: 'contact', label: 'Contact' },
  { key: 'status', label: 'Status' },
  { key: 'lastUpdated', label: 'Last Updated' },
]

function sortLeads(leads, { column, direction }) {
  return [...leads].sort((a, b) => {
    const av = a[column] ?? ''
    const bv = b[column] ?? ''
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return direction === 'asc' ? cmp : -cmp
  })
}

export default function LeadsTable({ leads, sortConfig, onSort, onStatusChange }) {
  const sorted = sortLeads(leads, sortConfig)

  return (
    <table>
      <thead>
        <tr>
          {COLUMNS.map(col => (
            <th key={col.key} onClick={() => onSort(col.key)}>
              {col.label}
              {sortConfig.column === col.key
                ? sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
                : ''}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map(lead => (
          <LeadRow key={lead.id} lead={lead} onStatusChange={onStatusChange} />
        ))}
      </tbody>
    </table>
  )
}
