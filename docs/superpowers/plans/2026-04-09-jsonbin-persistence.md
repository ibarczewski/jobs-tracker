# JSONBin Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace localStorage with JSONBin.io as the data store so leads persist and sync across all devices.

**Architecture:** A new `src/api.js` module wraps the two JSONBin REST calls (`fetchLeads`, `persistLeads`). `App.jsx` is updated to call these async functions instead of localStorage, with a `loading` state on mount and an `error` banner for failures. Credentials come from Vite env vars.

**Tech Stack:** React 18, Vite (env vars via `import.meta.env`), JSONBin.io v3 REST API, Vitest + `vi.mock`

---

## File Map

| File | Change |
|------|--------|
| `src/api.js` | **Create** — `fetchLeads()` and `persistLeads(leads)` |
| `src/api.test.js` | **Create** — tests for api.js using `vi.stubGlobal('fetch', ...)` |
| `src/App.jsx` | **Modify** — replace localStorage with async API calls, add loading/error state |
| `src/App.test.jsx` | **Rewrite** — mock `./api` with `vi.mock`, remove all localStorage references |
| `src/App.css` | **Modify** — add `.error` style |
| `.env.example` | **Create** — documents required env vars |
| `.gitignore` | **Verify** — `.env` is already ignored (Vite default includes it) |

---

## Task 1: Create `src/api.js`

**Files:**
- Create: `src/api.js`
- Create: `src/api.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/api.test.js`:

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchLeads, persistLeads } from './api'

const BIN_ID = 'test-bin-id'
const API_KEY = 'test-api-key'

beforeEach(() => {
  vi.stubEnv('VITE_JSONBIN_BIN_ID', BIN_ID)
  vi.stubEnv('VITE_JSONBIN_API_KEY', API_KEY)
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('fetchLeads', () => {
  it('GETs the bin and returns the leads array', async () => {
    const leads = [{ id: '1', company: 'Acme', contact: '', status: 'Applied', lastUpdated: '2026-04-01' }]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ record: leads }),
    }))

    const result = await fetchLeads()

    expect(fetch).toHaveBeenCalledWith(
      `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
      { headers: { 'X-Master-Key': API_KEY } }
    )
    expect(result).toEqual(leads)

    vi.unstubAllGlobals()
  })

  it('throws when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))

    await expect(fetchLeads()).rejects.toThrow('Failed to fetch leads: 401')

    vi.unstubAllGlobals()
  })
})

describe('persistLeads', () => {
  it('PUTs the leads array to the bin', async () => {
    const leads = [{ id: '1', company: 'Acme', contact: '', status: 'Applied', lastUpdated: '2026-04-01' }]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }))

    await persistLeads(leads)

    expect(fetch).toHaveBeenCalledWith(
      `https://api.jsonbin.io/v3/b/${BIN_ID}`,
      {
        method: 'PUT',
        headers: { 'X-Master-Key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(leads),
      }
    )

    vi.unstubAllGlobals()
  })

  it('throws when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }))

    await expect(persistLeads([])).rejects.toThrow('Failed to save leads: 403')

    vi.unstubAllGlobals()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --run
```

Expected: FAIL — "Cannot find module './api'"

- [ ] **Step 3: Create `src/api.js`**

Env vars are read inside each function (not at module scope) so that `vi.stubEnv` in tests takes effect at call time rather than import time.

```js
const BASE_URL = 'https://api.jsonbin.io/v3/b'

export async function fetchLeads() {
  const binId = import.meta.env.VITE_JSONBIN_BIN_ID
  const apiKey = import.meta.env.VITE_JSONBIN_API_KEY
  const res = await fetch(`${BASE_URL}/${binId}/latest`, {
    headers: { 'X-Master-Key': apiKey },
  })
  if (!res.ok) throw new Error(`Failed to fetch leads: ${res.status}`)
  const data = await res.json()
  return data.record
}

export async function persistLeads(leads) {
  const binId = import.meta.env.VITE_JSONBIN_BIN_ID
  const apiKey = import.meta.env.VITE_JSONBIN_API_KEY
  const res = await fetch(`${BASE_URL}/${binId}`, {
    method: 'PUT',
    headers: {
      'X-Master-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leads),
  })
  if (!res.ok) throw new Error(`Failed to save leads: ${res.status}`)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --run
```

Expected: 4 new tests PASS, all prior tests still PASS

- [ ] **Step 5: Commit**

```bash
git add src/api.js src/api.test.js
git commit -m "feat: add JSONBin API module"
```

---

## Task 2: Update `App.jsx` and `App.test.jsx`

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Rewrite `src/App.test.jsx`**

Replace the entire file:

```jsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --run
```

Expected: App tests FAIL (App still uses localStorage), api.js tests still PASS

- [ ] **Step 3: Rewrite `src/App.jsx`**

Replace the entire file:

```jsx
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
    persistLeads(updated).catch(err => setError(err.message))
  }

  function updateStatus(id, status) {
    const updated = leads.map(l =>
      l.id === id ? { ...l, status, lastUpdated: today() } : l
    )
    setLeads(updated)
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
```

- [ ] **Step 4: Add `.error` style to `src/App.css`**

Add these lines at the end of `src/App.css`:

```css
.error {
  background: #fee2e2;
  color: #991b1b;
  padding: 10px 14px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
}
```

- [ ] **Step 5: Run all tests to verify they pass**

```bash
npm test -- --run
```

Expected: all tests PASS (including the 5 rewritten App tests and the 4 api.js tests)

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/App.test.jsx src/App.css
git commit -m "feat: replace localStorage with JSONBin API"
```

---

## Task 3: Environment config and `.env.example`

**Files:**
- Create: `.env.example`
- Verify: `.gitignore` already ignores `.env`

- [ ] **Step 1: Verify `.gitignore` ignores `.env`**

```bash
grep '\.env' .gitignore
```

Expected output includes `.env` (Vite's default template adds it). If it's missing, add `.env` to `.gitignore` before continuing.

- [ ] **Step 2: Create `.env.example`**

Create `.env.example` in the project root:

```
# JSONBin.io credentials
# 1. Sign up at https://jsonbin.io
# 2. Go to API Keys → copy your Master Key
# 3. Create a new Bin with content [] → copy the Bin ID from the URL
VITE_JSONBIN_API_KEY=your_master_key_here
VITE_JSONBIN_BIN_ID=your_bin_id_here
```

- [ ] **Step 3: Create your local `.env` file**

Copy `.env.example` to `.env` and fill in your real credentials:

```bash
cp .env.example .env
```

Then open `.env` and replace the placeholder values with:
- `VITE_JSONBIN_API_KEY` — your Master Key from the JSONBin dashboard
- `VITE_JSONBIN_BIN_ID` — your Bin ID (visible in the bin URL: `jsonbin.io/b/<BIN_ID>`)

**Do not commit `.env`.**

- [ ] **Step 4: Add env vars to Render**

In the Render dashboard for `jobs-tracker`:
1. Go to **Environment → Environment Variables**
2. Add `VITE_JSONBIN_API_KEY` with your Master Key value
3. Add `VITE_JSONBIN_BIN_ID` with your Bin ID value
4. Click **Save Changes** — Render will trigger a redeploy automatically

- [ ] **Step 5: Test locally**

```bash
npm run dev
```

Open http://localhost:5173. Verify:
- App loads (no "Loading..." stuck state)
- Add a lead — it appears in the table
- Refresh — lead is still there (persisted to JSONBin)
- Open the app on a second device/browser — same data appears

- [ ] **Step 6: Commit**

```bash
git add .env.example
git commit -m "docs: add .env.example for JSONBin credentials"
git push
```

Render will redeploy automatically. Verify the live URL works the same as local.
