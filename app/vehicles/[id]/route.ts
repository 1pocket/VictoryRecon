// app/api/vehicles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Status, Location } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await req.json() as {
      patch: Record<string, any>,
      // optimistic concurrency — client must send the last known updatedAt
      updatedAt?: string
    }

    // Validate enums when provided
    if (body.patch?.status && !Object.values(Status).includes(body.patch.status)) {
      return NextResponse.json({ ok: false, message: 'Invalid status value' }, { status: 400 })
    }
    if (body.patch?.location && !Object.values(Location).includes(body.patch.location)) {
      return NextResponse.json({ ok: false, message: 'Invalid location value' }, { status: 400 })
    }

    // Coerce a few basic types (you can expand as needed)
    const coerceInt = (v: any) => (v === null || v === '' || Number.isNaN(Number(v)) ? null : Number(v))
    if ('year' in body.patch) body.patch.year = coerceInt(body.patch.year)
    if ('miles' in body.patch) body.patch.miles = coerceInt(body.patch.miles)
    if ('keysCount' in body.patch) body.patch.keysCount = coerceInt(body.patch.keysCount)
    if ('eta' in body.patch) body.patch.eta = body.patch.eta ? new Date(body.patch.eta) : null

    // optimistic concurrency
    if (body.updatedAt) {
      const prev = await prisma.vehicle.findUnique({ where: { id } })
      if (!prev) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 })
      const same = new Date(body.updatedAt).valueOf() === new Date(prev.updatedAt).valueOf()
      if (!same) {
        return NextResponse.json({
          ok: false,
          message: 'This row has changed since you loaded it. Refresh to get latest.'
        }, { status: 409 })
      }
    }

    const updated = await prisma.vehicle.update({ where: { id }, data: body.patch })
    revalidatePath('/')
    revalidatePath('/vehicles')
    return NextResponse.json({ ok: true, vehicle: updated })
  } catch (e) {
    console.error('PATCH /api/vehicles/[id] error', e)
    return NextResponse.json({ ok: false, message: 'Update failed' }, { status: 500 })
  }
}
