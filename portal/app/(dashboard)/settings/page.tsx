export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      
      <div className="bg-white rounded-xl shadow border p-6">
        <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">General Settings</h2>
        <div className="space-y-4">
            <p className="text-gray-500 text-sm">Application settings configuration will go here.</p>
        </div>
      </div>
    </div>
  );
}
