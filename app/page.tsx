import { prisma } from '@/lib/prisma'
import VehicleCard from '@/components/VehicleCard'
import QuickAddForm from '@/components/QuickAddForm'
import { Status } from '@prisma/client'

export default async function Dashboard() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: 'desc' },
    include: { assignedTech: true }
  })

  const byStatus: Record<string, typeof vehicles> = {}
  for (const v of vehicles) {
    byStatus[v.status] ||= []
    byStatus[v.status].push(v)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Add */}
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Quick Add</h2>
          <QuickAddForm />
        </div>

        {/* What this replaces */}
        <div className="card p-4">
          <h2 className="font-semibold mb-2">What this replaces</h2>
          <p className="text-sm text-gray-600">
            Your live Excel recon sheet becomes a centralized, role-friendly web app
            with status tracking, ETA, keys count, RO, and a full audit trail.
          </p>
          <ul className="text-sm list-disc pl-5 mt-2 space-y-1">
            <li>Kanban by status with quick updates</li>
            <li>ETA & RO inline editing</li>
            <li>Keys (1 or 2) enforcement</li>
            <li>Activity log and notes</li>
            <li>Detailer view with PIN (no service login)</li>
            <li>CSV export (in /vehicles)</li>
          </ul>
        </div>

        {/* Suggested flow */}
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Suggested flow</h2>
          <ol className="text-sm list-decimal pl-5 space-y-1">
            <li>Intake → Inspection</li>
            <li>Awaiting Approval (Service Manager)</li>
            <li>Approved → Parts Ordered / Backordered</li>
            <li>In Progress → Quality Check</li>
            <li>Sublet: Detail / Photos</li>
            <li>Ready for Frontline → On Frontline → Sold</li>
          </ol>
        </div>
      </div>

      {/* Kanban layout */}
      <div className="md:overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {Object.keys(Status).map((s) => (
            <div key={s} className="kb-col">
              <h3 className="text-sm font-semibold mb-2">{s.replaceAll('_', ' ')}</h3>
              <div className="space-y-2">
                {(byStatus[s] || []).map((v) => (
                  <VehicleCard key={v.id} v={v} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
