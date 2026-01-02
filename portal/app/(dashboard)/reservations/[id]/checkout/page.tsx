import { prisma } from "@/lib/prisma";
import CheckOutForm from "@/components/forms/CheckOutForm";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CheckOutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { aircraft: true, flightLog: true }
  });

  if (!reservation || reservation.status !== "CHECKED_OUT") {
    // Or redirect to summary if already completed
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Postflight & Check Out</h1>
      <div className="bg-green-50 p-4 rounded-md mb-6 border border-green-200">
        <p className="text-green-800">
            <strong>Active Flight:</strong> {reservation.aircraft.registration}
        </p>
        <p className="text-sm text-green-700 mt-1">
            Started at: {reservation.flightLog?.hobbsStart} Hobbs
        </p>
      </div>
      
      <CheckOutForm reservation={reservation} aircraft={reservation.aircraft} />
    </div>
  );
}
