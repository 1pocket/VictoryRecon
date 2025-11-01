// components/EditableVehicleTable.tsx
'use client'

import { useMemo, useState } from 'react'
import type { Vehicle, Status, Location } from '@prisma/client'

const STATUS: Status[] = [
  'INTAKE','INSPECTION','AWAITING_APPROVAL','APPROVED',
  'PARTS_ORDERED','PARTS_BACKORDERED','IN_PROGRESS',
  'SUBLET_DETAIL','SUBLET_PHOTOS','QUALITY_CHECK',
  'READY_FOR_FRONTLINE','ON_FRONTLINE','SOLD'
]

const LOCATIONS: Location[] = ['ON_LOT','IN_TRANSPORT','AT_VENDOR','AT_AUCTION']

type V = Vehicle & { __dirty?: boolean }

export default function EditableVehicleTable({ initial }: { initial: Vehicle[] }) {
  const [rows, setRows] = useState<V[]>(() => initial.map(v => ({ ...v })))
  const [saving, setSaving] = useState<string | null>(null)
  const headers = useMemo(() => ([
    { key: 'stockNumber', label: 'Stock', type: 'text' },
    { key: 'vin', label: 'VIN', type: 'text', readOnly: true },
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'make', label: 'Make', type: 'text' },
    { key: 'model', label: 'Model', type: 'text' },
    { key: 'trim', label: 'Trim', type: 'text' },
    { key: 'miles', label: 'Miles', type: 'number' },
    { key: 'keysCount', label: 'Keys', type: 'number' },
    { key: 'status', label: 'Status', type: 'select-status' },
    { key: 'location', label: 'Location', type: 'select-location' },
    { key: 'eta', label: 'ETA', type: 'date' },
    { key: 'roNumber', label: 'RO #', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'text' },
  ] as const), [])

  async function saveCell(id: string, key: string, value: any, updatedAt: string) {
    setSaving(id)
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ updatedAt, patch: { [key]: value } })
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json?.message || 'Update failed')
      setRows(prev => prev.map(r => (r.id === id ? { ...json.vehicle } : r)))
    } catch (e: any) {
      alert(e.message || 'Update failed.')
      // reload the row from server if needed
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="card p-3 overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            {headers.map(h => <th key={h.key}>{h.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className={saving === row.id ? 'opacity-60' : ''}>
              {headers.map(h => {
                const val = (row as any)[h.key]
                const baseProps = {
                  className: 'input !py-1 !px-2 min-w-[8rem]',
                  defaultValue: h.type === 'date' && val ? String(new Date(val).toISOString().slice(0,10)) : (val ?? ''),
                  onBlur: (e: any) => {
                    const raw = e.target.value
                    let next: any = raw
                    if (h.type === 'number') next = raw === '' ? null : Number(raw)
                    if (h.type === 'date') next = raw ? raw : null
                    if ((row as any)[h.key] !== next) {
                      saveCell(row.id, h.key, next, row.updatedAt as unknown as string)
                    }
                  },
                  readOnly: h.readOnly
                } as any

                if (h.type === 'select-status') {
                  return (
                    <td key={h.key}>
                      <select
                        className="select !py-1 !px-2"
                        defaultValue={val}
                        onChange={e => saveCell(row.id, 'status', e.target.value, row.updatedAt as unknown as string)}
                      >
                        {STATUS.map(s => <option key={s} value={s}>{s.replaceAll('_',' ')}</option>)}
                      </select>
                    </td>
                  )
                }

                if (h.type === 'select-location') {
                  return (
                    <td key={h.key}>
                      <select
                        className="select !py-1 !px-2"
                        defaultValue={val}
                        onChange={e => saveCell(row.id, 'location', e.target.value, row.updatedAt as unknown as string)}
                      >
                        {LOCATIONS.map(s => <option key={s} value={s}>{s.replaceAll('_',' ')}</option>)}
                      </select>
                    </td>
                  )
                }

                return (
                  <td key={h.key}>
                    <input {...baseProps} />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs mt-2 opacity-70">Tip: edits autosave on blur/change. VIN is read-only.</p>
    </div>
  )
}
