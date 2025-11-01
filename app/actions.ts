// app/actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { Status, Location } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const StatusValues = new Set(Object.values(Status))
const LocationValues = new Set(Object.values(Location))

function asInt(v: FormDataEntryValue | null): number | null {
  const n = Number(String(v ?? '').trim())
  return Number.isFinite(n) ? n : null
}
function asStr(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? '').trim()
  return s ? s : null
}
function asISODate(v: FormDataEntryValue | null): Date | null {
  const s = String(v ?? '').trim()
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.valueOf()) ? null : d
}
function asEnum<T extends string>(val: string | null, valid: Set<string>, fallback: T): T {
  if (val && valid.has(val)) return val as T
  return fallback
}
function normVIN(v: unknown) {
  return String(v ?? '').trim().toUpperCase()
}

export async function createVehicle(formData: FormData) {
  try {
    const data = {
      stockNumber: asStr(formData.get('stockNumber')) ?? 'UNASSIGNED',
      vin: normVIN(formData.get('vin')),
      year: asInt(formData.get('year')),
      make: asStr(formData.get('make')),
      model: asStr(formData.get('model')),
      trim: asStr(formData.get('trim')),
      miles: asInt(formData.get('miles')),
      keysCount: asInt(formData.get('keysCount')) ?? 1,
      roNumber: asStr(formData.get('roNumber')),
      eta: asISODate(formData.get('eta')),
      notes: asStr(formData.get('notes')),
      status: asEnum<Status>(asStr(formData.get('status')), StatusValues, Status.INTAKE),
      location: asEnum<Location>(asStr(formData.get('location')), LocationValues, Location.ON_LOT),
    }

    if (!data.vin) {
      return { ok: false, message: 'VIN is required.' }
    }

    await prisma.vehicle.create({ data })
    revalidatePath('/')
    revalidatePath('/vehicles')
    return { ok: true }
  } catch (e: any) {
    // Unique VIN collision
    if (e?.code === 'P2002' && e?.meta?.target?.includes('vin')) {
      return { ok: false, message: 'That VIN already exists in VictoryRecon.' }
    }
    console.error('createVehicle error', e)
    return { ok: false, message: 'Unexpected error creating vehicle.' }
  }
}
