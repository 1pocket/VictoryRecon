'use server'

import { prisma } from '@/lib/prisma'
import { Status, Location } from '@prisma/client'

export async function createVehicle(formData: FormData) {
  const data = {
    stockNumber: String(formData.get('stockNumber') || ''),
    vin: String(formData.get('vin') || ''),
    year: formData.get('year') ? Number(formData.get('year')) : null,
    make: String(formData.get('make') || ''),
    model: String(formData.get('model') || ''),
    trim: String(formData.get('trim') || ''),
    miles: formData.get('miles') ? Number(formData.get('miles')) : null,
    location: (formData.get('location') as Location) || Location.ON_LOT,
    keysCount: formData.get('keysCount') ? Number(formData.get('keysCount')) : 1,
    roNumber: String(formData.get('roNumber') || ''),
    status: (formData.get('status') as Status) || Status.INTAKE,
    notes: String(formData.get('notes') || '')
  }
  const v = await prisma.vehicle.create({ data })
  await prisma.activityLog.create({
    data: { vehicleId: v.id, message: 'Vehicle created', toStatus: v.status }
  })
}

export async function updateVehicleStatus(vehicleId: string, to: Status, note?: string) {
  const updated = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { status: to }
  })
  await prisma.activityLog.create({
    data: {
      vehicleId,
      message: note || `Status → ${to}`,
      fromStatus: updated.status,
      toStatus: to
    }
  })
}

export async function assignTech(vehicleId: string, techId: string | null) {
  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { assignedTechId: techId || null }
  })
}

export async function setEta(vehicleId: string, isoDate: string) {
  const eta = isoDate ? new Date(isoDate) : null
  await prisma.vehicle.update({ where: { id: vehicleId }, data: { eta } })
}

export async function setKeys(vehicleId: string, keysCount: number) {
  await prisma.vehicle.update({ where: { id: vehicleId }, data: { keysCount } })
}

export async function quickNote(vehicleId: string, note: string) {
  if (!note.trim()) return
  await prisma.activityLog.create({ data: { vehicleId, message: note.trim() } })
}

export async function deleteVehicle(id: string) {
  await prisma.activityLog.deleteMany({ where: { vehicleId: id } })
  await prisma.vehicle.delete({ where: { id } })
}

export async function upsertVendor(name: string, vendorType: string) {
  return prisma.vendor.upsert({
    where: { name },
    update: { vendorType },
    create: { name, vendorType }
  })
}
