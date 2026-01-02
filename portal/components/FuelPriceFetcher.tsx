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
        const prices = await getFuelPrices(airport);
        
        let found = false;
        
        if (prices?.price100LL) {
            const input100LL = document.querySelector('input[name="fuelPrice100LL"]') as HTMLInputElement;
            if (input100LL) {
                input100LL.value = prices.price100LL.toString();
                input100LL.style.backgroundColor = "#dcfce7";
                setTimeout(() => input100LL.style.backgroundColor = "", 2000);
                found = true;
            }
        }

        if (prices?.priceJetA) {
            const inputJetA = document.querySelector('input[name="fuelPriceJetA"]') as HTMLInputElement;
            if (inputJetA) {
                inputJetA.value = prices.priceJetA.toString();
                inputJetA.style.backgroundColor = "#dcfce7";
                setTimeout(() => inputJetA.style.backgroundColor = "", 2000);
                found = true;
            }
        }

        if (prices?.priceUL94) {
            const inputUL94 = document.querySelector('input[name="fuelPriceUL94"]') as HTMLInputElement;
            if (inputUL94) {
                inputUL94.value = prices.priceUL94.toString();
                inputUL94.style.backgroundColor = "#dcfce7";
                setTimeout(() => inputUL94.style.backgroundColor = "", 2000);
                found = true;
            }
        }

        if (!found) {
            alert(`Could not find valid fuel prices for ${airport} on AirNav.`);
        }
    } catch (e) {
        console.error(e);
        alert("Failed to fetch prices.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="absolute right-2 top-8">
        <button 
            type="button" 
            onClick={handleFetch}
            disabled={loading}
            className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-50 flex items-center gap-1 text-xs bg-gray-50 border rounded px-2"
            title="Fetch latest prices from AirNav"
        >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Fetch Rates
        </button>
    </div>
  );
}
