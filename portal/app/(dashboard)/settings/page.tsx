import { prisma } from "@/lib/prisma";
import { updateClubSettings, createMembershipTier } from "@/app/actions/settings";
import { DeleteTierButton } from "@/components/DeleteTierButton";

export const dynamic = 'force-dynamic';

async function getSettings() {
  try {
    const settings = await prisma.clubSettings.findFirst();
    const tiers = await prisma.membershipTier.findMany({ orderBy: { monthlyDues: 'desc' } });

    if (!settings) {
        return {
            settings: {
                name: "My Flight Club",
                type: "EQUITY",
                homeAirport: "KOSH",
                currency: "USD",
                timezone: "America/Chicago",
                monthlyDues: 0,
                billingCycleDay: 1,
                maxReservationsPerUser: 3,
                maxReservationDays: 3
            },
            tiers: []
        }
    }
    return { settings, tiers };
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return null;
  }
}

export default async function SettingsPage() {
  const data = await getSettings();

  if (!data) return <div>Error loading settings.</div>;
  const { settings, tiers } = data;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Configuration Portal</h1>
      
      {/* Club Profile Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Club Profile</h2>
        <form action={updateClubSettings} className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-xl shadow border p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">General Info</h3>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Club Name</label>
                    <input type="text" name="name" defaultValue={settings.name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Club Structure</label>
                    <select name="type" defaultValue={settings.type} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                        <option value="EQUITY">Equity (Member Owned)</option>
                        <option value="NON_PROFIT">Non-Profit (501c7)</option>
                        <option value="COMMERCIAL">Commercial / Rental</option>
                    </select>
                </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700">Home Airport (ICAO)</label>
                    <input type="text" name="homeAirport" defaultValue={settings.homeAirport} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow border p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Localization & Billing</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Currency</label>
                        <select name="currency" defaultValue={settings.currency} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="CAD">CAD ($)</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Timezone</label>
                        <select name="timezone" defaultValue={settings.timezone} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                            <option value="America/Chicago">Central (US)</option>
                            <option value="America/New_York">Eastern (US)</option>
                            <option value="America/Denver">Mountain (US)</option>
                            <option value="America/Los_Angeles">Pacific (US)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Billing Cycle Day</label>
                    <input type="number" name="billingCycleDay" defaultValue={settings.billingCycleDay} min="1" max="28" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Default Monthly Dues ($)</label>
                    <input type="number" name="monthlyDues" defaultValue={settings.monthlyDues} step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                </div>
            </div>
            
            <div className="col-span-full flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-bold">Save Profile</button>
            </div>
        </form>
      </section>

      <hr />

      {/* Membership Tiers Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Membership Tiers</h2>
        <p className="text-gray-600">Configure different levels of membership with specific privileges and pricing.</p>
        
        <div className="grid gap-6 md:grid-cols-2">
            {/* List Existing Tiers */}
            <div className="space-y-4">
                {tiers.map((tier) => (
                    <div key={tier.id} className="bg-white rounded-xl shadow border p-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">{tier.name}</h3>
                            <div className="text-sm text-gray-500 space-y-1">
                                <p>Dues: ${tier.monthlyDues}/mo</p>
                                <p>Max Res: {tier.maxReservations} active, {tier.maxDaysPerReservation} days each</p>
                                <p>Booking Window: {tier.bookingWindowDays} days</p>
                                {tier.hourlyRateDiscount > 0 && <p className="text-green-600 font-semibold">{tier.hourlyRateDiscount}% Discount on Rates</p>}
                            </div>
                        </div>
                        <DeleteTierButton id={tier.id} />
                    </div>
                ))}
                {tiers.length === 0 && <p className="text-gray-500 italic">No custom tiers configured. Default global settings will apply.</p>}
            </div>

            {/* Add New Tier Form */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Tier</h3>
                <form action={createMembershipTier} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tier Name</label>
                        <input type="text" name="name" required placeholder="e.g. Full Share" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Monthly Dues ($)</label>
                            <input type="number" name="monthlyDues" required step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Rate Discount (%)</label>
                            <input type="number" name="hourlyRateDiscount" defaultValue="0" min="0" max="100" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Max Active Res.</label>
                            <input type="number" name="maxReservations" required defaultValue="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Max Days / Res.</label>
                            <input type="number" name="maxDaysPerReservation" required defaultValue="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                        </div>
                    </div>
                    
                    <div>
                         <label className="block text-sm font-medium text-gray-700">Booking Window (Days)</label>
                         <input type="number" name="bookingWindowDays" required defaultValue="90" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                    </div>

                    <button type="submit" className="w-full bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900 font-bold">Create Tier</button>
                </form>
            </div>
        </div>
      </section>
    </div>
  );
}
