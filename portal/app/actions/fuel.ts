'use server'

import * as cheerio from 'cheerio';

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
    
    let prices: number[] = [];

    // Find all tables that seem to be FBO tables
    $('table').each((i, table) => {
        // Check if table has 100LL header
        if ($(table).text().includes('100LL')) {
            $(table).find('tr').each((j, row) => {
                const tds = $(row).find('td');
                const firstCol = $(tds[0]).text().trim();
                
                // Look for Full Service (FS) or Self Service (SS) rows
                if (firstCol === 'FS' || firstCol === 'SS') {
                    // 100LL is typically the 3rd column (index 2) based on visual inspection
                    // But let's verify if the header "100LL" is actually above it.
                    // Assuming standard AirNav layout.
                    
                    const potentialPrice = $(tds[2]).text().trim();
                    if (potentialPrice.startsWith('$')) {
                        const price = parseFloat(potentialPrice.replace('$', ''));
                        if (!isNaN(price) && price > 0) {
                            prices.push(price);
                        }
                    }
                }
            });
        }
    });

    if (prices.length === 0) {
        return null;
    }

    // Return the minimum price found (Self Service usually)
    return Math.min(...prices);

  } catch (error) {
    console.error("Error fetching fuel prices:", error);
    return null;
  }
}
