import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ReservationCalendar from "@/components/ReservationCalendar";

export const dynamic = 'force-dynamic';

async function getReservations(aircraftId?: string) {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1); 

    const where: any = {
        startTime: { gte: startDate }
    };

    if (aircraftId) {
        where.aircraftId = aircraftId;
    }

    return await prisma.reservation.findMany({
      include: {
        user: true,
        aircraft: true,
      },
      orderBy: { startTime: 'asc' },
      where
    });
  } catch (error) {
    console.error("Failed to fetch reservations:", error);
    return [];
  }
}

async function getAircraft() {
    return await prisma.aircraft.findMany({
        orderBy: { registration: 'asc' },
        select: { id: true, registration: true }
    });
}

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<{ aircraftId?: string }> }) {
  const params = await searchParams;
  const reservations = await getReservations(params.aircraftId);
  const aircraftList = await getAircraft();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Reservations & Schedule</h1>
        <div className="flex gap-4">
            {/* Aircraft Filter */}
            <form className="flex items-center gap-2">
                <select 
                    name="aircraftId" 
                    defaultValue={params.aircraftId || ""}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                >
                    <option value="">All Aircraft</option>
                    {aircraftList.map(ac => (
                        <option key={ac.id} value={ac.id}>{ac.registration}</option>
                    ))}
                </select>
                <button type="submit" className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 text-sm">Filter</button>
            </form>

            <Link href="/reservations/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium whitespace-nowrap">
            New Reservation
            </Link>
        </div>
      </div>

      {/* Calendar View */}
      <div className="space-y-4">
         <ReservationCalendar events={reservations} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-white p-3 rounded-lg border">
          <div className="flex items-center"><span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span> Confirmed</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span> Checked Out</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span> Completed</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span> Cancelled</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span> Maintenance</div>
      </div>
    </div>
  );
}
