"use client";

import { deleteMaintenanceSchedule } from "@/app/actions/maintenance";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteScheduleButton({ scheduleId, aircraftId }: { scheduleId: string, aircraftId: string }) {
    const [isConfirming, setIsConfirming] = useState(false);
    
    const handleDelete = async () => {
        await deleteMaintenanceSchedule(scheduleId, aircraftId);
    };

    if (isConfirming) {
        return (
            <div className="absolute top-2 right-2 flex space-x-2 bg-white p-1 rounded shadow">
                <button onClick={handleDelete} className="text-xs text-red-600 font-bold hover:underline">Confirm</button>
                <button onClick={() => setIsConfirming(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
        );
    }

    return (
        <button 
            onClick={() => setIsConfirming(true)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete Schedule"
        >
            <Trash2 size={16} />
        </button>
    );
}
