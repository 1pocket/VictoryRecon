import Link from 'next/link'
import StatusBadge from './StatusBadge'
import { Vehicle, Status, User } from '@prisma/client'
import { setEta, updateVehicleStatus } from '@/app/actions'

type VehicleWithRelations = Vehicle & { assignedTech?: User | null }

export default function VehicleCard({ v }: { v: VehicleWithRelations }) {
  async function set(vId: string, s: Status) {
    'use server'
    await updateVehicleStatus(vId, s)
  }

  async function setEtaAction(formData: FormData) {
    'use server'
    const vId = String(formData.get('vehicleId'))
    const eta = String(formData.get('eta') || '')
    await setEta(vId, eta)
  }

  return (
    <div className="kb-card">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{v.stockNumber} · {v.year} {v.make} {v.model}</div>
        <StatusBadge status={v.status} />
      </div>
      <div className="text-xs text-gray-600 break-all">VIN: {v.vin}</div>
      <div className="text-xs text-gray-600">Miles: {v.miles ?? '-'} · Keys: {v.keysCount}</div>
      <div className="text-xs text-gray-600">Tech: {v.assignedTech?.name ?? '—'}</div>
      <div className="flex items-center gap-2">
        <form action={setEtaAction} className="flex items-center gap-2">
          <input type="hidden" name="vehicleId" value={v.id} />
          <label className="label">ETA</label>
          <input className="input" type="date" name="eta" defaultValue={v.eta ? new Date(v.eta).toISOString().slice(0,10) : ''} />
          <button className="btn" type="submit">Save</button>
        </form>
        <Link href={`/vehicles/${v.id}`} className="btn ml-auto">Open</Link>
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        {[
          'INSPECTION','AWAITING_APPROVAL','APPROVED','PARTS_ORDERED','PARTS_BACKORDERED','IN_PROGRESS','SUBLET_DETAIL','QUALITY_CHECK','READY_FOR_FRONTLINE','ON_FRONTLINE'
        ].map((s) => (
          <form key={s} action={async () => { 'use server'; await updateVehicleStatus(v.id, s as Status)}}>
            <button className="btn">{s.replaceAll('_',' ')}</button>
          </form>
        ))}
      </div>
    </div>
  )
}
