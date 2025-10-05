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

    const trimmedQuery = query.trim().toLowerCase();
    
    if (!trimmedQuery) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    // Search for the stock using yfinance-like approach
    const stockData = await searchStockData(trimmedQuery);
    
    if (!stockData) {
      return NextResponse.json(
        { error: 'Company not found' },
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
    const upperQuery = query.toUpperCase().replace(/\s+/g, '');
    
    // Common US company mappings to prioritize US stocks
    const usCompanies = ['APPLE', 'MICROSOFT', 'GOOGLE', 'ALPHABET', 'AMAZON', 'TESLA', 'META', 'FACEBOOK', 'NETFLIX', 'NVDA', 'NVIDIA', 'UBER', 'LYFT', 'SPOTIFY', 'ZOOM', 'SHOPIFY', 'PAYPAL', 'SQUARE', 'TWITTER', 'SNAP', 'SALESFORCE', 'ORACLE', 'INTEL', 'CISCO', 'IBM', 'ADOBE', 'NIKE', 'COCA', 'PEPSI', 'WALMART', 'TARGET', 'DISNEY', 'VERIZON', 'ATT', 'JPMORGAN', 'BANKOFAMERICA', 'WELLSFARGO', 'GOLDMANSACHS', 'MORGANSTANLEY', 'VISA', 'MASTERCARD', 'AMERICANEXPRESS', 'BERKSHIRE', 'JOHNSON', 'PFIZER', 'MODERNA', 'BOEING', 'GENERALELECTRIC', 'FORD', 'GENERALMOTORS', 'CHEVRON', 'EXXON', 'SHELL', 'BP', 'PROCTER', 'UNILEVER', 'CATERPILLAR', 'DEERE', '3M', 'HONEYWELL', 'LOCKHEED', 'RAYTHEON', 'NORTHROP', 'GENERALDYNAMICS'];
    
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
      // Indian companies or unknown - try Indian first
      symbolVariations = [
        `${upperQuery}.NS`,   // NSE (Indian stocks) - try first
        `${upperQuery}.BO`,   // BSE (Indian stocks)
        upperQuery,           // Original query (fallback)
      ];
    }

    // Try each symbol variation until we find valid data
    for (const symbol of symbolVariations) {
      try {
        const stockData = await fetchStockData(symbol);
        
        if (stockData && stockData.price > 0) {
          // Determine currency and exchange based on symbol
          const isIndianStock = symbol.includes('.NS') || symbol.includes('.BO');
          const currency = isIndianStock ? 'INR' : 'USD';
          const exchange = isIndianStock ? 'NSE' : 'NYSE';
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
    // Call the backend StockDataService for real-time data
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/stocks/${symbol}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(`Backend API error: ${response.status} ${response.statusText}`);
      return null; // Return null instead of mock data
    }

    const data = await response.json();
    
    // Check if we got valid real data
    if (data.current_price && data.current_price > 0) {
      // Transform backend data to frontend format
      return {
        name: data.name,
        price: data.current_price,
        previousClose: data.previous_close || data.current_price - data.change,
        change: data.change,
        changePercent: data.change_percent,
        volume: data.volume,
        marketCap: data.market_cap,
        peRatio: data.pe_ratio,
      };
    } else {
      // If backend returned invalid data, return null
      console.error('Backend returned invalid data:', data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching stock data from backend:', error);
    return null; // Return null instead of mock data
  }
}

// Mock data functions removed - now using only real data from backend

function formatCurrency(value: number, currency: string): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
