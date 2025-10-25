import { PrismaClient, Role, Location, Status } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const [tech, advisor] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'tech@victoryrecon.local' },
      update: {},
      create: { name: 'Default Tech', role: Role.TECH, email: 'tech@victoryrecon.local' }
    }),
    prisma.user.upsert({
      where: { email: 'advisor@victoryrecon.local' },
      update: {},
      create: { name: 'Default Advisor', role: Role.ADVISOR, email: 'advisor@victoryrecon.local' }
    })
  ])

 const detailer = await prisma.vendor.create({
  data: { name: 'Premier Detail', vendorType: 'Detailer', contact: 'detail@vendor.local' }
})


  await prisma.vehicle.createMany({
    data: [
      { stockNumber: 'V1234', vin: '1HGBH41JXMN109186', year: 2021, make: 'Honda', model: 'Accord', trim: 'EX', miles: 32500, location: Location.ON_LOT, keysCount: 1, status: Status.INSPECTION },
      { stockNumber: 'V1235', vin: '1HGCM82633A004352', year: 2020, make: 'Honda', model: 'Civic', trim: 'Sport', miles: 21500, location: Location.IN_TRANSPORT, keysCount: 2, status: Status.AWAITING_APPROVAL },
      { stockNumber: 'V1236', vin: '1N4AL11D75C109151', year: 2019, make: 'Nissan', model: 'Altima', trim: 'SV', miles: 45500, location: Location.AT_VENDOR, keysCount: 2, status: Status.SUBLET_DETAIL, vendorId: detailer.id }
    ]
  })

  const vehicles = await prisma.vehicle.findMany()
  for (const v of vehicles) {
    await prisma.activityLog.create({
      data: {
        vehicleId: v.id,
        userId: advisor.id,
        role: Role.ADVISOR,
        message: `Vehicle ${v.stockNumber} seeded with status ${v.status}`,
        toStatus: v.status
      }
    })
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
