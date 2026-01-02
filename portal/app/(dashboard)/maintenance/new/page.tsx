import { prisma } from "@/lib/prisma";
import { createMaintenanceLog } from "@/app/actions/maintenance";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getAircraftList() {
    try {
        return await prisma.aircraft.findMany({
            orderBy: { registration: 'asc' }
        });
    } catch (e) {
        return [];
    }
}

export default async function NewMaintenanceLogPage() {
  const aircraftList = await getAircraftList();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold tracking-tight">Record Maintenance</h1>
         <Link href="/maintenance" className="text-gray-600 hover:text-gray-900">Cancel</Link>
      </div>
      
      <div className="bg-white rounded-xl shadow border p-6">
        <form action={createMaintenanceLog} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Aircraft</label>
                <select 
                    name="aircraftId" 
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                >
                    <option value="">Select Aircraft...</option>
                    {aircraftList.map(p => (
                        <option key={p.id} value={p.id}>{p.registration} ({p.make} {p.model})</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select 
                    name="type" 
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                >
                    <option value="OIL_CHANGE">Oil Change</option>
                    <option value="ANNUAL">Annual Inspection</option>
                    <option value="ONE_HUNDRED_HOUR">100 Hour Inspection</option>
                    <option value="REPAIR">Repair / Squawk Fix</option>
                    <option value="UPGRADE">Upgrade</option>
                    <option value="AD_COMPLIANCE">AD Compliance</option>
                </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title / Short Desc</label>
                    <input 
                        type="text" 
                        name="title" 
                        required
                        placeholder="e.g. 50 Hr Oil Change"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Date Performed</label>
                    <input 
                        type="date" 
                        name="date" 
                        required
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Description / Details</label>
                <textarea 
                    name="description" 
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
            </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cost ($)</label>
                    <input 
                        type="number" 
                        name="cost" 
                        step="0.01"
                        placeholder="0.00"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Performed By (Mechanic/Shop)</label>
                    <input 
                        type="text" 
                        name="performedBy" 
                        placeholder="e.g. John Doe A&P"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
            </div>
            
            <div className="pt-4">
                <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-bold"
                >
                    Save Log
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
