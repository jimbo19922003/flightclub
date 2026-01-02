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

export default async function CheckOutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { 
        aircraft: true,
        flightLog: true
    }
  });

  if (!reservation) {
    notFound();
  }
  
  const settings = await getSettings();
  
  // Determine correct fuel price based on aircraft fuel type
  let homeAirportFuelPrice = settings?.fuelPrice100LL || 0;
  if (reservation.aircraft.fuelType === 'JetA') {
      homeAirportFuelPrice = settings?.fuelPriceJetA || 0;
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
