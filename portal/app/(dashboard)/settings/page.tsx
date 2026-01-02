import { prisma } from "@/lib/prisma";
import { updateClubSettings, createMembershipTier, updatePassword } from "@/app/actions/settings";
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
                 homeAirport: "", 
                 currency: "USD", 
                 timezone: "America/Chicago",
                 monthlyDues: 0,
                 billingCycleDay: 1,
                 maxReservationsPerUser: 3,
                 maxReservationDays: 7,
                 suspendOverdueDays: 10,
                 stripePublicKey: "",
                 stripeSecretKey: ""
             },
             tiers: []
        }
    }
    return { settings, tiers, error: null };
  } catch (error: any) {
    console.error("Failed to fetch settings:", error);
    return { settings: null, tiers: [], error: error.message || "Unknown error" };
    // return { settings: { name: "Error" }, tiers: [], error: error.message };
  }
}

interface ClubSettings {
  id: string;
  name: string;
  type: string;
  homeAirport: string;
  currency: string;
  timezone: string;
  monthlyDues: number;
  billingCycleDay: number;
  maxReservationsPerUser: number;
  maxReservationDays: number;
  suspendOverdueDays: number;
  stripePublicKey?: string;
  stripeSecretKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default async function SettingsPage() {
  const data = await getSettings();

  if (data?.error) {
    return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <h3 className="text-lg font-bold mb-2">Error Loading Settings</h3>
            <p>The system could not load the configuration from the database.</p>
            <pre className="mt-4 p-4 bg-red-100 rounded overflow-auto text-xs font-mono">
                {data.error}
            </pre>
            <p className="mt-4 text-sm">
                Try restarting the application to re-run database migrations: 
                <code className="bg-red-100 px-1 py-0.5 rounded ml-1">docker-compose restart portal</code>
            </p>
        </div>
    );
  }

  if (!data || !data.settings) return <div>Loading...</div>;
  const settings = data.settings as unknown as ClubSettings;
  const tiers = data.tiers;

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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Billing Cycle Day</label>
                        <input type="number" name="billingCycleDay" defaultValue={settings.billingCycleDay} min="1" max="28" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                        <p className="text-xs text-gray-500 mt-1">Day of month invoices generate.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Overdue Suspension (Days)</label>
                        <input type="number" name="suspendOverdueDays" defaultValue={settings.suspendOverdueDays || 10} min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                        <p className="text-xs text-gray-500 mt-1">Days past due before account lock.</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Default Monthly Dues ($)</label>
                    <input type="number" name="monthlyDues" defaultValue={settings.monthlyDues} step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                </div>
            </div>

            {/* Integrations Section (Stripe) */}
            <div className="bg-white rounded-xl shadow border p-6 space-y-4 col-span-full">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Integrations</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Stripe Public Key</label>
                        <input 
                            type="text" 
                            name="stripePublicKey" 
                            defaultValue={settings.stripePublicKey || ''} 
                            placeholder="pk_test_..."
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stripe Secret Key</label>
                        <input 
                            type="password" 
                            name="stripeSecretKey" 
                            defaultValue={settings.stripeSecretKey || ''} 
                            placeholder="sk_test_..."
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        />
                    </div>
                </div>
                <p className="text-xs text-gray-500">
                    Required for automated invoicing and payments.
                </p>
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
                                {tier.maxWeekendDaysPerYear && <p>Max Weekend Days: {tier.maxWeekendDaysPerYear}/yr</p>}
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
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Booking Window (Days)</label>
                             <input type="number" name="bookingWindowDays" required defaultValue="90" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Max Trip (Days)</label>
                             <input type="number" name="maxTripLengthDays" required defaultValue="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                        </div>
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700">Weekend Days Limit (Per Year)</label>
                         <input type="number" name="maxWeekendDaysPerYear" placeholder="Optional (e.g. 14)" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                    </div>

                    <button type="submit" className="w-full bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900 font-bold">Create Tier</button>
                </form>
            </div>
        </div>
      </section>

      <hr />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Security</h2>
        <div className="bg-white rounded-xl shadow border p-6">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Change Password</h3>
            <form action={updatePassword} className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input type="password" name="password" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"/>
                </div>
                <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-bold">Update Password</button>
            </form>
        </div>
      </section>
    </div>
  );
}
