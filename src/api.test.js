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
