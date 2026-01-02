import { prisma } from "@/lib/prisma";
import { createReservation } from "@/app/actions/reservations";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

async function getData() {
    try {
        const users = await prisma.user.findMany({ orderBy: { name: 'asc' } });
        const aircraft = await prisma.aircraft.findMany({ 
            // We want to allow scheduling maintenance on grounded/maintenance planes too, 
            // but for bookings we usually only want available. 
            // For simplicity, list all, but maybe show status.
            orderBy: { registration: 'asc' } 
        });
        return { users, aircraft };
    } catch (e) {
        return { users: [], aircraft: [] };
    }
}

export default async function NewReservationPage({ searchParams }: { searchParams: Promise<{ start?: string, end?: string, aircraftId?: string, type?: string }> }) {
  const params = await searchParams;
  const { users, aircraft } = await getData();

  // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
  const formatForInput = (dateStr?: string) => {
      if (!dateStr) return "";
      try {
        return new Date(dateStr).toISOString().slice(0, 16);
      } catch (e) { return ""; }
  };

  const defaultStart = formatForInput(params.start);
  const defaultEnd = formatForInput(params.end);
  const defaultType = params.type || "FLIGHT";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold tracking-tight">
             {defaultType === 'MAINTENANCE' ? 'Schedule Maintenance' : 'New Reservation'}
         </h1>
         <Link href="/reservations" className="text-gray-600 hover:text-gray-900">Cancel</Link>
      </div>
      
      <div className="bg-white rounded-xl shadow border p-6">
        <form action={createReservation} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Reservation Type</label>
                    <select 
                        name="type" 
                        defaultValue={defaultType}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    >
                        <option value="FLIGHT">Flight</option>
                        <option value="INSTRUCTION">Instruction</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="GROUND_SCHOOL">Ground School</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Aircraft</label>
                    <select 
                        name="aircraftId" 
                        required
                        defaultValue={params.aircraftId || ""}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    >
                        <option value="">Select Aircraft...</option>
                        {aircraft.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.registration} ({a.make} {a.model}) - {a.status}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    {defaultType === 'MAINTENANCE' ? 'Tech / Authorized By' : 'Pilot / Member'}
                </label>
                <select 
                    name="userId" 
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                >
                    <option value="">Select Person...</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input 
                        type="datetime-local" 
                        name="startTime" 
                        defaultValue={defaultStart}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <input 
                        type="datetime-local" 
                        name="endTime" 
                        defaultValue={defaultEnd}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Notes / Description</label>
                <textarea 
                    name="notes" 
                    rows={3}
                    placeholder={defaultType === 'MAINTENANCE' ? "Describe maintenance task..." : "Destination, training details, etc."}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
            </div>

            <div className="pt-4">
                <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-bold"
                >
                    {defaultType === 'MAINTENANCE' ? 'Block Schedule' : 'Book Flight'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
