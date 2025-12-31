import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

async function getAircraft() {
  try {
    return await prisma.aircraft.findMany({
      orderBy: { registration: 'asc' }
    });
  } catch (error) {
    console.error("Failed to fetch aircraft:", error);
    return [];
  }
}

export default async function AircraftPage() {
  const aircraftList = await getAircraft();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Aircraft Fleet</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Add Aircraft
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {aircraftList.map((plane) => (
          <div key={plane.id} className="bg-white rounded-xl shadow border overflow-hidden">
             {plane.image && (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img src={plane.image} alt={plane.registration} className="h-48 w-full object-cover" />
             )}
             <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{plane.registration}</h2>
                        <p className="text-sm text-gray-500">{plane.year} {plane.make} {plane.model}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                        ${plane.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                          plane.status === 'MAINTENANCE' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {plane.status}
                    </span>
                </div>
                
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Hourly Rate:</span>
                        <span className="font-medium">${plane.hourlyRate}/hr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Current Hobbs:</span>
                        <span className="font-mono">{plane.currentHobbs.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Current Tach:</span>
                        <span className="font-mono">{plane.currentTach.toFixed(1)}</span>
                    </div>
                </div>
             </div>
          </div>
        ))}
        {aircraftList.length === 0 && (
            <div className="col-span-full text-center py-10 bg-white rounded-xl border border-dashed">
                <p className="text-gray-500">No aircraft found (or database error).</p>
            </div>
        )}
      </div>
    </div>
  );
}
