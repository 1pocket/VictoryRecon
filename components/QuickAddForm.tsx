'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createVehicle } from '@/app/actions'

function SubmitBtn() {
  const { pending } = useFormStatus()
  return <button className="btn w-full" type="submit" disabled={pending}>{pending ? 'Creating…' : 'Create'}</button>
}

export default function QuickAddForm() {
  const [state, formAction] = useFormState(createVehicle as any, { ok: true })

  return (
    <form action={formAction} className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input className="input" name="stockNumber" placeholder="Stock #" required />
        <input className="input" name="vin" placeholder="VIN" required />
        <input className="input" name="year" placeholder="Year" />
        <input className="input" name="make" placeholder="Make" />
        <input className="input" name="model" placeholder="Model" />
        <input className="input" name="trim" placeholder="Trim" />
        <input className="input" name="miles" placeholder="Miles" />
        <select className="select" name="status" defaultValue="INTAKE">
          {['INTAKE','INSPECTION','AWAITING_APPROVAL','APPROVED','PARTS_ORDERED','PARTS_BACKORDERED','IN_PROGRESS','SUBLET_DETAIL','SUBLET_PHOTOS','QUALITY_CHECK','READY_FOR_FRONTLINE','ON_FRONTLINE','SOLD']
            .map(s => <option key={s} value={s}>{s.replaceAll('_',' ')}</option>)}
        </select>
        <select className="select" name="location" defaultValue="ON_LOT">
          <option value="ON_LOT">On Lot</option>
          <option value="IN_TRANSPORT">In Transport</option>
          <option value="AT_VENDOR">At Vendor</option>
          <option value="AT_AUCTION">At Auction</option>
        </select>
        <input className="input" name="keysCount" placeholder="Keys (1/2)" defaultValue="1" />
        <input className="input col-span-2" name="roNumber" placeholder="RO #" />
        <textarea className="input col-span-2" name="notes" placeholder="Notes" />
      </div>

      {!state.ok && (
        <div className="text-sm text-red-600 border border-red-200 rounded p-2">
          {state.message || 'Could not create vehicle.'}
        </div>
      )}

      <SubmitBtn />
    </form>
  )
}
