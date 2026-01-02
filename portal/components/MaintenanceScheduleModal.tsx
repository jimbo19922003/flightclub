"use client";

import { createMaintenanceSchedule, deleteMaintenanceSchedule } from "@/app/actions/maintenance";
import { useState } from "react";

export default function MaintenanceScheduleModal({ aircraftId, onClose }: { aircraftId: string, onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        await createMaintenanceSchedule(formData);
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add Maintenance Schedule</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="aircraftId" value={aircraftId} />
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Schedule Name</label>
                        <input name="name" type="text" placeholder="e.g. 50 Hour Inspection" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Interval (Hours)</label>
                            <input name="intervalHours" type="number" step="0.1" placeholder="e.g. 50.0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Interval (Months)</label>
                            <input name="intervalMonths" type="number" placeholder="e.g. 12" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                    </div>

                    <hr />
                    <p className="text-xs text-gray-500">Last Performed (Optional - to set baseline)</p>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Hobbs</label>
                            <input name="lastPerformedHours" type="number" step="0.1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Last Date</label>
                            <input name="lastPerformedDate" type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="mr-3 text-gray-600 hover:text-gray-800">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
                            {loading ? "Saving..." : "Create Schedule"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
