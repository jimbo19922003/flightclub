"use client";

import { useState } from "react";
import { checkOutReservation } from "@/app/actions/flight-operations";
import { uploadFile } from "@/actions/upload";
import { useRouter } from "next/navigation";

export default function CheckOutForm({ reservation, aircraft, checklist, homeAirportFuelPrice }: { reservation: any, aircraft: any, checklist?: any, homeAirportFuelPrice?: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Checklist State
  const initialChecklistState = checklist ? 
    checklist.items.reduce((acc: any, item: any) => ({ ...acc, [item.id]: false }), {}) :
    { "default": false };

  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(initialChecklistState);
  const allChecked = Object.values(checklistState).every(val => val === true);
  
  // Calculate duration on the fly for preview
  const [endHobbs, setEndHobbs] = useState(reservation.flightLog?.hobbsStart || aircraft.currentHobbs);
  const startHobbs = reservation.flightLog?.hobbsStart || 0;
  const duration = Math.max(0, endHobbs - startHobbs).toFixed(1);

  // File Upload State
  const [endHobbsPhotoUrl, setEndHobbsPhotoUrl] = useState("");
  const [fuelReceiptUrl, setFuelReceiptUrl] = useState("");
  const [uploadingHobbs, setUploadingHobbs] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Fuel Calculations
  const [fuelGallons, setFuelGallons] = useState(0);
  const [fuelReimbursement, setFuelReimbursement] = useState(0);

  const [fuelCost, setFuelCost] = useState(0);

  // Rate Type Logic
  const isWetRate = aircraft.rateType === "WET" || !aircraft.rateType; // Default to wet if undefined

  const checkOutWithId = checkOutReservation.bind(null, reservation.id);

  // Calculate Effective Rate & Totals
  const hourlyRate = reservation.aircraft.hourlyRate;
  const discount = reservation.user.membershipTier?.hourlyRateDiscount || 0;
  const discountedRate = hourlyRate * (1 - discount / 100);

  // Update total calculation whenever dependent values change
  const flightTime = Math.max(0, endHobbs - startHobbs);
  const currentReimbursement = isWetRate ? fuelReimbursement : 0;
  
  const estimatedTotalCost = (flightTime * discountedRate) - currentReimbursement;
  
  // Effective cost per hour = (Total Invoice + Out of Pocket Fuel) / Flight Time
  // If flight time is 0, default to normal rate
  const totalOutOfPocket = estimatedTotalCost + fuelCost;
  const estimatedEffectiveHourly = flightTime > 0 ? (totalOutOfPocket / flightTime) : discountedRate;

  const handleFuelGallonsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const gallons = parseFloat(e.target.value) || 0;
      setFuelGallons(gallons);
      
      // Auto-calculate reimbursement at Home Rate if Wet Rate
      if (isWetRate && homeAirportFuelPrice && homeAirportFuelPrice > 0) {
          const reimb = Number((gallons * homeAirportFuelPrice).toFixed(2));
          setFuelReimbursement(reimb);
      }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void, loadingSetter: (l: boolean) => void) => {
      if (!e.target.files || e.target.files.length === 0) return;
      
      loadingSetter(true);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
          const result = await uploadFile(formData);
          if (result.success) {
              setter(result.url);
          }
      } catch (err) {
          console.error("Upload failed", err);
          setError("Failed to upload file");
      } finally {
          loadingSetter(false);
      }
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");

    if (!allChecked) {
        setError("You must complete the postflight checklist.");
        setLoading(false);
        return;
    }
    
    if (endHobbsPhotoUrl) formData.set("endHobbsPhotoUrl", endHobbsPhotoUrl);
    if (fuelReceiptUrl) formData.set("fuelReceiptUrl", fuelReceiptUrl);
    
    // Ensure fuel reimbursement is 0 if dry rate
    if (!isWetRate) {
        formData.set("fuelReimbursement", "0");
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
                    I certify that I have secured the aircraft <strong>{aircraft.registration}</strong>, installed control locks/pitot covers, and cleaned the cabin.
                </label>
            </div>
          )}
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

        {/* End Hobbs Photo */}
        <div>
            <label className="block text-sm font-medium text-gray-700">End Hobbs Photo</label>
            <div className="mt-1 flex flex-col gap-2">
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleUpload(e, setEndHobbsPhotoUrl, setUploadingHobbs)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploadingHobbs && <span className="text-xs text-blue-600">Uploading...</span>}
                {endHobbsPhotoUrl && <img src={endHobbsPhotoUrl} alt="End Hobbs" className="h-24 object-cover rounded-md border" />}
            </div>
            <input type="hidden" name="endHobbsPhotoUrl" value={endHobbsPhotoUrl} />
        </div>
      </div>

      <div className="space-y-4 border-b pb-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">2. Fuel & Expenses</h3>
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${isWetRate ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                {isWetRate ? "WET RATE (Reimbursable)" : "DRY RATE (Pilot Pays)"}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700">Gallons Added</label>
                  <input 
                    type="number" 
                    name="fuelGallons" 
                    step="0.1" 
                    value={fuelGallons || ""}
                    onChange={handleFuelGallonsChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" 
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Total Cost ($)</label>
                  <input 
                    type="number" 
                    name="fuelCost" 
                    step="0.01" 
                    value={fuelCost || ""}
                    onChange={(e) => setFuelCost(parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" 
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Reimbursement ($)</label>
                  <input 
                    type="number" 
                    name="fuelReimbursement" 
                    step="0.01" 
                    value={fuelReimbursement || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2 bg-gray-100 text-gray-700 cursor-not-allowed" 
                  />
                  {isWetRate && homeAirportFuelPrice ? (
                      <p className="text-xs text-gray-500 mt-1">Calculated at home rate: ${homeAirportFuelPrice}/gal</p>
                  ) : null}
              </div>
          </div>
          
          {/* Estimated Invoice Preview */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
              <h4 className="text-sm font-bold text-slate-700 uppercase mb-2">Estimated Invoice Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                      <span className="text-gray-600">Base Cost ({duration} hrs @ ${discountedRate.toFixed(2)}):</span>
                      <span className="font-medium">${(flightTime * discountedRate).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                      <span>Less Reimbursement:</span>
                      <span className="font-medium">-${currentReimbursement.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2 font-bold text-lg text-slate-900">
                      <span>Total Invoice:</span>
                      <span>${estimatedTotalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2 text-blue-700">
                      <span>Effective Hourly Rate:</span>
                      <span className="font-bold">${estimatedEffectiveHourly.toFixed(2)}/hr</span>
                  </div>
              </div>
          </div>
          
          {/* Fuel Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Fuel Receipt(s)</label>
            <div className="mt-1 flex flex-col gap-2">
                <input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={(e) => handleUpload(e, setFuelReceiptUrl, setUploadingReceipt)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploadingReceipt && <span className="text-xs text-blue-600">Uploading...</span>}
                {fuelReceiptUrl && <a href={fuelReceiptUrl} target="_blank" className="text-sm text-blue-600 underline">View Receipt</a>}
            </div>
            <input type="hidden" name="fuelReceiptUrl" value={fuelReceiptUrl} />
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
            disabled={loading || !allChecked || uploadingHobbs || uploadingReceipt}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-bold"
        >
            {loading ? "Completing..." : "Complete Flight & Generate Invoice"}
        </button>
      </div>
    </form>
  );
}
