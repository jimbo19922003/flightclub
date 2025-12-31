import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getReservations() {
  try {
    return await prisma.reservation.findMany({
      include: {
        user: true,
        aircraft: true,
      },
      orderBy: { startTime: 'asc' },
      where: {
          startTime: { gte: new Date() } // Upcoming
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
        <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
        <Link href="/reservations/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          New Reservation
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">Upcoming Flights</h2>
            <button className="text-sm text-blue-600 hover:underline">Sync with Google Calendar</button>
        </div>
        <ul className="divide-y divide-gray-200">
          {reservations.map((res) => (
            <li key={res.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded text-blue-800 font-bold text-center min-w-[60px]">
                        <div className="text-xs uppercase">{format(res.startTime, 'MMM')}</div>
                        <div className="text-xl">{format(res.startTime, 'd')}</div>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{res.aircraft.registration} - {res.aircraft.make} {res.aircraft.model}</p>
                        <p className="text-sm text-gray-500">Pilot: {res.user.name}</p>
                        <p className="text-sm text-gray-500">
                            {format(res.startTime, 'h:mm a')} - {format(res.endTime, 'h:mm a')}
                        </p>
                    </div>
                </div>
                <div>
                     <Link href={`/reservations/${res.id}/checkin`} className="text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-100">
                        Check In
                     </Link>
                </div>
              </div>
            </li>
          ))}
          {reservations.length === 0 && (
             <li className="p-8 text-center text-gray-500">
                 No upcoming reservations.
             </li>
          )}
        </ul>
      </div>
    </div>
  );
}
