const BASE_URL = 'https://api.jsonbin.io/v3/b'

export async function fetchLeads() {
  const binId = import.meta.env.VITE_JSONBIN_BIN_ID
  const apiKey = import.meta.env.VITE_JSONBIN_API_KEY
  const res = await fetch(`${BASE_URL}/${binId}/latest`, {
    headers: { 'X-Master-Key': apiKey },
  })
  if (!res.ok) throw new Error(`Failed to fetch leads: ${res.status}`)
  const data = await res.json()
  if (!Array.isArray(data.record)) throw new Error('JSONBin returned unexpected data format')
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
