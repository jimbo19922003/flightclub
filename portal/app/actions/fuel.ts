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

    // Try to find "Price last updated" text
    // Usually in a td or span, e.g., "Prices last updated: 01-Jan-2026"
    $('body').find('*').each((i, el) => {
        const text = $(el).text();
        if (text.includes('Prices last updated:')) {
            const match = text.match(/Prices last updated:\s*([0-9A-Za-z-]+)/);
            if (match && match[1]) {
                lastUpdated = match[1];
                return false; // break
            }
        }
    });

    // Find all tables that seem to be FBO tables
    $('table').each((i, table) => {
        const tableText = $(table).text();
        
        // Check if table has fuel headers
        if (tableText.includes('100LL') || tableText.includes('Jet A') || tableText.includes('UL94')) {
            
            // Identify column indices based on headers
            let idx100LL = -1;
            let idxJetA = -1;
            let idxUL94 = -1;

            // Iterate rows to find header row first (sometimes first row, sometimes second)
            $(table).find('tr').each((j, row) => {
                const tds = $(row).find('td, th');
                tds.each((k, cell) => {
                    const text = $(cell).text().trim();
                    if (text.includes('100LL')) idx100LL = k;
                    if (text.includes('Jet A')) idxJetA = k;
                    if (text.includes('UL94')) idxUL94 = k;
                });
            });

            // If we found headers, use them. If not, fallback to assumptions if we see FS/SS
            $(table).find('tr').each((j, row) => {
                const tds = $(row).find('td');
                const firstCol = $(tds[0]).text().trim();
                
                // Look for Full Service (FS) or Self Service (SS) rows
                if (firstCol === 'FS' || firstCol === 'SS') {
                    const isSS = firstCol === 'SS';
                    
                    // Helper to parse price from cell
                    const parsePrice = (cellIdx: number) => {
                        if (cellIdx === -1 || !tds[cellIdx]) return null;
                        const txt = $(tds[cellIdx]).text().trim();
                        if (txt.startsWith('$')) {
                            const p = parseFloat(txt.replace('$', ''));
                            return (!isNaN(p) && p > 0) ? p : null;
                        }
                        return null;
                    };

                    // Use detected indices or fallbacks
                    const p100LL = parsePrice(idx100LL !== -1 ? idx100LL : 2); // Default col 2
                    const pJetA = parsePrice(idxJetA !== -1 ? idxJetA : 4);     // Default col 4
                    const pUL94 = parsePrice(idxUL94 !== -1 ? idxUL94 : 6);     // Guessing col 6 or just searching
                    
                    if (p100LL) (isSS ? prices100LL_SS : prices100LL_FS).push(p100LL);
                    if (pJetA) (isSS ? pricesJetA_SS : pricesJetA_FS).push(pJetA);
                    if (pUL94) (isSS ? pricesUL94_SS : pricesUL94_FS).push(pUL94);
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
