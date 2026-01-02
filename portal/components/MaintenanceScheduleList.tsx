"use client";

import { useState } from "react";
import MaintenanceScheduleModal from "@/components/MaintenanceScheduleModal";
import DeleteScheduleButton from "@/components/DeleteScheduleButton";
import { MaintenanceStatus } from "@/lib/maintenance";

export default function MaintenanceScheduleList({ aircraftId, statuses }: { aircraftId: string, statuses: MaintenanceStatus[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statuses.map((status) => (
            <div key={status.scheduleId} className={`relative rounded-xl shadow border p-6 ${
                status.status === 'OVERDUE' ? 'bg-red-50 border-red-200' :
                status.status === 'WARNING' ? 'bg-yellow-50 border-yellow-200' :
                'bg-white'
            }`}>
                <DeleteScheduleButton scheduleId={status.scheduleId} aircraftId={aircraftId} />

                <div className="flex justify-between items-start mb-4 pr-6">
                    <h3 className="font-bold text-lg text-gray-900">{status.name}</h3>
                </div>
                
                <div className="mb-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        status.status === 'OVERDUE' ? 'bg-red-200 text-red-800' :
                        status.status === 'WARNING' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                        {status.status}
                    </span>
                </div>
                
                <div className="space-y-2 text-sm">
                    {status.hoursRemaining !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Hours Remaining:</span>
                            <span className="font-mono font-medium">{status.hoursRemaining.toFixed(1)}</span>
                        </div>
                    )}
                    {status.daysRemaining !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Days Remaining:</span>
                            <span className="font-mono font-medium">{status.daysRemaining}</span>
                        </div>
                    )}
                </div>
            </div>
        ))}

        <div className="flex items-center justify-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 min-h-[160px]">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex flex-col items-center text-gray-500 hover:text-blue-600"
            >
                <span className="text-2xl mb-2">+</span>
                <span className="font-medium">Add Schedule</span>
            </button>
        </div>
      </div>

      {isModalOpen && (
          <MaintenanceScheduleModal aircraftId={aircraftId} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
