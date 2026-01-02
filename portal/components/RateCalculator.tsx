"use client";

import { useState, useEffect } from "react";

interface RateItem {
    id: string;
    name: string;
    cost: number;
    type: 'FIXED' | 'HOURLY';
}

export default function RateCalculator({ 
    initialConfig, 
    initialRate,
    onRateChange 
}: { 
    initialConfig?: any, 
    initialRate: number,
    onRateChange: (rate: number, config: string) => void
}) {
    const [items, setItems] = useState<RateItem[]>(initialConfig?.items || [
        { id: '1', name: 'Engine Reserve', cost: 20, type: 'HOURLY' },
        { id: '2', name: 'Prop Reserve', cost: 5, type: 'HOURLY' },
        { id: '3', name: 'Oil Changes', cost: 3, type: 'HOURLY' },
        { id: '4', name: 'Annual Inspection', cost: 15, type: 'HOURLY' },
        { id: '5', name: 'Insurance', cost: 10, type: 'HOURLY' },
        { id: '6', name: 'Hangar', cost: 5, type: 'HOURLY' },
        { id: '7', name: 'Fuel Burn (Est. 10gph @ $6)', cost: 60, type: 'HOURLY' },
    ]);

    const [totalRate, setTotalRate] = useState(0);

    useEffect(() => {
        const sum = items.reduce((acc, item) => acc + item.cost, 0);
        setTotalRate(sum);
        // Only trigger update if it differs significantly or is explicit user action
        // We actually want to stringify the config for the form input
        const configString = JSON.stringify({ items, total: sum });
        // Don't auto-update parent rate yet, user must click "Apply"
    }, [items]);

    const handleApply = () => {
        const configString = JSON.stringify({ items, total: totalRate });
        onRateChange(totalRate, configString);
    };

    const addItem = () => {
        const newItem: RateItem = { 
            id: Date.now().toString(), 
            name: 'New Item', 
            cost: 0, 
            type: 'HOURLY' 
        };
        setItems([...items, newItem]);
    };

    const updateItem = (id: string, field: keyof RateItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const deleteItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-700">Rate Calculator</h3>
                <span className="text-xs text-slate-500">
                    Breakdown of hourly operating costs
                </span>
            </div>

            <div className="space-y-2">
                {items.map((item) => (
                    <div key={item.id} className="flex gap-2 items-center">
                        <input 
                            type="text" 
                            value={item.name} 
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            className="flex-grow text-sm border-gray-300 rounded-md shadow-sm border p-1"
                            placeholder="Item Name"
                        />
                        <div className="relative w-24">
                            <span className="absolute left-2 top-1.5 text-gray-500 text-xs">$</span>
                            <input 
                                type="number" 
                                value={item.cost} 
                                onChange={(e) => updateItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                                className="w-full text-sm border-gray-300 rounded-md shadow-sm border p-1 pl-4 text-right"
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={() => deleteItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>

            <button 
                type="button" 
                onClick={addItem}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
                + Add Item
            </button>

            <div className="border-t pt-3 flex justify-between items-center">
                <div>
                    <span className="font-bold text-lg text-slate-900">Total: ${totalRate.toFixed(2)}/hr</span>
                    {initialConfig?.lastUpdated && (
                        <p className="text-xs text-gray-500">Updated: {new Date(initialConfig.lastUpdated).toLocaleDateString()}</p>
                    )}
                </div>
                <button 
                    type="button"
                    onClick={handleApply}
                    className="bg-slate-800 text-white px-3 py-1.5 rounded text-sm hover:bg-slate-900"
                >
                    Apply to Hourly Rate
                </button>
            </div>
        </div>
    );
}
