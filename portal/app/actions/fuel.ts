'use server'

import * as cheerio from 'cheerio';
import { prisma } from "@/lib/prisma";

export async function getFuelPrices(icao: string) {
  try {
    const response = await fetch(`https://www.airnav.com/airport/${icao}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch data for ${icao}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Arrays to store found prices, separate by SS and FS to prioritize SS
    let prices100LL_SS: number[] = [];
    let prices100LL_FS: number[] = [];
    let pricesJetA_SS: number[] = [];
    let pricesJetA_FS: number[] = [];
    let pricesUL94_SS: number[] = [];
    let pricesUL94_FS: number[] = [];

    let lastUpdated: string | null = null;

    $('table').each((i, table) => {
        const tableText = $(table).text();
        
        // Check if table looks like the fuel table
        if (tableText.includes('100LL') || tableText.includes('Jet A') || tableText.includes('UL94')) {
            
            // 1. Identify Header Mappings
            let headerMap: Record<string, number> = {};
            let hasHeaders = false;

            $(table).find('tr').slice(0, 3).each((j, row) => {
                const tds = $(row).find('td, th');
                tds.each((k, cell) => {
                    const txt = $(cell).text().trim();
                    if (txt.includes('100LL')) headerMap['100LL'] = k;
                    if (txt.includes('UL94')) headerMap['UL94'] = k;
                    if (txt.includes('Jet A')) headerMap['JetA'] = k;
                });
                if (Object.keys(headerMap).length > 0) {
                    hasHeaders = true;
                    return false; // Break
                }
            });

            // 2. Scan for "Updated" date
             $(table).find('tr').each((j, row) => {
                 const rowText = $(row).text().trim();
                 if (rowText.includes('Updated')) {
                     const match = rowText.match(/Updated\s+([0-9A-Za-z-]+)/);
                     if (match && match[1]) lastUpdated = match[1];
                 }
             });

            // 3. Scan Data Rows
            $(table).find('tr').each((j, row) => {
                const tds = $(row).find('td');
                if (tds.length === 0) return;

                const firstCol = $(tds[0]).text().trim();
                
                if (firstCol === 'FS' || firstCol === 'SS') {
                    const isSS = firstCol === 'SS';
                    
                    // Determine extraction mode
                    // If tds.length > header_indices (implying spacers), we use stride logic
                    // Heuristic: If we found headers, use those indices * 2 if row is wide?
                    
                    // Let's deduce the column mapping strategy
                    // Header indices from debug: 100LL=1, UL94=2, JetA=3. (4 cells total in row 1)
                    // Data indices from debug: SS=0, Prices at 2, 4, 6. (7 cells total in row 3)
                    // Relation: DataIdx = HeaderIdx * 2.
                    
                    // If row is NOT wide (no spacers), then DataIdx = HeaderIdx.
                    
                    // Check if wide format
                    const isWideFormat = tds.length >= 6; // Arbitrary check, but wide rows usually > 4

                    const extractPrice = (idx: number) => {
                         if (!tds[idx]) return null;
                         const txt = $(tds[idx]).text().trim();
                         if (txt.startsWith('$')) {
                             const p = parseFloat(txt.replace('$', ''));
                             return (!isNaN(p) && p > 0) ? p : null;
                         }
                         return null;
                    };

                    Object.entries(headerMap).forEach(([type, hIdx]) => {
                         // Determine target index
                         // If wide format, assume * 2 mapping. If not, assume direct.
                         let targetIdx = isWideFormat ? hIdx * 2 : hIdx;
                         
                         let val = extractPrice(targetIdx);

                         if (val !== null) {
                             if (type === '100LL') (isSS ? prices100LL_SS : prices100LL_FS).push(val);
                             if (type === 'UL94') (isSS ? pricesUL94_SS : pricesUL94_FS).push(val);
                             if (type === 'JetA') (isSS ? pricesJetA_SS : pricesJetA_FS).push(val);
                         }
                    });
                }
            });
        }
    });

    // Helper to get best price (min of SS, else min of FS)
    const getBestPrice = (ss: number[], fs: number[]) => {
        if (ss.length > 0) return Math.min(...ss);
        if (fs.length > 0) return Math.min(...fs);
        return null;
    };

    return {
        price100LL: getBestPrice(prices100LL_SS, prices100LL_FS),
        priceJetA: getBestPrice(pricesJetA_SS, pricesJetA_FS),
        priceUL94: getBestPrice(pricesUL94_SS, pricesUL94_FS),
        lastUpdated
    };

  } catch (error) {
    console.error("Error fetching fuel prices:", error);
    return null;
  }
}

export async function updateFuelPricesInDB(icao: string) {
    const prices = await getFuelPrices(icao);
    if (!prices) return null;

    const settings = await prisma.clubSettings.findFirst();
    if (settings) {
        await prisma.clubSettings.update({
            where: { id: settings.id },
            data: {
                fuelPrice100LL: prices.price100LL || settings.fuelPrice100LL,
                fuelPriceJetA: prices.priceJetA || settings.fuelPriceJetA,
                fuelPriceUL94: prices.priceUL94 || settings.fuelPriceUL94 || 6.00,
                fuelPriceLastUpdated: prices.lastUpdated ? new Date(prices.lastUpdated) : new Date()
            }
        });
    }
    return prices;
}
