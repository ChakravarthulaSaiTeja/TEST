import { NextRequest, NextResponse } from 'next/server';

interface ChartData {
  symbol: string;
  period: string;
  interval: string;
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
    pointRadius: number;
    hoverRadius: number;
    borderWidth: number;
    yAxisID?: string;
  }>;
  metadata: {
    current_price: number;
    price_change: number;
    price_change_percent: number;
    volume: number;
    high_52w: number;
    low_52w: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const period = searchParams.get('period') || '1mo';
    const interval = searchParams.get('interval') || '1d';

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    // Try multiple backend URL patterns
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const encodedSymbol = encodeURIComponent(symbol);
    
    const urlPatterns = [
      `${backendUrl}/stocks/${encodedSymbol}/history?period=${period}&interval=${interval}`, // Direct endpoint first
      `${backendUrl}/api/v1/stocks/${encodedSymbol}/history?period=${period}&interval=${interval}`,
      `${backendUrl}/api/v1/stocks/${symbol}/history?period=${period}&interval=${interval}`,
    ];
    
    for (const url of urlPatterns) {
      try {
        console.log(`[API] Trying history URL: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
          cache: 'no-store',
        });

        if (response.ok) {
          const data: ChartData = await response.json();
          
          // Validate the data
          if (data.labels && data.datasets && data.datasets.length > 0) {
            console.log(`[API] Successfully fetched history from ${url}`);
            return NextResponse.json(data);
          } else {
            console.warn(`[API] Invalid data structure from ${url}, trying next pattern...`);
            continue;
          }
        } else if (response.status !== 404) {
          console.warn(`[API] Backend returned ${response.status} for ${url}, trying next pattern...`);
          continue;
        }
      } catch (patternError: any) {
        if (patternError.name !== 'AbortError') {
          console.warn(`[API] Error with history pattern ${url}:`, patternError.message);
        }
        continue;
      }
    }
    
    // If all patterns failed
    console.error(`[API] All history URL patterns failed for ${symbol}`);
    return NextResponse.json(
      { error: 'Failed to fetch historical data from backend' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error fetching stock history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
