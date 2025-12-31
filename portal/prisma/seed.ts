import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flightclub.com' },
    update: {},
    create: {
      email: 'admin@flightclub.com',
      name: 'Admin User',
      role: 'ADMIN',
      shareSize: 1.0,
    },
  })
  
  const member = await prisma.user.upsert({
    where: { email: 'pilot@flightclub.com' },
    update: {},
    create: {
      email: 'pilot@flightclub.com',
      name: 'John Pilot',
      role: 'MEMBER',
      shareSize: 0.5,
    },
  })

  // Create Aircraft
  const cessna = await prisma.aircraft.upsert({
    where: { registration: 'N12345' },
    update: {},
    create: {
      registration: 'N12345',
      make: 'Cessna',
      model: '172S',
      year: 2005,
      hourlyRate: 150.0,
      currentHobbs: 2450.5,
      currentTach: 2100.2,
      status: 'AVAILABLE',
      nextAnnual: new Date('2025-12-01'),
      nextOilChange: 2150.0,
    },
  })

  const piper = await prisma.aircraft.upsert({
    where: { registration: 'N98765' },
    update: {},
    create: {
      registration: 'N98765',
      make: 'Piper',
      model: 'Archer III',
      year: 2010,
      hourlyRate: 175.0,
      currentHobbs: 1800.0,
      currentTach: 1600.0,
      status: 'MAINTENANCE',
      nextAnnual: new Date('2025-06-15'),
      nextOilChange: 1625.0,
    },
  })

  // Create Reservations
  await prisma.reservation.create({
    data: {
      userId: member.id,
      aircraftId: cessna.id,
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 26),
      type: 'FLIGHT',
      notes: 'Cross country training',
    },
  })

  // Create Maintenance Log
  await prisma.maintenanceLog.create({
    data: {
      aircraftId: piper.id,
      title: '50 Hour Inspection',
      description: 'Routine oil change and inspection.',
      date: new Date(),
      type: 'OIL_CHANGE',
      cost: 350.0,
      performedBy: 'A&P Mechanic',
    },
  })

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
