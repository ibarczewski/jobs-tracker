# Jobs Tracker — Design Spec
_2026-04-09_

## Overview

A dead-simple personal job search tracking app. Single-page React app, no backend, data stored in `localStorage`. Deployed as a static site on Render via GitHub.

## Data Model

Each lead is stored as a JSON object:

```json
{
  "id": "uuid-v4",
  "company": "Acme Corp",
  "contact": "Jane Smith",
  "status": "Interview",
  "lastUpdated": "2026-04-09"
}
```

All leads are stored as a JSON array under a single `localStorage` key (e.g. `jobs-tracker-leads`).

**Status options (fixed list):**
- Contacted
- Need to Reply
- Waiting for Application
- Applied
- Recruiter Screen
- Interview
- Offer
- Rejected
- No Response

## Architecture

- **Framework:** React (Vite)
- **Storage:** `localStorage` — no backend, no database
- **Deployment:** Render static site, built from `dist/` via `vite build`

## Components

### `App`
- Root component
- Loads leads from `localStorage` on mount
- Saves leads to `localStorage` on every change
- Owns `leads` array and `sortConfig` as state
- Passes down leads, sort state, and mutation handlers as props

### `AddLeadForm`
- Pinned above the table
- Fields: Company (required), Contact (optional), Status (dropdown, defaults to "Contacted")
- Submit appends a new lead with a generated UUID and today's date as `lastUpdated`
- Clears fields after submit

### `LeadsTable`
- Renders a `<table>` with sortable column headers
- Manages no state of its own — sort column and direction come from `App`
- Clicking a column header calls back to toggle sort (same column = flip direction, new column = asc)
- Renders a `LeadRow` for each sorted lead

### `LeadRow`
- Renders one `<tr>` with: Company, Contact (or `—`), Status (inline `<select>`), Last Updated
- `onChange` on the status select calls back to update that lead's status and set `lastUpdated` to today's date
- No delete button, no other editable fields

## Behavior Details

- **Sorting:** Any column is sortable (asc/desc). Active column shows ↑ or ↓ indicator. Default sort: `lastUpdated` descending.
- **Status update:** Changing the inline dropdown immediately persists the change and updates `lastUpdated` to today. No save button needed.
- **No delete:** Leads cannot be removed via the UI.
- **No edit:** Company and contact cannot be changed after creation.

## Deployment

1. Repo pushed to GitHub
2. Render static site connected to the repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. No environment variables required
