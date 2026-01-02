"use client";

import { useState, useEffect } from "react";
import { Info, Calculator, History } from "lucide-react"; // Assuming lucide-react is available

interface RateItem {
    id: string;
    name: string;
    cost: number;
    type: 'FIXED' | 'HOURLY';
}

interface AircraftParams {
    tsmoh: number;
    engineTbo: number;
    overhaulCost: number;
    propTbo: number;
    annualCost: number;
    insuranceCost: number;
    hangarCost: number;
}

export default function RateCalculator({ 
    initialConfig, 
    initialRate,
    fuelPrice,
    aircraftParams,
    onRateChange 
}: { 
    initialConfig?: any, 
    initialRate: number,
    fuelPrice: number,
    aircraftParams: AircraftParams,
    onRateChange: (rate: number, config: string) => void
}) {
    // Advanced Mode State
    const [params, setParams] = useState(aircraftParams);
    
    // Derived Inputs not in DB schema but useful for calculator
    const [fuelBurn, setFuelBurn] = useState(initialConfig?.fuelBurn || 10);
    const [estAnnualHours, setEstAnnualHours] = useState(initialConfig?.estAnnualHours || 100);
    const [includeFixed, setIncludeFixed] = useState(initialConfig?.includeFixed || false);
    
    // Custom extra items
    const [customItems, setCustomItems] = useState<RateItem[]>(initialConfig?.customItems || []);
    
    // Calculation Results
    const [breakdown, setBreakdown] = useState({
        fuel: 0,
        engineReserve: 0,
        propReserve: 0, // Simplified: usually Prop Overhaul / Prop TBO (e.g. 5000 / 2400 ~= $2)
        fixedAllocated: 0,
        total: 0
    });

    // Update calculations whenever inputs change
    useEffect(() => {
        // 1. Fuel Cost
        const fuelCost = fuelBurn * fuelPrice;
        
        // 2. Engine Reserve
        // If TBO is 0, avoid divide by zero
        const engineReserve = params.engineTbo > 0 ? (params.overhaulCost / params.engineTbo) : 0;
        
        // 3. Prop Reserve (Hardcoded estimate for now or add prop cost field later if requested)
        // Let's assume Prop Overhaul is ~15% of Engine Overhaul for simplicity if not tracked, or just use a fixed logic.
        // Or better, let's just use a Prop Reserve input or standard ~ $3-$5.
        // User asked for "standard formulas". 
        // Let's add a "Prop Overhaul Cost" field to state (even if not in DB yet) or just use a derived value.
        // Actually, let's use a standard placeholder or add it to custom items if needed.
        // But for "Advanced", let's assume Prop Reserve is roughly $5 if not specified.
        // Better: let's calculate it if we have data. We have propTbo. We lack propCost.
        // I'll add a propCost state (default 5000) for calculation purposes.
        const propCost = 5000; 
        const propReserve = params.propTbo > 0 ? (propCost / params.propTbo) : 0;
        
        // 4. Fixed Costs Allocation
        const totalFixed = params.annualCost + params.insuranceCost + params.hangarCost;
        const fixedAllocated = estAnnualHours > 0 ? (totalFixed / estAnnualHours) : 0;
        
        // 5. Custom Items
        const customTotal = customItems.reduce((acc, item) => acc + item.cost, 0);
        
        // Total
        const total = fuelCost + engineReserve + propReserve + customTotal + (includeFixed ? fixedAllocated : 0);
        
        setBreakdown({
            fuel: fuelCost,
            engineReserve,
            propReserve,
            fixedAllocated,
            total
        });
        
        // Notify Parent (Update Hidden Inputs and Hourly Rate Display)
        // We only "Apply" when user wants to, OR we can auto-update.
        // The user prompted "Apply to Hourly Rate" button previously. Let's keep that pattern for the Total Rate.
        // But the input fields (params) should update immediately because they are bound to the form.
        
    }, [params, fuelBurn, fuelPrice, estAnnualHours, includeFixed, customItems]);

    const handleApply = () => {
        const config = {
            items: [
                { name: `Fuel (${fuelBurn}gph @ $${fuelPrice})`, cost: breakdown.fuel },
                { name: `Engine Reserve ($${params.overhaulCost}/${params.engineTbo}hr)`, cost: breakdown.engineReserve },
                { name: `Prop Reserve`, cost: breakdown.propReserve },
                ...(includeFixed ? [{ name: `Fixed Alloc. (${estAnnualHours}hr/yr)`, cost: breakdown.fixedAllocated }] : []),
                ...customItems
            ],
            fuelBurn,
            estAnnualHours,
            includeFixed,
            customItems,
            total: breakdown.total,
            lastUpdated: new Date()
        };
        
        onRateChange(Number(breakdown.total.toFixed(2)), JSON.stringify(config));
    };

    const addCustomItem = () => {
        setCustomItems([...customItems, { id: Date.now().toString(), name: 'Extra Cost', cost: 0, type: 'HOURLY' }]);
    };
    
    const updateCustomItem = (id: string, field: keyof RateItem, value: any) => {
        setCustomItems(customItems.map(i => i.id === id ? { ...i, [field]: value } : i));
    };
    
    const removeCustomItem = (id: string) => {
        setCustomItems(customItems.filter(i => i.id !== id));
    };

    return (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    Operational Cost Calculator
                </h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">Advanced</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs Column */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Variables</h4>
                    
                    {/* Fuel */}
                    <div className="bg-white p-3 rounded border space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Fuel</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-gray-600">Burn (GPH)</label>
                                <input type="number" value={fuelBurn} onChange={e => setFuelBurn(parseFloat(e.target.value)||0)} className="w-full border-gray-300 rounded text-sm p-1 border" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600">Price ($/gal)</label>
                                <input type="number" value={fuelPrice} disabled className="w-full bg-gray-100 text-gray-500 border-gray-300 rounded text-sm p-1 border cursor-not-allowed" />
                            </div>
                        </div>
                    </div>

                    {/* Engine */}
                    <div className="bg-white p-3 rounded border space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Engine Reserves</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-gray-600">TBO (Hrs)</label>
                                <input type="number" name="engineTbo" value={params.engineTbo} onChange={e => setParams({...params, engineTbo: parseFloat(e.target.value)||0})} className="w-full border-gray-300 rounded text-sm p-1 border" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600">Overhaul ($)</label>
                                <input type="number" name="overhaulCost" value={params.overhaulCost} onChange={e => setParams({...params, overhaulCost: parseFloat(e.target.value)||0})} className="w-full border-gray-300 rounded text-sm p-1 border" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs text-gray-600">TSMOH (Current)</label>
                                <input type="number" name="tsmoh" value={params.tsmoh} onChange={e => setParams({...params, tsmoh: parseFloat(e.target.value)||0})} className="w-full border-gray-300 rounded text-sm p-1 border" />
                            </div>
                        </div>
                    </div>

                    {/* Prop */}
                    <div className="bg-white p-3 rounded border space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Propeller</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-gray-600">TBO (Hrs)</label>
                                <input type="number" name="propTbo" value={params.propTbo} onChange={e => setParams({...params, propTbo: parseFloat(e.target.value)||0})} className="w-full border-gray-300 rounded text-sm p-1 border" />
                            </div>
                            <div className="flex items-center text-xs text-gray-500 italic">
                                (Est. Cost: $5k)
                            </div>
                        </div>
                    </div>

                    {/* Fixed Costs */}
                    <div className="bg-white p-3 rounded border space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs font-bold text-gray-500 uppercase">Fixed Costs (Annual)</label>
                            <label className="flex items-center text-xs gap-1 cursor-pointer">
                                <input type="checkbox" checked={includeFixed} onChange={e => setIncludeFixed(e.target.checked)} className="rounded text-blue-600" />
                                <span>Include in Rate?</span>
                            </label>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-xs text-gray-600">Annual</label>
                                <input type="number" name="annualCost" value={params.annualCost} onChange={e => setParams({...params, annualCost: parseFloat(e.target.value)||0})} className="w-full border-gray-300 rounded text-sm p-1 border" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600">Insurance</label>
                                <input type="number" name="insuranceCost" value={params.insuranceCost} onChange={e => setParams({...params, insuranceCost: parseFloat(e.target.value)||0})} className="w-full border-gray-300 rounded text-sm p-1 border" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600">Hangar</label>
                                <input type="number" name="hangarCost" value={params.hangarCost} onChange={e => setParams({...params, hangarCost: parseFloat(e.target.value)||0})} className="w-full border-gray-300 rounded text-sm p-1 border" />
                            </div>
                        </div>
                        <div className="pt-2 border-t">
                             <label className="block text-xs text-gray-600">Est. Annual Utilization (Hrs)</label>
                             <input type="number" value={estAnnualHours} onChange={e => setEstAnnualHours(parseFloat(e.target.value)||0)} className="w-full border-gray-300 rounded text-sm p-1 border" />
                             <p className="text-[10px] text-gray-400 mt-1">Used to spread fixed costs per hour.</p>
                        </div>
                    </div>
                </div>

                {/* Results Column */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Hourly Breakdown</h4>
                    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            <div className="flex justify-between p-3">
                                <span className="text-sm text-gray-600">Fuel Cost</span>
                                <span className="text-sm font-medium">${breakdown.fuel.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between p-3">
                                <span className="text-sm text-gray-600">Engine Reserve</span>
                                <span className="text-sm font-medium">${breakdown.engineReserve.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between p-3">
                                <span className="text-sm text-gray-600">Prop Reserve</span>
                                <span className="text-sm font-medium">${breakdown.propReserve.toFixed(2)}</span>
                            </div>
                            {includeFixed && (
                                <div className="flex justify-between p-3 bg-blue-50">
                                    <span className="text-sm text-blue-800">Fixed Cost Alloc.</span>
                                    <span className="text-sm font-medium text-blue-800">${breakdown.fixedAllocated.toFixed(2)}</span>
                                </div>
                            )}
                            
                            {/* Custom Items */}
                            {customItems.map(item => (
                                <div key={item.id} className="flex justify-between p-3 group relative">
                                    <div className="flex items-center gap-2">
                                        <input 
                                            value={item.name} 
                                            onChange={e => updateCustomItem(item.id, 'name', e.target.value)} 
                                            className="text-sm text-gray-600 border-none bg-transparent focus:ring-0 p-0 w-32"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <input 
                                            type="number"
                                            value={item.cost} 
                                            onChange={e => updateCustomItem(item.id, 'cost', parseFloat(e.target.value)||0)} 
                                            className="text-sm font-medium text-right border-none bg-transparent focus:ring-0 p-0 w-16"
                                        />
                                        <button type="button" onClick={() => removeCustomItem(item.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100">&times;</button>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="p-3 bg-gray-50 text-center">
                                <button type="button" onClick={addCustomItem} className="text-xs text-blue-600 hover:underline">+ Add Extra Cost Item</button>
                            </div>
                        </div>
                        
                        <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
                            <div>
                                <span className="block text-xs opacity-70">Calculated Hourly Rate</span>
                                <span className="text-2xl font-bold">${breakdown.total.toFixed(2)}</span>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleApply}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
                            >
                                Apply & Save
                            </button>
                        </div>
                    </div>
                    
                    <div className="text-center">
                         <span className="text-xs text-gray-400">
                             Applying will update the hourly rate and save this configuration history.
                         </span>
                    </div>
                </div>
            </div>
        </div>
    );
}