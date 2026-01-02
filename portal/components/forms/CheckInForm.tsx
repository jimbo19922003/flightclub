"use client";

import { useState } from "react";
import { checkInReservation } from "@/app/actions/flight-operations";
import { uploadFile } from "@/actions/upload";
import { useRouter } from "next/navigation";

export default function CheckInForm({ reservation, aircraft, checklist }: { reservation: any, aircraft: any, checklist?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Checklist State
  // Map checklist items to boolean state
  const initialChecklistState = checklist ? 
    checklist.items.reduce((acc: any, item: any) => ({ ...acc, [item.id]: false }), {}) :
    { "default": false };

  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(initialChecklistState);
  
  const allChecked = Object.values(checklistState).every(val => val === true);

  const [startHobbsPhotoUrl, setStartHobbsPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const checkInWithId = checkInReservation.bind(null, reservation.id);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        const result = await uploadFile(formData);
        if (result.success) {
            setStartHobbsPhotoUrl(result.url);
        }
    } catch (err) {
        console.error("Upload failed", err);
        setError("Failed to upload photo");
    } finally {
        setUploading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");

    if (!allChecked) {
        setError("You must complete all checklist items.");
        setLoading(false);
        return;
    }
    
    // Append the uploaded photo URL if present
    if (startHobbsPhotoUrl) {
        formData.set("startHobbsPhotoUrl", startHobbsPhotoUrl);
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
          
          {checklist && checklist.items.length > 0 ? (
              <div className="space-y-2">
                  {checklist.items.map((item: any) => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md border">
                          <input 
                            type="checkbox" 
                            id={item.id}
                            checked={checklistState[item.id] || false}
                            onChange={e => setChecklistState(prev => ({ ...prev, [item.id]: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                          />
                          <label htmlFor={item.id} className="text-sm text-gray-700">
                              {item.text}
                          </label>
                      </div>
                  ))}
              </div>
          ) : (
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-md border">
                <input 
                    type="checkbox" 
                    id="default" 
                    checked={checklistState["default"]} 
                    onChange={e => setChecklistState({ "default": e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="default" className="text-sm text-gray-700">
                    I certify that I have performed a preflight inspection of aircraft <strong>{aircraft.registration}</strong> and found it to be in airworthy condition.
                </label>
            </div>
          )}
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

      {/* Photo Upload */}
      <div>
          <label className="block text-sm font-medium text-gray-700">Start Hobbs Photo</label>
          <div className="mt-1 flex items-center gap-4">
            <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
            />
            {uploading && <span className="text-xs text-blue-600">Uploading...</span>}
            {startHobbsPhotoUrl && <span className="text-xs text-green-600 font-bold">Uploaded ✓</span>}
          </div>
          <input type="hidden" name="startHobbsPhotoUrl" value={startHobbsPhotoUrl} />
          {startHobbsPhotoUrl && (
              <div className="mt-2">
                  <img src={startHobbsPhotoUrl} alt="Hobbs Start" className="h-32 rounded-md border" />
              </div>
          )}
      </div>

      <div className="flex justify-end pt-4">
        <button
            type="submit"
            disabled={loading || !allChecked || uploading}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 font-bold"
        >
            {loading ? "Starting..." : "Start Flight"}
        </button>
      </div>
    </form>
  );
}
