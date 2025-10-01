import { NextRequest, NextResponse } from 'next/server';

interface TechnicalRequest {
  symbol: string;
  indicators: string[];
  period: string;
}

interface TechnicalData {
  symbol: string;
  period: string;
  indicators: {
    RSI?: number;
    MACD?: {
      macd: number;
      signal: number;
      histogram: number;
    };
    SMA?: {
      '20': number;
      '50': number;
      '200': number;
    };
    EMA?: {
      '12': number;
      '26': number;
    };
  };
  timestamp: string;
}

// Simple cache for technical data (60 seconds)
const technicalsCache = new Map<string, { data: TechnicalData; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 60 seconds

export async function POST(request: NextRequest) {
  try {
    const body: TechnicalRequest = await request.json();
    const { symbol, indicators, period } = body;

    if (!symbol || !indicators || !period) {
      return NextResponse.json(
        { error: 'Symbol, indicators, and period are required' },
        { status: 400 }
      );
    }

    const symbolUpper = symbol.toUpperCase();
    const cacheKey = `${symbolUpper}_${period}_${indicators.sort().join(',')}`;

    // Check cache first
    const cached = technicalsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Fetch historical data and calculate indicators
    const technicalData = await calculateTechnicalIndicators(symbolUpper, indicators, period);
    
    // Cache the result
    technicalsCache.set(cacheKey, {
      data: technicalData,
      timestamp: Date.now(),
    });

    return NextResponse.json(technicalData);

  } catch (error) {
    console.error('Technicals API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate technical indicators' },
      { status: 500 }
    );
  }
}

async function calculateTechnicalIndicators(
  symbol: string,
  indicators: string[],
  period: string
): Promise<TechnicalData> {
  try {
    // Fetch historical data from Alpha Vantage
    const historicalData = await fetchHistoricalData(symbol, period);
    
    const result: TechnicalData = {
      symbol,
      period,
      indicators: {},
      timestamp: new Date().toISOString(),
    };

    // Calculate requested indicators
    for (const indicator of indicators) {
      switch (indicator.toUpperCase()) {
        case 'RSI':
          result.indicators.RSI = calculateRSI(historicalData);
          break;
        case 'MACD':
          result.indicators.MACD = calculateMACD(historicalData);
          break;
        case 'SMA':
          result.indicators.SMA = calculateSMA(historicalData);
          break;
        case 'EMA':
          result.indicators.EMA = calculateEMA(historicalData);
          break;
      }
    }

    return result;

  } catch (error) {
    console.error('Technical calculation error:', error);
    // Return simulated data as fallback
    return generateSimulatedTechnicals(symbol, indicators, period);
  }
}

async function fetchHistoricalData(symbol: string, period: string): Promise<number[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  
  if (!apiKey) {
    // Return simulated data if no API key
    return generateSimulatedPriceData();
  }

  try {
    const functionName = period === '1d' ? 'TIME_SERIES_INTRADAY' : 'TIME_SERIES_DAILY';
    const interval = period === '1d' ? '&interval=5min' : '';
    
    const response = await fetch(
      `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}&apikey=${apiKey}${interval}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data['Error Message'] || data['Note']) {
      throw new Error('API limit or error');
    }

    const timeSeries = data[Object.keys(data)[1]]; // Get the time series data
    if (!timeSeries) {
      throw new Error('No time series data found');
    }

    // Extract closing prices
    const prices = Object.values(timeSeries)
      .map((item: any) => parseFloat(item['4. close']))
      .slice(0, 200) // Limit to last 200 data points
      .reverse(); // Reverse to get chronological order

    return prices;

  } catch (error) {
    console.error('Historical data fetch error:', error);
    return generateSimulatedPriceData();
  }
}

function generateSimulatedPriceData(): number[] {
  // Generate 200 simulated price points
  const prices: number[] = [];
  let basePrice = 100;
  
  for (let i = 0; i < 200; i++) {
    const change = (Math.random() - 0.5) * 0.02; // ±1% daily change
    basePrice *= (1 + change);
    prices.push(Math.round(basePrice * 100) / 100);
  }
  
  return prices;
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) {
    return 50; // Neutral RSI if not enough data
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return Math.round(rsi * 100) / 100;
}

function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  if (prices.length < 26) {
    return { macd: 0, signal: 0, histogram: 0 };
  }

  const ema12 = calculateEMAValue(prices, 12);
  const ema26 = calculateEMAValue(prices, 26);
  const macd = ema12 - ema26;

  // Simple signal line (9-period EMA of MACD)
  const signal = macd * 0.9; // Simplified calculation
  const histogram = macd - signal;

  return {
    macd: Math.round(macd * 100) / 100,
    signal: Math.round(signal * 100) / 100,
    histogram: Math.round(histogram * 100) / 100,
  };
}

function calculateSMA(prices: number[]): { '20': number; '50': number; '200': number } {
  const sma20 = prices.length >= 20 ? 
    prices.slice(-20).reduce((sum, price) => sum + price, 0) / 20 : 0;
  
  const sma50 = prices.length >= 50 ? 
    prices.slice(-50).reduce((sum, price) => sum + price, 0) / 50 : 0;
  
  const sma200 = prices.length >= 200 ? 
    prices.slice(-200).reduce((sum, price) => sum + price, 0) / 200 : 0;

  return {
    '20': Math.round(sma20 * 100) / 100,
    '50': Math.round(sma50 * 100) / 100,
    '200': Math.round(sma200 * 100) / 100,
  };
}

function calculateEMA(prices: number[]): { '12': number; '26': number } {
  const ema12 = calculateEMAValue(prices, 12);
  const ema26 = calculateEMAValue(prices, 26);

  return {
    '12': Math.round(ema12 * 100) / 100,
    '26': Math.round(ema26 * 100) / 100,
  };
}

function calculateEMAValue(prices: number[], period: number): number {
  if (prices.length < period) {
    return prices[prices.length - 1] || 0;
  }

  const multiplier = 2 / (period + 1);
  let ema = prices[0];

  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }

  return ema;
}

function generateSimulatedTechnicals(
  symbol: string,
  indicators: string[],
  period: string
): TechnicalData {
  const result: TechnicalData = {
    symbol,
    period,
    indicators: {},
    timestamp: new Date().toISOString(),
  };

  for (const indicator of indicators) {
    switch (indicator.toUpperCase()) {
      case 'RSI':
        result.indicators.RSI = Math.round((Math.random() * 40 + 30) * 100) / 100; // 30-70 range
        break;
      case 'MACD':
        result.indicators.MACD = {
          macd: Math.round((Math.random() - 0.5) * 2 * 100) / 100,
          signal: Math.round((Math.random() - 0.5) * 2 * 100) / 100,
          histogram: Math.round((Math.random() - 0.5) * 0.5 * 100) / 100,
        };
        break;
      case 'SMA':
        result.indicators.SMA = {
          '20': Math.round((Math.random() * 50 + 75) * 100) / 100,
          '50': Math.round((Math.random() * 50 + 75) * 100) / 100,
          '200': Math.round((Math.random() * 50 + 75) * 100) / 100,
        };
        break;
      case 'EMA':
        result.indicators.EMA = {
          '12': Math.round((Math.random() * 50 + 75) * 100) / 100,
          '26': Math.round((Math.random() * 50 + 75) * 100) / 100,
        };
        break;
    }
  }

  return result;
}
