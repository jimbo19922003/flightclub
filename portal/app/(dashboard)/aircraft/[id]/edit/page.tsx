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
  
  const settings = await prisma.clubSettings.findFirst();

  if (!aircraft) {
      notFound();
  }
  
  // Determine relevant fuel price for calculator
  let fuelPrice = settings?.fuelPrice100LL || 6.00;
  if (aircraft.fuelType === 'JetA') fuelPrice = settings?.fuelPriceJetA || 5.50;
  if (aircraft.fuelType === 'UL94') fuelPrice = settings?.fuelPriceUL94 || 6.00;
  if (aircraft.fuelType === 'MoGas') fuelPrice = 5.00; // Fallback

  const updateAircraftWithId = updateAircraft.bind(null, id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold tracking-tight">Edit Aircraft</h1>
         <Link href={`/aircraft/${id}`} className="text-gray-600 hover:text-gray-900">Cancel</Link>
      </div>
      
      <div className="bg-white rounded-xl shadow border p-6">
        <form action={updateAircraftWithId} className="space-y-6">
            <input type="hidden" name="rateConfiguration" id="rateConfiguration" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Basic Details */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Aircraft Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Registration</label>
                            <input type="text" name="registration" required defaultValue={aircraft.registration} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ICAO Hex</label>
                            <input type="text" name="icaoHex" defaultValue={aircraft.icaoHex || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Make</label>
                            <input type="text" name="make" required defaultValue={aircraft.make} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Model</label>
                            <input type="text" name="model" required defaultValue={aircraft.model} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Year</label>
                            <input type="number" name="year" required defaultValue={aircraft.year} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" defaultValue={aircraft.status} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                                <option value="AVAILABLE">Available</option>
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="GROUNDED">Grounded</option>
                                <option value="IN_USE">In Use</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                            <select name="fuelType" defaultValue={aircraft.fuelType || "OneHundredLL"} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                                <option value="OneHundredLL">100LL</option>
                                <option value="JetA">Jet A</option>
                                <option value="MoGas">MoGas</option>
                                <option value="UL94">UL94</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                        <input type="text" name="image" defaultValue={aircraft.image || ""} placeholder="/uploads/..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        {aircraft.image && (
                            <img src={aircraft.image} alt="Aircraft" className="mt-2 h-32 w-full object-cover rounded-md border" />
                        )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                        <label className="block text-sm font-bold text-blue-900 mb-2">Current Meters</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Hobbs</label>
                                <input type="number" name="currentHobbs" step="0.1" required defaultValue={aircraft.currentHobbs} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Tach</label>
                                <input type="number" name="currentTach" step="0.1" required defaultValue={aircraft.currentTach} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Economics & Rate Calculator */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Economics & Rates</h3>
                    <ClientRateWrapper aircraft={aircraft} fuelPrice={fuelPrice} />
                </div>
            </div>
            
            <div className="pt-6 border-t flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-bold text-lg shadow-md transition-colors">
                    Save Changes
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}