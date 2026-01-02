"use client";

import { useState } from "react";
import { checkInReservation } from "@/app/actions/flight-operations";
import { useRouter } from "next/navigation";

export default function CheckInForm({ reservation, aircraft }: { reservation: any, aircraft: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preflightChecked, setPreflightChecked] = useState(false);

  const checkInWithId = checkInReservation.bind(null, reservation.id);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");

    if (!preflightChecked) {
        setError("You must complete the preflight checklist.");
        setLoading(false);
        return;
    }
    
    try {
        await checkInWithId(formData);
    } catch (e: any) {
        setError(e.message);
        setLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow border">
      {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
          </div>
      )}

      <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">1. Preflight Checklist</h3>
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-md border">
              <input 
                type="checkbox" 
                id="preflight" 
                checked={preflightChecked} 
                onChange={e => setPreflightChecked(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="preflight" className="text-sm text-gray-700">
                  I certify that I have performed a preflight inspection of aircraft <strong>{aircraft.registration}</strong> and found it to be in airworthy condition. I have verified the starting Hobbs and Tach times.
              </label>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Hobbs</label>
          <input 
            type="number" 
            name="hobbsStart"
            step="0.1"
            defaultValue={aircraft.currentHobbs}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Current: {aircraft.currentHobbs}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Tach</label>
          <input 
            type="number" 
            name="tachStart"
            step="0.1"
            defaultValue={aircraft.currentTach}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Current: {aircraft.currentTach}</p>
        </div>
      </div>

      {/* Placeholder for Photo Upload */}
      <div>
          <label className="block text-sm font-medium text-gray-700">Start Hobbs Photo URL (Optional)</label>
          <input 
            type="text" 
            name="startHobbsPhotoUrl"
            placeholder="http://..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
      </div>

      <div className="flex justify-end pt-4">
        <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 font-bold"
        >
            {loading ? "Starting..." : "Start Flight"}
        </button>
      </div>
    </form>
  );
}
