'use server'

import { prisma } from '@/lib/prisma'
import { Status, Location } from '@prisma/client'
import { revalidatePath } from 'next/cache'

function normalizeVin(raw: unknown) {
  return String(raw || '').trim().toUpperCase()
}

export async function createVehicle(formData: FormData) {
  const stockNumber = String(formData.get('stockNumber') || '').trim()
  const vin = normalizeVin(formData.get('vin'))
  if (!vin) {
    // Prevent empty VIN (unique field) from causing server crash
    return { ok: false, message: 'VIN is required.' }
  }

  const data = {
    stockNumber,
    vin,
    year: formData.get('year') ? Number(formData.get('year')) : null,
    make: String(formData.get('make') || '').trim(),
    model: String(formData.get('model') || '').trim(),
    trim: String(formData.get('trim') || '').trim(),
    miles: formData.get('miles') ? Number(formData.get('miles')) : null,
    location: ((formData.get('location') as Location) || Location.ON_LOT),
    keysCount: formData.get('keysCount') ? Number(formData.get('keysCount')) : 1,
    roNumber: String(formData.get('roNumber') || '').trim() || null,
    status: ((formData.get('status') as Status) || Status.INTAKE),
    notes: String(formData.get('notes') || '').trim() || null
  }

  try {
    const v = await prisma.vehicle.create({ data })
    await prisma.activityLog.create({
      data: { vehicleId: v.id, message: 'Vehicle created', toStatus: v.status }
    })
    // Refresh the dashboard
    revalidatePath('/')
    return { ok: true }
  } catch (e: any) {
    // P2002 = unique constraint violation
    if (e?.code === 'P2002' && e?.meta?.target?.includes('vin')) {
      return { ok: false, message: 'That VIN already exists in VictoryRecon.' }
    }
    console.error('createVehicle error', e)
    return { ok: false, message: 'Unexpected error creating vehicle.' }
  }
}

export async function updateVehicleStatus(vehicleId: string, to: Status, note?: string) {
  try {
    const prev = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: to }
    })
    await prisma.activityLog.create({
      data: {
        vehicleId,
        message: note || `Status → ${to}`,
        fromStatus: prev.status,
        toStatus: to
      }
    })
    revalidatePath('/')
    revalidatePath(`/vehicles/${vehicleId}`)
    return { ok: true }
  } catch (e) {
    console.error('updateVehicleStatus error', e)
    return { ok: false, message: 'Could not update status.' }
  }
}

export async function assignTech(vehicleId: string, techId: string | null) {
  try {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { assignedTechId: techId || null }
    })
    revalidatePath('/')
    revalidatePath(`/vehicles/${vehicleId}`)
    return { ok: true }
  } catch (e) {
    console.error('assignTech error', e)
    return { ok: false, message: 'Could not assign tech.' }
  }
}

export async function setEta(vehicleId: string, isoDate: string) {
  try {
    const eta = isoDate ? new Date(isoDate) : null
    await prisma.vehicle.update({ where: { id: vehicleId }, data: { eta } })
    revalidatePath('/')
    revalidatePath(`/vehicles/${vehicleId}`)
    return { ok: true }
  } catch (e) {
    console.error('setEta error', e)
    return { ok: false, message: 'Could not set ETA.' }
  }
}

export async function setKeys(vehicleId: string, keysCount: number) {
  try {
    await prisma.vehicle.update({ where: { id: vehicleId }, data: { keysCount } })
    revalidatePath('/')
    revalidatePath(`/vehicles/${vehicleId}`)
    return { ok: true }
  } catch (e) {
    console.error('setKeys error', e)
    return { ok: false, message: 'Could not update keys.' }
  }
}

export async function quickNote(vehicleId: string, note: string) {
  try {
    const msg = (note || '').trim()
    if (!msg) return { ok: true }
    await prisma.activityLog.create({ data: { vehicleId, message: msg } })
    revalidatePath(`/vehicles/${vehicleId}`)
    return { ok: true }
  } catch (e) {
    console.error('quickNote error', e)
    return { ok: false, message: 'Could not add note.' }
  }
}

export async function deleteVehicle(id: string) {
  try {
    await prisma.activityLog.deleteMany({ where: { vehicleId: id } })
    await prisma.vehicle.delete({ where: { id } })
    revalidatePath('/')
    return { ok: true }
  } catch (e) {
    console.error('deleteVehicle error', e)
    return { ok: false, message: 'Could not delete vehicle.' }
  }
}

// Keep the non-upsert vendor helper (no unique constraint required)
export async function upsertVendor(name: string, vendorType: string) {
  try {
    const existing = await prisma.vendor.findFirst({ where: { name } })
    if (existing) {
      const v = await prisma.vendor.update({
        where: { id: existing.id },
        data: { vendorType }
      })
      revalidatePath('/')
      return { ok: true, vendor: v }
    }
    const v = await prisma.vendor.create({ data: { name, vendorType } })
    revalidatePath('/')
    return { ok: true, vendor: v }
  } catch (e) {
    console.error('upsertVendor error', e)
    return { ok: false, message: 'Could not upsert vendor.' }
  }
}
