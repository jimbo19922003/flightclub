import { prisma } from "@/lib/prisma";
import CheckOutForm from "@/components/forms/CheckOutForm";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

async function getSettings() {
    try {
        return await prisma.clubSettings.findFirst();
    } catch {
        return null;
    }
}

import { updateFuelPricesInDB } from "@/app/actions/fuel";

export default async function CheckOutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Ensure we have settings loaded
  const dbSettings = await getSettings();
  
  // Try to fresh-fetch prices if home airport is set (best effort, don't block too long)
  if (dbSettings?.homeAirport) {
      try {
          await updateFuelPricesInDB(dbSettings.homeAirport);
          // Re-fetch settings after update
          const freshSettings = await getSettings();
          if (freshSettings) Object.assign(dbSettings, freshSettings); 
      } catch (e) {
          console.error("Failed to auto-refresh fuel prices on checkout page load", e);
      }
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { 
        aircraft: true,
        flightLog: true,
        user: { include: { membershipTier: true } }
    }
  });

  if (!reservation) {
    notFound();
  }
  
  // Determine correct fuel price based on aircraft fuel type
  let homeAirportFuelPrice = dbSettings?.fuelPrice100LL || 0;
  if (reservation.aircraft.fuelType === 'JetA') {
      homeAirportFuelPrice = dbSettings?.fuelPriceJetA || 0;
  } else if (reservation.aircraft.fuelType === 'UL94') {
      homeAirportFuelPrice = dbSettings?.fuelPriceUL94 || 0;
  }
  
  // Fetch Postflight Checklist
  const checklist = await prisma.checklist.findFirst({
      where: { 
          aircraftId: reservation.aircraftId,
          type: 'POSTFLIGHT'
      },
      include: { items: { orderBy: { order: 'asc' } } }
    });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Complete Flight (Check Out)</h1>
      <div className="bg-yellow-50 p-4 rounded-md mb-6">
        <p className="text-yellow-800">
            <strong>Active Flight:</strong> {reservation.aircraft.registration}
        </p>
      </div>
      
      <CheckOutForm 
        reservation={reservation} 
        aircraft={reservation.aircraft}
        checklist={checklist}
        homeAirportFuelPrice={homeAirportFuelPrice}
      />
    </div>
  );
}
