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

    // Strategy: Find the fuel table.
    // The table typically contains 100LL, Jet A, etc. in headers.
    // It might also contain "Updated" date in the last row.

    $('table').each((i, table) => {
        const tableText = $(table).text();
        
        // Check if table looks like the fuel table
        if (tableText.includes('100LL') || tableText.includes('Jet A') || tableText.includes('UL94')) {
            
            // 1. Try to find headers to determine column order
            // Headers are typically in the first few rows.
            // We look for cells containing the fuel type names.
            let fuelTypeOrder: string[] = [];
            
            // Scan first 3 rows for headers
            $(table).find('tr').slice(0, 3).each((j, row) => {
                $(row).find('td, th').each((k, cell) => {
                   const txt = $(cell).text().trim();
                   if (txt.includes('100LL')) fuelTypeOrder.push('100LL');
                   else if (txt.includes('UL94')) fuelTypeOrder.push('UL94');
                   else if (txt.includes('Jet A')) fuelTypeOrder.push('JetA');
                });
                if (fuelTypeOrder.length > 0) return false; // Break if found headers
            });

            // If no headers found, default to standard order (dangerous but fallback)
            // But usually we find them. If we found them, fuelTypeOrder has the order.
            
            // 2. Scan for "Updated" date in the table
             $(table).find('tr').each((j, row) => {
                 const rowText = $(row).text().trim();
                 if (rowText.includes('Updated')) {
                     const match = rowText.match(/Updated\s+([0-9A-Za-z-]+)/);
                     if (match && match[1]) {
                         lastUpdated = match[1];
                     }
                 }
             });

            // 3. Scan rows for prices (FS/SS)
            $(table).find('tr').each((j, row) => {
                const tds = $(row).find('td');
                if (tds.length === 0) return;

                const firstCol = $(tds[0]).text().trim();
                
                if (firstCol === 'FS' || firstCol === 'SS') {
                    const isSS = firstCol === 'SS';
                    
                    // Collect all prices in the row
                    let rowPrices: number[] = [];
                    tds.each((k, cell) => {
                        // Skip first column (label)
                        if (k === 0) return;
                        
                        const txt = $(cell).text().trim();
                        if (txt.startsWith('$')) {
                            const p = parseFloat(txt.replace('$', ''));
                            if (!isNaN(p) && p > 0) rowPrices.push(p);
                        } else if (txt === '---' || txt === '') {
                            // Placeholder for missing price?
                            // Actually, let's just collect valid prices and map them to the headers we found.
                            // If there are gaps (empty cells), we might need to count them.
                            // But usually `tds` exist even if empty.
                        }
                    });

                    // BETTER STRATEGY: Iterate cells and map by index if we knew indices.
                    // But since we built `fuelTypeOrder` from headers, we assume the valid prices correspond to that order?
                    // Not necessarily. Spacers exist.
                    
                    // Let's use the explicit column index logic again, but strictly based on the headers we found.
                    // We need to find the COLUMN INDEX of each header.
                    
                    let idx100LL = -1, idxUL94 = -1, idxJetA = -1;
                    
                    // Re-scan headers with index tracking
                     $(table).find('tr').slice(0, 3).each((RowIdx, hRow) => {
                        $(hRow).find('td, th').each((k, cell) => {
                           const txt = $(cell).text().trim();
                           if (txt.includes('100LL')) idx100LL = k;
                           if (txt.includes('UL94')) idxUL94 = k;
                           if (txt.includes('Jet A')) idxJetA = k;
                        });
                        if (idx100LL > -1 || idxUL94 > -1 || idxJetA > -1) return false;
                    });
                    
                    // Now read data row using these indices
                    // Note: Data row might have different cell count if colspan is used, but usually AirNav tables are simple.
                    // However, we saw spacers.
                    // Row 1: | 100LL | UL94 | Jet A
                    // Row 2: FS | | $4.78 | | --- | | $3.90
                    // Header has 4 cells (0=empty, 1=100LL, 2=UL94, 3=JetA) ?? 
                    // Wait, let's look at the debug output again.
                    // Row 1: | 100LL | UL94 | Jet A  (This was my debug output joining with ' | ')
                    // This implies 4 cells. 0="", 1="100LL", ...
                    
                    // Data row: SS | | $4.63 | | $6.45 | | $3.90
                    // 7 cells. 0="SS", 1="", 2="$4.63", 3="", 4="$6.45", 5="", 6="$3.90"
                    
                    // The indices DO NOT MATCH. Header 1 -> Data 2? Header 2 -> Data 4?
                    // Pattern: Header index K -> Data index K*2 ? 
                    // Header 1 (100LL) -> Data 2
                    // Header 2 (UL94) -> Data 4
                    // Header 3 (JetA) -> Data 6
                    
                    // Let's try to just find prices and map them to the fuel types we know exist in the table, in order.
                    // If we found '100LL', 'UL94', 'Jet A' in headers (in that order).
                    // And we find 3 price-like strings in the data row.
                    // We map them 1:1.
                    // If we find 2 prices, we have a problem (gaps).
                    // But AirNav usually uses '---' for gaps.
                    
                    let pricesInRow: (number | null)[] = [];
                    tds.each((k, cell) => {
                        if (k === 0) return; // Skip label
                        const txt = $(cell).text().trim();
                        if (txt.startsWith('$')) {
                             const p = parseFloat(txt.replace('$', ''));
                             pricesInRow.push(p);
                        } else if (txt.includes('---')) {
                            pricesInRow.push(null); 
                        }
                         // Ignore empty cells completely? No, empty cells are spacers.
                    });
                    
                    // If we have spacers, we might get empty strings.
                    // Let's rely on the order of detected headers.
                    
                    if (fuelTypeOrder.length > 0) {
                         // Extract all prices (skipping spacers)
                         // The logic: Iterate tds. If looks like price OR '---', keep it.
                         let extractedValues: (number | null)[] = [];
                         tds.each((k, cell) => {
                            if (k === 0) return;
                            const txt = $(cell).text().trim();
                            if (txt.startsWith('$')) {
                                extractedValues.push(parseFloat(txt.replace('$', '')));
                            } else if (txt.includes('---')) {
                                extractedValues.push(null);
                            }
                         });
                         
                         // Now map extractedValues to fuelTypeOrder
                         // Assumption: The number of "value slots" matches the number of headers found.
                         // For KMGC: Headers=3 (100LL, UL94, JetA). Extracted=3 (4.63, 6.45, 3.90). Perfect.
                         
                         fuelTypeOrder.forEach((type, idx) => {
                             const val = extractedValues[idx];
                             if (val !== null && val !== undefined) {
                                 if (type === '100LL') (isSS ? prices100LL_SS : prices100LL_FS).push(val);
                                 if (type === 'UL94') (isSS ? pricesUL94_SS : pricesUL94_FS).push(val);
                                 if (type === 'JetA') (isSS ? pricesJetA_SS : pricesJetA_FS).push(val);
                             }
                         });
                    }
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
