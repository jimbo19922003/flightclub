"use client";

import RateCalculator from "@/components/RateCalculator";

export default function ClientRateWrapper({ aircraft }: { aircraft: any }) {
    return (
        <RateCalculator 
            initialConfig={aircraft.rateConfiguration as any} 
            initialRate={aircraft.hourlyRate}
            onRateChange={(rate, config) => {
                const rateInput = document.getElementById('hourlyRate') as HTMLInputElement;
                const configInput = document.getElementById('rateConfiguration') as HTMLInputElement;
                if (rateInput) rateInput.value = rate.toString();
                if (configInput) configInput.value = config;
            }}
        />
    );
}
