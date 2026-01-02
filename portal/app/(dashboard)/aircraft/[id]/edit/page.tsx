import { updateAircraft } from "@/app/actions/aircraft";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

import ClientRateWrapper from "@/components/ClientRateWrapper";

export const dynamic = 'force-dynamic';

export default async function EditAircraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const aircraft = await prisma.aircraft.findUnique({
      where: { id }
  });

  if (!aircraft) {
      notFound();
  }

  const updateAircraftWithId = updateAircraft.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold tracking-tight">Edit Aircraft</h1>
         <Link href={`/aircraft/${id}`} className="text-gray-600 hover:text-gray-900">Cancel</Link>
      </div>
      
      <div className="bg-white rounded-xl shadow border p-6">
        <form action={updateAircraftWithId} className="space-y-4">
            <input type="hidden" name="rateConfiguration" id="rateConfiguration" />
            <ClientRateWrapper aircraft={aircraft} />
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Registration (Tail #)</label>
                    <input 
                        type="text" 
                        name="registration" 
                        required
                        defaultValue={aircraft.registration}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">ADS-B Hex Code (ICAO)</label>
                    <input 
                        type="text" 
                        name="icaoHex" 
                        defaultValue={aircraft.icaoHex || ""}
                        placeholder="e.g. A51D23"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Make</label>
                    <input 
                        type="text" 
                        name="make" 
                        required
                        defaultValue={aircraft.make}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Model</label>
                    <input 
                        type="text" 
                        name="model" 
                        required
                        defaultValue={aircraft.model}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <input 
                        type="number" 
                        name="year" 
                        required
                        defaultValue={aircraft.year}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        name="status"
                        defaultValue={aircraft.status}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    >
                        <option value="AVAILABLE">Available</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="GROUNDED">Grounded</option>
                        <option value="IN_USE">In Use</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                    <select
                        name="fuelType"
                        defaultValue={aircraft.fuelType || "OneHundredLL"}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    >
                        <option value="OneHundredLL">100LL</option>
                        <option value="JetA">Jet A</option>
                        <option value="MoGas">MoGas</option>
                        <option value="UL94">UL94</option>
                    </select>
                </div>
            </div>

            <hr className="my-4" />

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
                    <input 
                        type="number" 
                        name="hourlyRate" 
                        id="hourlyRate"
                        step="0.01"
                        required
                        defaultValue={aircraft.hourlyRate}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-gray-50"
                        readOnly
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Rate Type</label>
                    <select
                        name="rateType"
                        defaultValue={aircraft.rateType || "WET"} // Default to WET if migrated
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    >
                        <option value="WET">Wet (Fuel Inc)</option>
                        <option value="DRY">Dry (No Fuel)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Current Hobbs</label>
                    <input 
                        type="number" 
                        name="currentHobbs" 
                        step="0.1"
                        required
                        defaultValue={aircraft.currentHobbs}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Current Tach</label>
                    <input 
                        type="number" 
                        name="currentTach" 
                        step="0.1"
                        required
                        defaultValue={aircraft.currentTach}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                </div>
            </div>
            
            <div className="pt-4">
                <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-bold"
                >
                    Save Changes
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
