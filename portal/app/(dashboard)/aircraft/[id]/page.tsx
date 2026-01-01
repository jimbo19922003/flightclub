import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Plane, ExternalLink } from "lucide-react";

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

export default async function AircraftDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const aircraft = await getAircraft(id);

  if (!aircraft) {
      notFound();
  }

  // Determine flight tracking URLs
  const flightAwareUrl = `https://www.flightaware.com/live/flight/${aircraft.registration}`;
  const adsbExchangeUrl = aircraft.icaoHex 
    ? `https://globe.adsbexchange.com/?icao=${aircraft.icaoHex}`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">{aircraft.registration}</h1>
            <p className="text-gray-500">{aircraft.year} {aircraft.make} {aircraft.model}</p>
         </div>
         <div className="flex gap-4">
             <Link href={`/aircraft/${aircraft.id}/edit`} className="bg-white border text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium">Edit</Link>
             <Link href="/aircraft" className="text-gray-600 hover:text-gray-900 self-center">Back to Fleet</Link>
         </div>
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
                  {aircraft.icaoHex && (
                      <div className="col-span-2">
                          <span className="block text-sm text-gray-500">ADS-B Hex (ICAO)</span>
                          <span className="font-mono text-sm">{aircraft.icaoHex}</span>
                      </div>
                  )}
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

          {/* Flight Tracking Card */}
          {adsbExchangeUrl ? (
            <div className="bg-white rounded-xl shadow border overflow-hidden flex flex-col h-[400px]">
                <div className="bg-gray-50 p-2 text-xs text-center border-b flex justify-between items-center px-4">
                     <span className="text-gray-500">Powered by ADS-B Exchange</span>
                     <a href={flightAwareUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center">
                        Alt: FlightAware <ExternalLink size={10} className="ml-1"/>
                     </a>
                </div>
                <iframe 
                    src={adsbExchangeUrl}
                    className="w-full h-full"
                    title="Live Flight Tracking"
                />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow border overflow-hidden flex flex-col h-[400px] items-center justify-center bg-slate-50 text-center p-6">
                <Plane size={48} className="text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">Live Flight Tracking</h3>
                <p className="text-slate-500 mb-6 max-w-xs">
                    Configure <strong>ADS-B Hex Code</strong> to enable native map embedding.
                </p>
                <a 
                    href={flightAwareUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-bold flex items-center"
                >
                    Open FlightAware <ExternalLink size={16} className="ml-2" />
                </a>
            </div>
          )}
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
