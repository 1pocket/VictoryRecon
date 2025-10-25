import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { setKeys, updateVehicleStatus, quickNote } from '@/app/actions'
import StatusBadge from '@/components/StatusBadge'
import { Status } from '@prisma/client'

export default async function VehicleDetail({ params }: { params: { id: string } }) {
  const v = await prisma.vehicle.findUnique({ where: { id: params.id }, include: { logs: { orderBy: { createdAt: 'desc' } } } })
  if (!v) return notFound()

  async function setKeysAction(formData: FormData) {
    'use server'
    const count = Number(formData.get('keysCount') || 1)
    await setKeys(v.id, count)
  }

  async function noteAction(formData: FormData) {
    'use server'
    const note = String(formData.get('note') || '')
    if (note.trim()) await quickNote(v.id, note.trim())
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-3">
        <div className="card p-4 space-y-1">
          <div className="text-sm text-gray-600">{v.stockNumber}</div>
          <div className="text-lg font-semibold">{v.year} {v.make} {v.model} {v.trim}</div>
          <div className="text-sm text-gray-600 break-all">VIN: {v.vin}</div>
          <div className="flex items-center gap-2"><StatusBadge status={v.status} /><span className="text-xs text-gray-600">Miles: {v.miles ?? '—'}</span><span className="text-xs text-gray-600">Keys: {v.keysCount}</span></div>
          <div className="text-sm text-gray-600">RO: {v.roNumber ?? '—'} · ETA: {v.eta ? new Date(v.eta).toLocaleDateString() : '—'}</div>
        </div>

        <div className="card p-4">
          <div className="font-semibold mb-2">Update Status</div>
          <div className="flex flex-wrap gap-2">
            {[
              'INSPECTION','AWAITING_APPROVAL','APPROVED','PARTS_ORDERED','PARTS_BACKORDERED','IN_PROGRESS','SUBLET_DETAIL','SUBLET_PHOTOS','QUALITY_CHECK','READY_FOR_FRONTLINE','ON_FRONTLINE','SOLD'
            ].map((s) => (
              <form key={s} action={async () => { 'use server'; await updateVehicleStatus(v.id, s as Status)}}>
                <button className="btn">{s.replaceAll('_',' ')}</button>
              </form>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <div className="font-semibold mb-2">Add Note</div>
          <form action={noteAction} className="flex gap-2">
            <input name="note" className="input" placeholder="e.g., Awaiting approval, part backordered, etc." />
            <button className="btn">Add</button>
          </form>
          <div className="mt-3 space-y-2">
            {v.logs.map(l => (
              <div key={l.id} className="text-sm text-gray-700">
                <span className="text-gray-500">{new Date(l.createdAt).toLocaleString()} — </span>
                {l.message}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="card p-4">
          <div className="font-semibold mb-2">Keys</div>
          <form action={setKeysAction} className="flex items-center gap-2">
            <select name="keysCount" defaultValue={String(v.keysCount)} className="select">
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
            <button className="btn">Save</button>
          </form>
          <p className="text-xs text-gray-600 mt-2">We track 2 keys minimum for frontline readiness.</p>
        </div>
        <div className="card p-4">
          <div className="font-semibold mb-2">VIN & Stock</div>
          <div className="text-sm break-all">{v.vin}</div>
          <div className="text-sm">{v.stockNumber}</div>
        </div>
      </div>
    </div>
  )
}
