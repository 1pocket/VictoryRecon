import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const items = await prisma.vehicle.findMany({ where: { status: 'SUBLET_DETAIL' }, orderBy: { createdAt: 'asc' } })
  const rows = items.map(v => `<tr><td>${v.stockNumber}</td><td>${v.vin}</td><td>${v.year ?? ''}</td><td>${v.make ?? ''}</td><td>${v.model ?? ''}</td><td>${v.keysCount}</td></tr>`).join('')
  const html = `
    <html><head>
      <style>
        body{font-family: ui-sans-serif, system-ui; padding: 8px}
        table{border-collapse: collapse; width: 100%}
        th,td{border-bottom:1px solid #e5e7eb; padding:8px; text-align:left; font-size:14px}
        th{color:#6b7280}
      </style>
    </head><body>
      <table><thead><tr><th>Stock</th><th>VIN</th><th>Year</th><th>Make</th><th>Model</th><th>Keys</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </body></html>`
  return new NextResponse(html, { headers: { 'content-type': 'text/html' }})
}
