import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function FlightSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { aircraft: true, flightLog: true, user: true }
  });

  if (!reservation || reservation.status !== "COMPLETED" || !reservation.flightLog) {
      // Or fallback logic
      notFound();
  }

  const log = reservation.flightLog;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
             <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full text-green-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-gray-900">Flight Complete</h1>
             <p className="text-gray-500">Your flight has been logged and invoiced.</p>
        </div>

        <div className="bg-white rounded-xl shadow border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Flight Summary</h3>
                <span className="text-sm text-gray-500">{format(reservation.startTime, 'MMM d, yyyy')}</span>
            </div>
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Aircraft</p>
                        <p className="font-semibold text-lg">{reservation.aircraft.registration}</p>
                    </div>
                     <div>
                        <p className="text-xs text-gray-500 uppercase">Total Time</p>
                        <p className="font-semibold text-lg">{log.flightTime.toFixed(1)} hrs</p>
                    </div>
                </div>

                <div className="border-t pt-4">
                     <div className="flex justify-between text-sm py-1">
                        <span className="text-gray-600">Flight Cost</span>
                        <span className="font-medium">${(log.cost + (log.fuelReimbursement || 0)).toFixed(2)}</span>
                     </div>
                     {log.fuelReimbursement && log.fuelReimbursement > 0 && (
                        <div className="flex justify-between text-sm py-1 text-green-600">
                            <span>Fuel Reimbursement</span>
                            <span className="font-medium">-${log.fuelReimbursement.toFixed(2)}</span>
                        </div>
                     )}
                     <div className="flex justify-between text-lg font-bold border-t mt-2 pt-2">
                        <span>Total Billed</span>
                        <span>${log.cost.toFixed(2)}</span>
                     </div>
                </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                <Link href="/reservations" className="text-gray-600 hover:text-gray-900 font-medium">
                    Back to Schedule
                </Link>
                <Link href="/billing" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
                    View Invoice
                </Link>
            </div>
        </div>
    </div>
  );
}
