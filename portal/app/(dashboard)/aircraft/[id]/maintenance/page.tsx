import { prisma } from "@/lib/prisma";
import { getAircraftMaintenanceStatus } from "@/lib/maintenance";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import MaintenanceScheduleList from "@/components/MaintenanceScheduleList";
import SquawkList from "@/components/SquawkList";

export const dynamic = 'force-dynamic';

export default async function AircraftMaintenancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const aircraft = await prisma.aircraft.findUnique({
    where: { id },
    include: { 
        maintenance: { orderBy: { date: 'desc' }, take: 10 },
        flightLogs: {
            where: {
                notes: { not: null },
                NOT: { notes: { startsWith: "[RESOLVED]" } }
            },
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        }
    }
  });

  if (!aircraft) notFound();

  const squawks = aircraft.flightLogs.filter(log => log.notes && log.notes.trim().length > 0);
  const statuses = await getAircraftMaintenanceStatus(id);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance Status</h1>
            <p className="text-gray-500">{aircraft.registration} - {aircraft.make} {aircraft.model}</p>
        </div>
        <div className="flex gap-4">
             <Link href={`/reservations/new?type=MAINTENANCE&aircraftId=${id}`} className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 font-medium">
                Schedule Maintenance
             </Link>
             <Link href={`/aircraft/${id}`} className="text-gray-600 hover:text-gray-900 font-medium self-center">
                Back to Aircraft
             </Link>
        </div>
      </div>

      {/* Interactive Schedule List (Client Component) */}
      <MaintenanceScheduleList aircraftId={id} statuses={statuses} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Squawks Section */}
          <div className="bg-white rounded-xl shadow border overflow-hidden">
              <div className="px-6 py-4 border-b bg-red-50 flex justify-between items-center">
                  <h2 className="font-semibold text-red-900">Open Squawks & Issues</h2>
                  <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded-full">{squawks.length}</span>
              </div>
              <div className="p-6">
                  <SquawkList squawks={squawks} />
              </div>
          </div>

          {/* Recent Maintenance Log */}
          <div className="bg-white rounded-xl shadow border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-700">Maintenance Log History</h2>
                  {/* Keep the generic Log Entry link or update it. existing link was /maintenance/new but that might be general. */}
                  {/* Let's keep it but ideally it should pre-fill aircraft. */}
                  <Link href="/maintenance/new" className="text-sm bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-50 text-gray-700">
                    + Log Entry
                  </Link>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                      {aircraft.maintenance.map((log) => (
                          <tr key={log.id}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {format(log.date, 'MMM d')}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium truncate max-w-[150px]" title={log.title}>
                                {log.title}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {log.type}
                              </td>
                          </tr>
                      ))}
                       {aircraft.maintenance.length === 0 && (
                          <tr>
                              <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                                  No maintenance logs.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}
