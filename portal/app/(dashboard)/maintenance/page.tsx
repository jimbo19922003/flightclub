import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Wrench, AlertTriangle, CheckCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getAircraftMaintenanceStatus() {
  try {
    const aircraft = await prisma.aircraft.findMany({
      include: {
        maintenance: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    });
    return aircraft;
  } catch (error) {
    console.error("Failed to fetch aircraft maintenance status:", error);
    return [];
  }
}

export default async function MaintenancePage() {
  const aircraftList = await getAircraftMaintenanceStatus();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Tracking</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Record Maintenance
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {aircraftList.map((plane) => {
           // Logic to determine status color
           const isGrounded = plane.status === 'GROUNDED' || plane.status === 'MAINTENANCE';
           const daysToAnnual = plane.nextAnnual ? Math.ceil((plane.nextAnnual.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 999;
           const hoursTo100 = plane.next100Hour ? plane.next100Hour - plane.currentTach : 999;
           
           let statusColor = "bg-green-100 border-green-200";
           if (isGrounded) statusColor = "bg-red-100 border-red-200";
           else if (daysToAnnual < 30 || hoursTo100 < 10) statusColor = "bg-yellow-100 border-yellow-200";

           return (
            <div key={plane.id} className={`rounded-xl border shadow p-6 ${statusColor}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{plane.registration}</h2>
                  <p className="text-sm text-gray-600">{plane.make} {plane.model}</p>
                </div>
                {isGrounded ? <AlertTriangle className="text-red-600" /> : <CheckCircle className="text-green-600" />}
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Tach:</span>
                  <span className="font-mono font-medium">{plane.currentTach.toFixed(1)}</span>
                </div>
                
                <div className="border-t border-gray-300/50 pt-2">
                  <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Due Items</p>
                  <div className="flex justify-between text-sm">
                    <span>Annual:</span>
                    <span className={daysToAnnual < 30 ? "text-red-600 font-bold" : ""}>
                      {plane.nextAnnual ? format(plane.nextAnnual, 'MMM d, yyyy') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>100 Hour:</span>
                    <span className={hoursTo100 < 10 ? "text-red-600 font-bold" : ""}>
                      {plane.next100Hour ? plane.next100Hour.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                   <div className="flex justify-between text-sm">
                    <span>Oil Change:</span>
                    <span>
                      {plane.nextOilChange ? plane.nextOilChange.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {aircraftList.length === 0 && (
            <div className="col-span-full text-center py-10 bg-white rounded-xl border border-dashed">
                <p className="text-gray-500">No aircraft found. Add aircraft to start tracking maintenance.</p>
            </div>
        )}
      </div>
    </div>
  );
}
