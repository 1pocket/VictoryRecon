import { prisma } from '@/lib/prisma'

export async function GET() {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } })
  const headers = ['Stock','VIN','Year','Make','Model','Trim','Miles','Location','Keys','RO','ETA','Status']
  const lines = [
    headers.join(','),
    ...vehicles.map(v => [
      v.stockNumber, v.vin, v.year ?? '', v.make ?? '', v.model ?? '', v.trim ?? '',
      v.miles ?? '', v.location, v.keysCount, v.roNumber ?? '',
      v.eta ? new Date(v.eta).toISOString().slice(0,10) : '',
      v.status
    ].map(x => `"${String(x).replaceAll('"','""')}"`).join(','))
  ]
  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/csv',
      'content-disposition': 'attachment; filename="victoryrecon.csv"'
    }
  })
}
