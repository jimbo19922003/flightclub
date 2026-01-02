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
    
    let prices100LL: number[] = [];
    let pricesJetA: number[] = [];

    // Find all tables that seem to be FBO tables
    $('table').each((i, table) => {
        const tableText = $(table).text();
        
        // Check if table has fuel headers
        if (tableText.includes('100LL') || tableText.includes('Jet A')) {
            $(table).find('tr').each((j, row) => {
                const tds = $(row).find('td');
                const firstCol = $(tds[0]).text().trim();
                
                // Look for Full Service (FS) or Self Service (SS) rows
                if (firstCol === 'FS' || firstCol === 'SS') {
                    // Based on observation:
                    // 100LL is typically in the 3rd column (index 2)
                    // Jet A is typically in the 5th column (index 4) - but sometimes layout varies
                    
                    // Simple heuristic: Look for '$' in specific cells
                    const col2 = $(tds[2]).text().trim();
                    const col4 = $(tds[4]).text().trim();

                    if (col2.startsWith('$')) {
                        const price = parseFloat(col2.replace('$', ''));
                        if (!isNaN(price) && price > 0) prices100LL.push(price);
                    }
                    
                    if (col4 && col4.startsWith('$')) {
                        const price = parseFloat(col4.replace('$', ''));
                        if (!isNaN(price) && price > 0) pricesJetA.push(price);
                    }
                }
            });
        }
    });

    return {
        price100LL: prices100LL.length > 0 ? Math.min(...prices100LL) : null,
        priceJetA: pricesJetA.length > 0 ? Math.min(...pricesJetA) : null
    };

  } catch (error) {
    console.error("Error fetching fuel prices:", error);
    return null;
  }
}
