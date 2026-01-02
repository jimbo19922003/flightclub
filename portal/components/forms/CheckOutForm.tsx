"use client";

import { useState } from "react";
import { checkOutReservation } from "@/app/actions/flight-operations";
import { useRouter } from "next/navigation";

export default function CheckOutForm({ reservation, aircraft }: { reservation: any, aircraft: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [postflightChecked, setPostflightChecked] = useState(false);
  
  // Calculate duration on the fly for preview
  const [endHobbs, setEndHobbs] = useState(reservation.flightLog?.hobbsStart || aircraft.currentHobbs);
  const startHobbs = reservation.flightLog?.hobbsStart || 0;
  const duration = Math.max(0, endHobbs - startHobbs).toFixed(1);

  const checkOutWithId = checkOutReservation.bind(null, reservation.id);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");

    if (!postflightChecked) {
        setError("You must complete the postflight checklist.");
        setLoading(false);
        return;
    }
    
    try {
        await checkOutWithId(formData);
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
          <h3 className="font-semibold text-lg border-b pb-2">1. Postflight Checklist</h3>
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-md border">
              <input 
                type="checkbox" 
                id="postflight" 
                checked={postflightChecked} 
                onChange={e => setPostflightChecked(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="postflight" className="text-sm text-gray-700">
                  I certify that I have secured the aircraft <strong>{aircraft.registration}</strong>, installed control locks/pitot covers, and cleaned the cabin.
              </label>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-6 border-b pb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">End Hobbs</label>
          <input 
            type="number" 
            name="hobbsEnd"
            step="0.1"
            value={endHobbs}
            onChange={(e) => setEndHobbs(parseFloat(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Start: {startHobbs}</p>
        </div>
        
        <div className="flex items-center justify-center bg-blue-50 rounded-md border border-blue-100">
            <div className="text-center">
                <span className="block text-sm text-blue-600 uppercase font-bold tracking-wide">Flight Time</span>
                <span className="text-3xl font-bold text-blue-900">{duration} hrs</span>
            </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">End Tach</label>
          <input 
            type="number" 
            name="tachEnd"
            step="0.1"
            defaultValue={reservation.flightLog?.tachStart || aircraft.currentTach}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            required
          />
        </div>
      </div>

      <div className="space-y-4 border-b pb-6">
          <h3 className="font-semibold text-lg">2. Fuel & Expenses</h3>
          <div className="grid grid-cols-3 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700">Gallons Added</label>
                  <input type="number" name="fuelGallons" step="0.1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Total Cost ($)</label>
                  <input type="number" name="fuelCost" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Reimbursement ($)</label>
                  <input type="number" name="fuelReimbursement" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" />
              </div>
          </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Squawks / Notes</label>
        <textarea
            name="notes"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="Any issues with the aircraft?"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-bold"
        >
            {loading ? "Completing..." : "Complete Flight & Generate Invoice"}
        </button>
      </div>
    </form>
  );
}
