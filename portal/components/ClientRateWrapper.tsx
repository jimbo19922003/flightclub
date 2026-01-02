"use client";
import RateCalculator from "@/components/RateCalculator";

export default function ClientRateWrapper({ aircraft, fuelPrice }: { aircraft: any, fuelPrice?: number }) {
    return (
        <RateCalculator
            initialConfig={aircraft.rateConfiguration as any}
            initialRate={aircraft.hourlyRate}
            fuelPrice={fuelPrice || 6.00}
            aircraftParams={{
                tsmoh: aircraft.tsmoh || 0,
                engineTbo: aircraft.engineTbo || 2000,
                overhaulCost: aircraft.overhaulCost || 30000,
                propTbo: aircraft.propTbo || 2400,
                annualCost: aircraft.annualCost || 2000,
                insuranceCost: aircraft.insuranceCost || 1500,
                hangarCost: aircraft.hangarCost || 3600
            }}
            onRateChange={(rate, config) => {
                const rateInput = document.getElementById('hourlyRate') as HTMLInputElement;
                const configInput = document.getElementById('rateConfiguration') as HTMLInputElement;
                if (rateInput) rateInput.value = rate.toString();
                if (configInput) configInput.value = config;
            }}
        />
    );
}