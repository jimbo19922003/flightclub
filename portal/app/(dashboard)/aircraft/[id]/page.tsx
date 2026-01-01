import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

async function getAircraft(id: string) {
    try {
        const aircraft = await prisma.aircraft.findUnique({
            where: { id },
            include: {
                maintenance: {
                    orderBy: { date: 'desc' },
                    take: 5
                },
                flightLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    include: { user: true }
                }
            }
        });
        return aircraft;
    } catch (e) {
        return null;
    }
}

export default async function AircraftDetailPage({ params }: { params: { id: string } }) {
  const aircraft = await getAircraft(params.id);

  if (!aircraft) {
      notFound();
  }

  // Determine flight tracking URL
  const flightAwareUrl = `https://www.flightaware.com/live/flight/${aircraft.registration}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">{aircraft.registration}</h1>
            <p className="text-gray-500">{aircraft.year} {aircraft.make} {aircraft.model}</p>
         </div>
         <Link href="/aircraft" className="text-gray-600 hover:text-gray-900">Back to Fleet</Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow border p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Status & Meters</h2>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <span className="block text-sm text-gray-500">Status</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                        ${aircraft.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                          aircraft.status === 'MAINTENANCE' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {aircraft.status}
                    </span>
                  </div>
                  <div>
                      <span className="block text-sm text-gray-500">Hourly Rate</span>
                      <span className="font-mono text-lg">${aircraft.hourlyRate}/hr</span>
                  </div>
                  <div>
                      <span className="block text-sm text-gray-500">Hobbs Meter</span>
                      <span className="font-mono text-lg">{aircraft.currentHobbs.toFixed(1)}</span>
                  </div>
                  <div>
                      <span className="block text-sm text-gray-500">Tach Meter</span>
                      <span className="font-mono text-lg">{aircraft.currentTach.toFixed(1)}</span>
                  </div>
              </div>
              
              <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-2">Maintenance Due</h3>
                  <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                          <span>Annual Inspection:</span>
                          <span className={aircraft.nextAnnual && aircraft.nextAnnual < new Date() ? "text-red-600 font-bold" : ""}>
                              {aircraft.nextAnnual ? format(aircraft.nextAnnual, 'MMM d, yyyy') : 'N/A'}
                          </span>
                      </div>
                      <div className="flex justify-between">
                          <span>Oil Change (Tach):</span>
                          <span>{aircraft.nextOilChange ? aircraft.nextOilChange.toFixed(1) : 'N/A'}</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Flight Tracking Iframe */}
          <div className="bg-white rounded-xl shadow border overflow-hidden flex flex-col h-[400px]">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                  <h2 className="font-bold text-gray-900">Live Tracking</h2>
                  <a href={flightAwareUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                      View on FlightAware &rarr;
                  </a>
              </div>
              <div className="flex-1 relative">
                  {/* FlightAware doesn't easily allow direct iframing of the main page due to headers, 
                      but we can try or provide a fallback. Many flight trackers block iframes. 
                      We will attempt it, but the link above is the backup. */}
                  <iframe 
                    src={flightAwareUrl} 
                    className="w-full h-full border-0"
                    title="Flight Tracking"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
              </div>
          </div>
      </div>

      {/* Maintenance History */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Recent Maintenance</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tech</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                  {aircraft.maintenance.map(log => (
                      <tr key={log.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">{format(log.date, 'MMM d, yyyy')}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{log.type}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{log.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{log.performedBy}</td>
                      </tr>
                  ))}
                  {aircraft.maintenance.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No records found.</td></tr>
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
}
