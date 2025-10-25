import { Status } from '@prisma/client'

const COLORS: Record<Status, string> = {
  INTAKE: 'border-gray-300 text-gray-700',
  INSPECTION: 'border-blue-300 text-blue-700',
  AWAITING_APPROVAL: 'border-amber-300 text-amber-700',
  APPROVED: 'border-emerald-300 text-emerald-700',
  PARTS_ORDERED: 'border-purple-300 text-purple-700',
  PARTS_BACKORDERED: 'border-orange-300 text-orange-700',
  IN_PROGRESS: 'border-sky-300 text-sky-700',
  SUBLET_DETAIL: 'border-pink-300 text-pink-700',
  SUBLET_PHOTOS: 'border-fuchsia-300 text-fuchsia-700',
  QUALITY_CHECK: 'border-cyan-300 text-cyan-700',
  READY_FOR_FRONTLINE: 'border-lime-300 text-lime-700',
  ON_FRONTLINE: 'border-teal-300 text-teal-700',
  SOLD: 'border-gray-400 text-gray-500'
}

export default function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge ${COLORS[status]}`}>{status.replaceAll('_',' ')}</span>
}
