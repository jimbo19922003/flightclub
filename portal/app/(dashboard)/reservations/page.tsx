import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ReservationCalendar from "@/components/ReservationCalendar";

export const dynamic = 'force-dynamic';

async function getReservations() {
  try {
    // Fetch MORE reservations for the calendar (past and future)
    // In a real app, you'd fetch based on the current calendar view window
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1); // Get last month too

    return await prisma.reservation.findMany({
      include: {
        user: true,
        aircraft: true,
      },
      orderBy: { startTime: 'asc' },
      where: {
          startTime: { gte: startDate }
      }
    });
  } catch (error) {
    console.error("Failed to fetch reservations:", error);
    return [];
  }
}

export default async function ReservationsPage() {
  const reservations = await getReservations();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Reservations & Schedule</h1>
        <Link href="/reservations/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
          New Reservation
        </Link>
      </div>

      {/* Calendar View */}
      <div className="space-y-4">
         <ReservationCalendar events={reservations} />
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm text-gray-600 bg-white p-3 rounded-lg border">
          <div className="flex items-center"><span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span> Confirmed</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span> Checked Out</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span> Completed</div>
      </div>
    </div>
  );
}
