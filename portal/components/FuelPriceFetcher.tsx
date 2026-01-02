"use client";

import { useState } from "react";
import { getFuelPrices } from "@/app/actions/fuel";
import { RefreshCw } from "lucide-react";

export default function FuelPriceFetcher() {
  const [loading, setLoading] = useState(false);
  
  const handleFetch = async () => {
    const airportInput = document.querySelector('input[name="homeAirport"]') as HTMLInputElement;
    const airport = airportInput?.value;

    if (!airport) {
        alert("Please enter a Home Airport ICAO code first.");
        return;
    }

    setLoading(true);
    try {
        const price = await getFuelPrices(airport);
        if (price) {
            const input = document.querySelector('input[name="homeAirportFuelPrice"]') as HTMLInputElement;
            if (input) {
                input.value = price.toString();
                // Highlight change
                input.style.backgroundColor = "#dcfce7";
                setTimeout(() => input.style.backgroundColor = "", 2000);
            }
        } else {
            alert(`Could not find 100LL prices for ${airport} on AirNav.`);
        }
    } catch (e) {
        console.error(e);
        alert("Failed to fetch prices.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <button 
        type="button" 
        onClick={handleFetch}
        disabled={loading}
        className="absolute right-2 top-8 p-1 text-gray-500 hover:text-blue-600 disabled:opacity-50"
        title="Fetch latest price from AirNav"
    >
        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
    </button>
  );
}
