# JSONBin Persistence — Design Spec
_2026-04-09_

## Overview

Replace `localStorage` with JSONBin.io as the data store so leads sync across devices. JSONBin provides a free hosted JSON bin accessed via REST API. No backend required — the React app calls the JSONBin API directly from the browser using env-var-protected credentials.

## Architecture

- **Storage:** JSONBin.io — one bin per user, stores the full leads array as JSON
- **Auth:** JSONBin Master Key passed as `X-Master-Key` header. Stored in `VITE_JSONBIN_API_KEY` env var. Never committed to source.
- **Bin ID:** Stored in `VITE_JSONBIN_BIN_ID` env var.
- **Deployment:** Env vars set in Render dashboard for production; `.env` file for local dev (gitignored).

## File Changes

| File | Change |
|------|--------|
| `src/api.js` | New — `fetchLeads()` and `persistLeads(leads)` |
| `src/App.jsx` | Modify — replace localStorage with async API calls, add loading/error state |
| `src/App.test.jsx` | Modify — mock `src/api.js` with `vi.mock` |
| `.env.example` | New — documents required env vars |

## API Module (`src/api.js`)

Two exported async functions:

```js
fetchLeads()     // GET /v3/b/{BIN_ID}/latest → returns leads array
persistLeads(leads)  // PUT /v3/b/{BIN_ID} → saves leads array, returns void
```

Both throw on network error or non-ok HTTP status. Callers handle errors.

JSONBin endpoints used:
- GET `https://api.jsonbin.io/v3/b/${BIN_ID}/latest` — returns `{ record: [...], metadata: {...} }`
- PUT `https://api.jsonbin.io/v3/b/${BIN_ID}` — body is `[...]`, returns updated record

Headers for all requests:
- `X-Master-Key: <VITE_JSONBIN_API_KEY>`
- `Content-Type: application/json` (PUT only)

## App Component Changes (`src/App.jsx`)

Remove:
- `loadLeads()` (synchronous localStorage read)
- `saveLeads(leads)` (synchronous localStorage write)
- `STORAGE_KEY` import

Add:
- `loading` state (boolean, starts `true`)
- `error` state (string | null, starts `null`)
- `useEffect` on mount: calls `fetchLeads()`, sets leads, sets `loading: false`. On error: sets error message, sets `loading: false`.
- `persistLeads(updated)` call in `addLead` and `updateStatus` (after optimistic state update). On error: sets error message.

UI additions:
- While `loading`: render `<p>Loading...</p>` instead of the form+table
- While `error` is set: render a simple error banner above the form (`<p className="error">{error}</p>`)

Optimistic updates: state is updated immediately; JSONBin write happens async. This keeps the UI responsive.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_JSONBIN_API_KEY` | JSONBin Master Key (from JSONBin dashboard → API Keys) |
| `VITE_JSONBIN_BIN_ID` | Bin ID (from the bin's URL or metadata after creation) |

`.env.example`:
```
VITE_JSONBIN_API_KEY=your_master_key_here
VITE_JSONBIN_BIN_ID=your_bin_id_here
```

## One-Time Setup (Manual, Before Deploying)

1. Create a [JSONBin.io](https://jsonbin.io) account
2. Go to **API Keys** → copy your Master Key
3. Click **Create Bin** → paste `[]` as content → Save → copy the Bin ID from the URL
4. Add both values to `.env` locally
5. Add both values to Render dashboard under **Environment → Environment Variables**

## Testing

`App.test.jsx` uses `vi.mock('./api')` to stub `fetchLeads` and `persistLeads`. Tests verify:
- Loading state shown on mount, replaced with content after fetch resolves
- Leads from `fetchLeads` are rendered in the table
- `persistLeads` called when a lead is added
- `persistLeads` called when a status is changed
- Error banner shown when `fetchLeads` rejects

`src/api.js` is not unit-tested (two `fetch` wrappers — no logic to test independently).

## Error Handling

| Scenario | Behavior |
|----------|----------|
| `fetchLeads` fails on mount | Error banner shown, table empty |
| `persistLeads` fails on add/update | Error banner shown, UI state already updated (optimistic) |
| Non-ok HTTP status from JSONBin | Both functions throw, error banner shown |
