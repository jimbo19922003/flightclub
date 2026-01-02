import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function ActiveFlightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { aircraft: true, flightLog: true, user: true }
  });

  if (!reservation) notFound();

  // If flight not active, redirect appropriately
  if (reservation.status === 'CONFIRMED') redirect(`/reservations/${id}/checkin`);
  if (reservation.status === 'COMPLETED') redirect(`/reservations`); // Should go to summary

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-center pt-12">
        <div className="bg-green-100 text-green-800 inline-flex items-center px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wide animate-pulse">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
            Flight in Progress
        </div>

        <div>
            <h1 className="text-5xl font-bold text-gray-900">{reservation.aircraft.registration}</h1>
            <p className="text-xl text-gray-500 mt-2">Pilot: {reservation.user.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-lg border">
            <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Start Time</p>
                <p className="text-2xl font-mono mt-1">{format(reservation.checkInTime!, "h:mm a")}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Start Hobbs</p>
                <p className="text-2xl font-mono mt-1">{reservation.flightLog?.hobbsStart.toFixed(1)}</p>
            </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-lg mx-auto">
            <h3 className="font-bold text-blue-900 mb-2">Preflight Notes</h3>
            <p className="text-blue-800 text-sm">
                Aircraft dispatched at {format(reservation.checkInTime!, "h:mm a")}. 
                Preflight checklist completed.
            </p>
        </div>

        <div className="pt-8">
            <Link 
                href={`/reservations/${id}/checkout`}
                className="bg-red-600 text-white text-xl font-bold px-12 py-4 rounded-full shadow-lg hover:bg-red-700 hover:scale-105 transition-transform"
            >
                End Flight & Check In
            </Link>
        </div>
    </div>
  );
}
