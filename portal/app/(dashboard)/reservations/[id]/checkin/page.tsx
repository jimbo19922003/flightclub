import { prisma } from "@/lib/prisma";
import CheckInForm from "@/components/forms/CheckInForm";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CheckInPage({ params }: { params: { id: string } }) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: params.id },
    include: { aircraft: true }
  });

  if (!reservation) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Check In Flight</h1>
      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <p className="text-blue-800">
            <strong>Reservation:</strong> {reservation.aircraft.registration} on {reservation.startTime.toDateString()}
        </p>
      </div>
      
      <CheckInForm reservation={reservation} aircraft={reservation.aircraft} />
    </div>
  );
}
