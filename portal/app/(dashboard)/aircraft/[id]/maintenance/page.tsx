import { prisma } from "@/lib/prisma";
import { getAircraftMaintenanceStatus } from "@/lib/maintenance";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AircraftMaintenancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const aircraft = await prisma.aircraft.findUnique({
    where: { id },
    include: { maintenance: { orderBy: { date: 'desc' }, take: 10 } }
  });

  if (!aircraft) notFound();

  const statuses = await getAircraftMaintenanceStatus(id);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance Status</h1>
            <p className="text-gray-500">{aircraft.registration} - {aircraft.make} {aircraft.model}</p>
        </div>
        <Link href={`/aircraft/${id}`} className="text-gray-600 hover:text-gray-900 font-medium">
            Back to Aircraft
        </Link>
      </div>

      {/* Status Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statuses.map((status) => (
            <div key={status.scheduleId} className={`rounded-xl shadow border p-6 ${
                status.status === 'OVERDUE' ? 'bg-red-50 border-red-200' :
                status.status === 'WARNING' ? 'bg-yellow-50 border-yellow-200' :
                'bg-white'
            }`}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-gray-900">{status.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        status.status === 'OVERDUE' ? 'bg-red-200 text-red-800' :
                        status.status === 'WARNING' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                        {status.status}
                    </span>
                </div>
                
                <div className="space-y-2 text-sm">
                    {status.hoursRemaining !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Hours Remaining:</span>
                            <span className="font-mono font-medium">{status.hoursRemaining.toFixed(1)}</span>
                        </div>
                    )}
                    {status.daysRemaining !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Days Remaining:</span>
                            <span className="font-mono font-medium">{status.daysRemaining}</span>
                        </div>
                    )}
                </div>
            </div>
        ))}

        {statuses.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No recurring maintenance schedules configured.</p>
                <button className="mt-2 text-blue-600 hover:underline font-medium">Add Schedule</button>
            </div>
        )}
      </div>

      {/* Recent Maintenance Log */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-700">Maintenance Log History</h2>
              <Link href="/maintenance/new" className="text-sm bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-50 text-gray-700">
                + Log Entry
              </Link>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tech</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                  {aircraft.maintenance.map((log) => (
                      <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(log.date, 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {log.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.performedBy || '-'}
                          </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${log.cost?.toFixed(2) || '0.00'}
                          </td>
                      </tr>
                  ))}
                   {aircraft.maintenance.length === 0 && (
                      <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                              No maintenance logs recorded.
                          </td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
}
