import { prisma } from '@/lib/prisma'
import VehicleTable from '@/components/VehicleTable'

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">All Vehicles</h1>
        <a className="btn" href="/api/export/csv">Export CSV</a>
      </div>
      <VehicleTable vehicles={vehicles} />
    </div>
  )
}
