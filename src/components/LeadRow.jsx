import { STATUSES } from '../constants'

export default function LeadRow({ lead, onStatusChange }) {
  return (
    <tr>
      <td>{lead.company}</td>
      <td>{lead.contact || '—'}</td>
      <td>
        <select
          value={lead.status}
          onChange={e => onStatusChange(lead.id, e.target.value)}
        >
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </td>
      <td>{lead.lastUpdated}</td>
    </tr>
  )
}
