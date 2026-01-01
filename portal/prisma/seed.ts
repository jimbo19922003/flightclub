import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  const hashedPassword = await bcrypt.hash('AdminLogin2Day', 10)

  // Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flightclub.com' },
    update: {
      password: hashedPassword // Ensure password is set if user exists
    },
    create: {
      email: 'admin@flightclub.com',
      name: 'Admin User',
      role: 'ADMIN',
      shareSize: 1.0,
      password: hashedPassword,
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

  // Create Default Club Settings
  const settings = await prisma.clubSettings.findFirst()
  if (!settings) {
    await prisma.clubSettings.create({
      data: {
        name: 'My Flight Club',
        type: 'EQUITY',
        homeAirport: 'KOSH',
        currency: 'USD',
        timezone: 'America/Chicago',
        monthlyDues: 100.0,
        billingCycleDay: 1,
        maxReservationsPerUser: 3,
        maxReservationDays: 7,
      }
    })
  }

  // Create Default Membership Tier
  const fullShare = await prisma.membershipTier.findFirst({ where: { name: 'Full Share' } })
  if (!fullShare) {
    await prisma.membershipTier.create({
      data: {
        name: 'Full Share',
        monthlyDues: 100.0,
        maxReservations: 4,
        maxDaysPerReservation: 7,
        bookingWindowDays: 90,
        hourlyRateDiscount: 10.0, // 10% off
      }
    })
  }

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
