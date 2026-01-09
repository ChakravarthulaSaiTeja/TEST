import { NextRequest, NextResponse } from 'next/server';

interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  price: number;
  priceFormatted: string;
  marketCap: number;
  volume: number;
  peRatio: number;
  changePercent: number;
  previousClose: number;
  change: number;
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    // Search for the stock using yfinance-like approach
    // Preserve case for index symbols like ^NSEI, otherwise lowercase
    const searchQuery = trimmedQuery.startsWith('^') ? trimmedQuery : trimmedQuery.toLowerCase();
    const stockData = await searchStockData(searchQuery);
    
    if (!stockData) {
      // Check if backend is reachable
      const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      let backendStatus = 'unknown';
      
      try {
        const healthCheck = await fetch(`${backendUrl}/health`, {
          signal: AbortSignal.timeout(3000),
        }).catch(() => null);
        backendStatus = healthCheck?.ok ? 'running' : 'not running';
      } catch {
        backendStatus = 'not reachable';
      }
      
      const errorMessage = backendStatus === 'not running' || backendStatus === 'not reachable'
        ? `Backend server is ${backendStatus}. Please start the backend server on ${backendUrl}`
        : `Company not found for query: ${query}. Please check the symbol and try again.`;
      
      return NextResponse.json(
        { error: errorMessage, backendStatus },
        { status: 404 }
      );
    }

    return NextResponse.json(stockData);
  } catch (error) {
    console.error('Stock search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function searchStockData(query: string): Promise<StockSearchResult | null> {
  try {
    // Handle NIFTY 50 index symbol (preserve case for ^NSEI)
    const isNifty50 = query === '^nsei' || query === '^NSEI' || query === 'nsei' || query === 'NSEI' || query.toLowerCase().includes('nifty');
    
    if (isNifty50) {
      // Try NIFTY 50 symbol directly
      const niftySymbol = '^NSEI';
      const stockData = await fetchStockData(niftySymbol);
      
      if (stockData && stockData.price > 0) {
        return {
          symbol: niftySymbol,
          name: 'NIFTY 50',
          exchange: 'NSE',
          currency: 'INR',
          price: stockData.price,
          priceFormatted: formatCurrency(stockData.price, 'INR'),
          marketCap: stockData.marketCap || 0,
          volume: stockData.volume || 0,
          peRatio: stockData.peRatio || 0,
          changePercent: stockData.changePercent || 0,
          previousClose: stockData.previousClose || stockData.price,
          change: stockData.change || 0,
        };
      }
    }
    
    const upperQuery = query.toUpperCase().replace(/\s+/g, '');
    
    // Top Indian stocks mappings to yfinance symbols
    // Note: yfinance uses .NS for NSE stocks
    const topStocksMappings: { [key: string]: string[] } = {
      'RELIANCE': ['RELIANCE.NS', 'RELIANCE.BO'],
      'TCS': ['TCS.NS', 'TCS.BO'],
      'HDFCBANK': ['HDFCBANK.NS', 'HDFCBANK.BO'],
      'HDFC': ['HDFCBANK.NS', 'HDFCBANK.BO'], // HDFC Bank
      'HDFCBANK': ['HDFCBANK.NS', 'HDFCBANK.BO'],
      'HDFC BANK': ['HDFCBANK.NS', 'HDFCBANK.BO'], // HDFC Bank with space
      'INFY': ['INFY.NS', 'INFY.BO'],
      'INFOSYS': ['INFY.NS', 'INFY.BO'],
      'ICICIBANK': ['ICICIBANK.NS', 'ICICIBANK.BO'],
      'ICICI': ['ICICIBANK.NS', 'ICICIBANK.BO'], // ICICI Bank
      'ICICI BANK': ['ICICIBANK.NS', 'ICICIBANK.BO'], // ICICI Bank with space
    };
    
    // Check if it's a top stock
    if (topStocksMappings[upperQuery]) {
      const stockSymbols = topStocksMappings[upperQuery];
      console.log(`[API] Detected top stock: ${query} -> trying symbols: ${stockSymbols.join(', ')}`);
      
      // Try each symbol variation until we find one that works
      for (const stockSymbol of stockSymbols) {
        const stockData = await fetchStockData(stockSymbol);
        
        if (stockData && stockData.price > 0) {
          const currency = 'INR';
          const exchange = stockSymbol.includes('.BO') ? 'BSE' : 'NSE';
          const priceFormatted = formatCurrency(stockData.price, currency);
          
          // Use the stock name from the data or query
          const stockName = stockData.name || query.trim();
          
          console.log(`[API] Successfully fetched data for ${stockName} using ${stockSymbol}:`, stockData);
          
          return {
            symbol: stockSymbol,
            name: stockName,
            exchange: exchange,
            currency: currency,
            price: stockData.price,
            priceFormatted: priceFormatted,
            marketCap: stockData.marketCap || 0,
            volume: stockData.volume || 0,
            peRatio: stockData.peRatio || 0,
            changePercent: stockData.changePercent || 0,
            previousClose: stockData.previousClose || stockData.price,
            change: stockData.change || 0,
          };
        } else {
          console.log(`[API] Symbol ${stockSymbol} failed, trying next...`);
        }
      }
      
      console.error(`[API] Failed to fetch data for stock ${query} with all symbol variations`);
    }
    
    // Common US company mappings to prioritize US stocks
    const usCompanies = ['APPLE', 'MICROSOFT', 'GOOGLE', 'ALPHABET', 'AMAZON', 'TESLA', 'META', 'FACEBOOK', 'NETFLIX', 'NVDA', 'NVIDIA', 'UBER', 'LYFT', 'SPOTIFY', 'ZOOM', 'SHOPIFY', 'PAYPAL', 'SQUARE', 'TWITTER', 'SNAP', 'SALESFORCE', 'ORACLE', 'INTEL', 'CISCO', 'IBM', 'ADOBE', 'NIKE', 'COCA', 'PEPSI', 'WALMART', 'TARGET', 'DISNEY', 'VERIZON', 'ATT', 'JPMORGAN', 'BANKOFAMERICA', 'WELLSFARGO', 'GOLDMANSACHS', 'MORGANSTANLEY', 'VISA', 'MASTERCARD', 'AMERICANEXPRESS', 'BERKSHIRE', 'JOHNSON', 'PFIZER', 'MODERNA', 'BOEING', 'GENERALELECTRIC', 'FORD', 'GENERALMOTORS', 'CHEVRON', 'EXXON', 'SHELL', 'BP', 'PROCTER', 'UNILEVER', 'CATERPILLAR', 'DEERE', '3M', 'HONEYWELL', 'LOCKHEED', 'RAYTHEON', 'NORTHROP', 'GENERALDYNAMICS'];
    
    // Common Indian company symbol mappings
    const indianSymbolMappings: { [key: string]: string } = {
      'RELIANCE': 'RELIANCE',
      'TCS': 'TCS',
      'HDFCBANK': 'HDFCBANK',
      'HDFC': 'HDFCBANK',
      'INFY': 'INFY',
      'INFOSYS': 'INFY',
      'ICICIBANK': 'ICICIBANK',
      'ICICI': 'ICICIBANK',
      'TATA': 'TATAMOTORS',
      'MAHINDRA': 'M&M',
      'SBI': 'SBIN',
      'BAJFINANCE': 'BAJFINANCE',
      'BHARTI': 'BHARTIARTL',
      'ASIANPAINTS': 'ASIANPAINT',
      'HERO': 'HEROMOTOCO',
      'BAJAJAUTO': 'BAJAJ-AUTO',
      'HUL': 'HINDUNILVR',
      'SUNPHARMA': 'SUNPHARMA',
      'DRREDDY': 'DRREDDY',
      'DIVIS': 'DIVISLAB',
      'CADILA': 'CADILAHC',
      'AXISBANK': 'AXISBANK',
      'KOTAKBANK': 'KOTAKBANK',
      'YESBANK': 'YESBANK',
      'UNIONBANK': 'UNIONBANK',
      'CANARABANK': 'CANBK',
      'BANKBARODA': 'BANKBARODA',
    };
    
    // Determine symbol variations based on company type
    let symbolVariations: string[];
    
    if (usCompanies.includes(upperQuery)) {
      // US companies - try US first
      symbolVariations = [
        upperQuery,           // Original query (e.g., "TESLA")
        `${upperQuery}.NS`,   // NSE (fallback)
        `${upperQuery}.BO`,   // BSE (fallback)
      ];
    } else {
      // Indian companies or unknown - try Indian first with correct symbols
      const correctSymbol = indianSymbolMappings[upperQuery] || upperQuery;
      symbolVariations = [
        `${correctSymbol}.NS`,   // NSE (Indian stocks) - try first
        `${correctSymbol}.BO`,   // BSE (Indian stocks)
        `${upperQuery}.NS`,      // Original query with .NS
        `${upperQuery}.BO`,      // Original query with .BO
        correctSymbol,           // Without exchange suffix
        upperQuery,              // Original query (fallback)
      ];
    }

    // Try each symbol variation until we find valid data
    for (const symbol of symbolVariations) {
      try {
        const stockData = await fetchStockData(symbol);
        
        if (stockData && stockData.price > 0) {
          // Default to Indian standards
          const isIndianStock = symbol.includes('.NS') || symbol.includes('.BO');
          const currency = 'INR'; // Default to INR for Indian standards
          const exchange = isIndianStock ? 'NSE' : 'BSE';
          const priceFormatted = formatCurrency(stockData.price, currency);

          return {
            symbol: symbol,
            name: stockData.name || symbol,
            exchange: exchange,
            currency: currency,
            price: stockData.price,
            priceFormatted: priceFormatted,
            marketCap: stockData.marketCap || 0,
            volume: stockData.volume || 0,
            peRatio: stockData.peRatio || 0,
            changePercent: stockData.changePercent || 0,
            previousClose: stockData.previousClose || stockData.price,
            change: stockData.change || 0,
          };
        }
      } catch (error) {
        console.log(`Failed to fetch data for ${symbol}:`, error);
        continue; // Try next variation
      }
    }

    return null;
  } catch (error) {
    console.error('Error in searchStockData:', error);
    return null;
  }
}

async function fetchStockData(symbol: string) {
  try {
    // Try multiple backend URL patterns in case routing is different
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const encodedSymbol = encodeURIComponent(symbol);
    
    // Try different URL patterns (including direct endpoint)
    const urlPatterns = [
      `${backendUrl}/api/v1/stocks/${encodedSymbol}`, // Primary endpoint
      `${backendUrl}/api/v1/stocks/${symbol}`, // Without encoding
      `${backendUrl}/stock/${encodedSymbol}`, // Simple endpoint (test)
      `${backendUrl}/stocks/${encodedSymbol}`, // Direct endpoint (bypasses router)
    ];
    
    let lastError: any = null;
    
    for (const url of urlPatterns) {
      try {
        console.log(`[API] Trying backend URL: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(10000),
          cache: 'no-store', // Always fetch fresh data
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`[API] Successfully fetched data from ${url}:`, data);
          
          // Check if we got valid real data
          if (data.current_price && data.current_price > 0) {
            // Transform backend data to frontend format
            return {
              name: data.name || symbol,
              price: data.current_price,
              previousClose: data.previous_close || (data.current_price - (data.change || 0)),
              change: data.change || 0,
              changePercent: data.change_percent || 0,
              volume: data.volume || 0,
              marketCap: data.market_cap || 0,
              peRatio: data.pe_ratio || 0,
            };
          } else {
            console.warn(`[API] Invalid price data from ${url}:`, data);
          }
        } else {
          const errorText = await response.text().catch(() => '');
          console.warn(`[API] Backend returned ${response.status} for ${url}: ${errorText}`);
          lastError = new Error(`Backend returned ${response.status}: ${errorText}`);
        }
      } catch (patternError: any) {
        // Continue to next pattern if this one fails
        if (patternError.name !== 'AbortError') {
          console.warn(`[API] Error with pattern ${url}:`, patternError.message);
          lastError = patternError;
        }
        continue;
      }
    }
    
    // If all patterns failed, log the last error and return null
    console.error(`[API] All backend URL patterns failed for ${symbol}. Last error:`, lastError?.message || 'Unknown error');
    console.error(`[API] Make sure backend is running on ${backendUrl}`);
    return null;
  } catch (error: any) {
    console.error(`[API] Error fetching stock data from backend for ${symbol}:`, error);
    if (error.name === 'AbortError') {
      console.error(`[API] Request timeout for ${symbol}`);
    }
    return null;
  }
}


function formatCurrency(value: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency === 'INR' ? 'INR' : 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
