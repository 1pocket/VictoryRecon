import Link from 'next/link'
import StatusBadge from './StatusBadge'
import { Vehicle } from '@prisma/client'

export default function VehicleTable({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="card p-3 overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Stock</th>
            <th>VIN</th>
            <th>Year</th>
            <th>Make</th>
            <th>Model</th>
            <th>Miles</th>
            <th>Keys</th>
            <th>Status</th>
            <th>ETA</th>
            <th>RO</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map(v => (
            <tr key={v.id}>
              <td className="font-semibold">{v.stockNumber}</td>
              <td className="break-all">{v.vin}</td>
              <td>{v.year ?? ''}</td>
              <td>{v.make ?? ''}</td>
              <td>{v.model ?? ''}</td>
              <td>{v.miles ?? ''}</td>
              <td>{v.keysCount}</td>
              <td><StatusBadge status={v.status} /></td>
              <td>{v.eta ? new Date(v.eta).toLocaleDateString() : ''}</td>
              <td>{v.roNumber ?? ''}</td>
              <td><Link className="btn" href={`/vehicles/${v.id}`}>Open</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
