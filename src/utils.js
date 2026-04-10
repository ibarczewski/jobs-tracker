import { v4 as uuidv4 } from 'uuid'

export function generateId() {
  return uuidv4()
}

export function today() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}
