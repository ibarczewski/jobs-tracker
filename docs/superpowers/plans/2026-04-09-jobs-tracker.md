# Jobs Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page React app that tracks job search leads using localStorage, sortable by any column, with an always-visible add-entry form and inline status editing.

**Architecture:** Pure React SPA (Vite), no backend. All data persists to `localStorage` as a JSON array. Status changes auto-update the `lastUpdated` timestamp. Deployed as a static site on Render.

**Tech Stack:** React 18, Vite, uuid, Vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/constants.js` | `STATUSES` array, `STORAGE_KEY` string |
| `src/utils.js` | `generateId()`, `today()` |
| `src/utils.test.js` | Unit tests for utils |
| `src/App.jsx` | Root component — owns leads state, localStorage sync, sort state |
| `src/App.test.jsx` | Integration tests for App |
| `src/App.css` | Minimal layout styles |
| `src/components/AddLeadForm.jsx` | Controlled form to add a new lead |
| `src/components/AddLeadForm.test.jsx` | Unit tests for form |
| `src/components/LeadsTable.jsx` | Table with sortable headers, renders LeadRow per entry |
| `src/components/LeadsTable.test.jsx` | Unit tests for table (sorting, headers) |
| `src/components/LeadRow.jsx` | Single `<tr>` with inline status `<select>` |
| `src/components/LeadRow.test.jsx` | Unit tests for row |
| `src/test-setup.js` | Imports jest-dom matchers for all tests |
| `render.yaml` | Render static site deployment config |

---

## Task 1: Scaffold Vite React project

**Files:**
- Create: `vite.config.js` (modify generated)
- Create: `src/test-setup.js`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Scaffold the project**

```bash
npm create vite@latest . -- --template react
```

When prompted "Current directory is not empty. Remove existing files and continue?" — choose **Ignore files and continue** (keeps README.md).

- [ ] **Step 2: Install runtime dependency**

```bash
npm install uuid
```

- [ ] **Step 3: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

- [ ] **Step 4: Configure Vitest in vite.config.js**

Replace the contents of `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
})
```

- [ ] **Step 5: Create test setup file**

Create `src/test-setup.js`:

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Add test script to package.json**

In `package.json`, add `"test": "vitest"` inside the `"scripts"` block. It should look like:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest"
}
```

- [ ] **Step 7: Verify test runner works**

```bash
npm test -- --run
```

Expected: no test files found yet, exits with code 0 (or "no test files" message — that's fine).

- [ ] **Step 8: Delete Vite boilerplate we won't use**

```bash
rm src/App.css src/index.css src/assets/react.svg public/vite.svg src/App.jsx
```

(We'll create our own versions of App.jsx and App.css in later tasks.)

- [ ] **Step 9: Add .superpowers/ to .gitignore**

Open `.gitignore` and add this line at the bottom:

```
.superpowers/
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite React project with Vitest"
```

---

## Task 2: Constants and utilities

**Files:**
- Create: `src/constants.js`
- Create: `src/utils.js`
- Create: `src/utils.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/utils.test.js`:

```js
import { describe, it, expect, vi } from 'vitest'
import { generateId, today } from './utils'

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(typeof generateId()).toBe('string')
    expect(generateId().length).toBeGreaterThan(0)
  })

  it('returns unique values on successive calls', () => {
    expect(generateId()).not.toBe(generateId())
  })
})

describe('today', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns the current local date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-09T12:00:00'))
    expect(today()).toBe('2026-04-09')
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --run
```

Expected: FAIL — "Cannot find module './utils'"

- [ ] **Step 3: Create constants**

Create `src/constants.js`:

```js
export const STORAGE_KEY = 'jobs-tracker-leads'

export const STATUSES = [
  'Contacted',
  'Need to Reply',
  'Waiting for Application',
  'Applied',
  'Recruiter Screen',
  'Interview',
  'Offer',
  'Rejected',
  'No Response',
]
```

- [ ] **Step 4: Create utils**

Create `src/utils.js`:

```js
import { v4 as uuidv4 } from 'uuid'

export function generateId() {
  return uuidv4()
}

export function today() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- --run
```

Expected: 4 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/constants.js src/utils.js src/utils.test.js
git commit -m "feat: add constants and date/id utilities"
```

---

## Task 3: LeadRow component

**Files:**
- Create: `src/components/LeadRow.jsx`
- Create: `src/components/LeadRow.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/LeadRow.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --run
```

Expected: FAIL — "Cannot find module './LeadRow'"

- [ ] **Step 3: Create the component**

Create `src/components/LeadRow.jsx`:

```jsx
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --run
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/LeadRow.jsx src/components/LeadRow.test.jsx
git commit -m "feat: add LeadRow component with inline status select"
```

---

## Task 4: LeadsTable component

**Files:**
- Create: `src/components/LeadsTable.jsx`
- Create: `src/components/LeadsTable.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/LeadsTable.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --run
```

Expected: FAIL — "Cannot find module './LeadsTable'"

- [ ] **Step 3: Create the component**

Create `src/components/LeadsTable.jsx`:

```jsx
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --run
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/LeadsTable.jsx src/components/LeadsTable.test.jsx
git commit -m "feat: add LeadsTable with sortable column headers"
```

---

## Task 5: AddLeadForm component

**Files:**
- Create: `src/components/AddLeadForm.jsx`
- Create: `src/components/AddLeadForm.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/AddLeadForm.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --run
```

Expected: FAIL — "Cannot find module './AddLeadForm'"

- [ ] **Step 3: Create the component**

Create `src/components/AddLeadForm.jsx`:

```jsx
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
        {STATUSES.map(s => <option key={s}>{s}</option>)}
      </select>
      <button type="submit">Add</button>
    </form>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --run
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/AddLeadForm.jsx src/components/AddLeadForm.test.jsx
git commit -m "feat: add AddLeadForm component"
```

---

## Task 6: App component and styles

**Files:**
- Create: `src/App.jsx`
- Create: `src/App.css`
- Create: `src/App.test.jsx`
- Modify: `src/main.jsx` (update import)

- [ ] **Step 1: Write the failing tests**

Create `src/App.test.jsx`:

```jsx
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
    await user.selectOptions(screen.getByRole('combobox'), 'Interview')
    const stored = JSON.parse(localStorage.getItem('jobs-tracker-leads'))
    expect(stored[0].status).toBe('Interview')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --run
```

Expected: FAIL — "Cannot find module './App'"

- [ ] **Step 3: Create App.jsx**

Create `src/App.jsx`:

```jsx
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
```

- [ ] **Step 4: Create App.css**

Create `src/App.css`:

```css
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f8fafc;
  color: #1e293b;
}

.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px;
}

h1 {
  margin: 0 0 20px;
  font-size: 1.5rem;
}

.add-form {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.add-form input,
.add-form select {
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
}

.add-form input[placeholder="Company *"] { flex: 1 1 160px; }
.add-form input[placeholder="Contact"]   { flex: 1 1 140px; }
.add-form select                         { flex: 1 1 180px; }

.add-form button {
  padding: 8px 18px;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.add-form button:hover { background: #4f46e5; }

table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
}

thead th {
  text-align: left;
  padding: 10px 12px;
  font-size: 13px;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

thead th:hover { color: #1e293b; }

tbody td {
  padding: 10px 12px;
  font-size: 14px;
  border-bottom: 1px solid #f1f5f9;
}

tbody tr:last-child td { border-bottom: none; }

tbody td select {
  padding: 4px 6px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
  cursor: pointer;
}
```

- [ ] **Step 5: Update main.jsx**

Open `src/main.jsx`. Remove the import of `./index.css` if it exists (we deleted that file). The file should look like:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 6: Run all tests to verify they pass**

```bash
npm test -- --run
```

Expected: all tests PASS

- [ ] **Step 7: Verify the app runs in the browser**

```bash
npm run dev
```

Open the URL shown (usually http://localhost:5173). Verify:
- Form shows at top with Company, Contact, Status, Add button
- Add a lead — it appears in the table
- Change a status — the Last Updated date updates to today
- Click column headers — table re-sorts with ↑/↓ indicator
- Refresh the page — leads are still there (localStorage persisted)

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx src/App.css src/App.test.jsx src/main.jsx
git commit -m "feat: wire up App with localStorage, add styles"
```

---

## Task 7: Render deployment config

**Files:**
- Create: `render.yaml`

- [ ] **Step 1: Create render.yaml**

Create `render.yaml` in the project root:

```yaml
services:
  - type: web
    name: jobs-tracker
    runtime: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: `dist/` folder created with `index.html` and assets. No errors.

- [ ] **Step 3: Commit**

```bash
git add render.yaml
git commit -m "feat: add Render static site deployment config"
```

- [ ] **Step 4: Push to GitHub and connect to Render**

```bash
git push origin main
```

Then in the Render dashboard:
1. New > Static Site
2. Connect your GitHub repo
3. Render will auto-detect `render.yaml` and use its settings
4. Click Deploy

Once deployed, the URL Render gives you is your app — works from any device.
