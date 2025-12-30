"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckInForm({ reservation, aircraft }: { reservation: any, aircraft: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    hobbsStart: aircraft.currentHobbs,
    hobbsEnd: aircraft.currentHobbs,
    tachStart: aircraft.currentTach,
    tachEnd: aircraft.currentTach,
    notes: ""
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real app, this would call a Server Action or API route
    console.log("Submitting flight log", formData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert("Flight logged successfully (Simulation)");
    router.push("/reservations");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow border">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Hobbs Start</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.hobbsStart}
            onChange={e => setFormData({...formData, hobbsStart: parseFloat(e.target.value)})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            readOnly // Usually pre-filled from aircraft state
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hobbs End</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.hobbsEnd}
            onChange={e => setFormData({...formData, hobbsEnd: parseFloat(e.target.value)})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Tach Start</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.tachStart}
            onChange={e => setFormData({...formData, tachStart: parseFloat(e.target.value)})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            readOnly
          />
        </div>
         <div>
          <label className="block text-sm font-medium text-gray-700">Tach End</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.tachEnd}
            onChange={e => setFormData({...formData, tachEnd: parseFloat(e.target.value)})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes / Squawks</label>
        <textarea
            rows={3}
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="Any issues with the aircraft?"
        />
      </div>

      <div className="flex justify-end">
        <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
            {loading ? "Processing..." : "Complete Flight"}
        </button>
      </div>
    </form>
  );
}
