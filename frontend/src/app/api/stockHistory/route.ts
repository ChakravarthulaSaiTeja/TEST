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

    // Call the backend API for historical data
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(
      `${backendUrl}/api/v1/stocks/${symbol}/history?period=${period}&interval=${interval}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      console.error(`Backend API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch historical data' },
        { status: response.status }
      );
    }

    const data: ChartData = await response.json();
    
    // Validate the data
    if (!data.labels || !data.datasets || data.datasets.length === 0) {
      return NextResponse.json(
        { error: 'Invalid chart data received' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
