import { prisma } from "@/lib/prisma";
import { updateClubSettings } from "@/app/actions/settings";

export const dynamic = 'force-dynamic';

async function getSettings() {
  try {
    const settings = await prisma.clubSettings.findFirst();
    if (!settings) {
        // Return default values if no settings exist
        return {
            name: "My Flight Club",
            type: "EQUITY",
            monthlyDues: 0,
            billingCycleDay: 1,
            maxReservationsPerUser: 3,
            maxReservationDays: 3
        }
    }
    return settings;
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return null;
  }
}

export default async function SettingsPage() {
  const settings = await getSettings();

  if (!settings) return <div>Error loading settings.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Club Settings</h1>
      
      <form action={updateClubSettings} className="grid gap-6 md:grid-cols-2">
          {/* General Settings */}
          <div className="bg-white rounded-xl shadow border p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">General Info</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Club Name</label>
                <input 
                    type="text" 
                    name="name" 
                    defaultValue={settings.name}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Club Type</label>
                <select 
                    name="type" 
                    defaultValue={settings.type}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                >
                    <option value="EQUITY">Equity (Member Owned)</option>
                    <option value="NON_PROFIT">Non-Profit (501c7)</option>
                    <option value="COMMERCIAL">Commercial / Rental</option>
                </select>
            </div>
          </div>

          {/* Billing Settings */}
          <div className="bg-white rounded-xl shadow border p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Billing Defaults</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Base Monthly Dues ($)</label>
                <input 
                    type="number" 
                    name="monthlyDues" 
                    defaultValue={settings.monthlyDues}
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Billing Cycle Start Day</label>
                <input 
                    type="number" 
                    name="billingCycleDay" 
                    defaultValue={settings.billingCycleDay}
                    min="1"
                    max="28"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
            </div>
          </div>

          {/* Rules / Restrictions */}
           <div className="bg-white rounded-xl shadow border p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Global Reservation Rules</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Max Active Reservations Per User</label>
                <input 
                    type="number" 
                    name="maxReservationsPerUser" 
                    defaultValue={settings.maxReservationsPerUser}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
            </div>

             <div>
                <label className="block text-sm font-medium text-gray-700">Max Days Per Reservation</label>
                <input 
                    type="number" 
                    name="maxReservationDays" 
                    defaultValue={settings.maxReservationDays}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
            </div>
          </div>

          <div className="col-span-full flex justify-end">
              <button 
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-bold"
              >
                Save Settings
              </button>
          </div>
      </form>
    </div>
  );
}
