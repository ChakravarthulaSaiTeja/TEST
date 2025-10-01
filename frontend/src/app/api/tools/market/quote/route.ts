import { NextRequest, NextResponse } from 'next/server';

interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high52Week: number;
  low52Week: number;
  timestamp: string;
}

// Simple cache for quote data (30 seconds)
const quoteCache = new Map<string, { data: QuoteData; timestamp: number }>();
const CACHE_DURATION = 30 * 1000; // 30 seconds

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    const symbolUpper = symbol.toUpperCase();

    // Check cache first
    const cached = quoteCache.get(symbolUpper);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Fetch real market data (no simulated data)
    const quoteData = await fetchQuoteFromAlphaVantage(symbolUpper);
    
    // Cache the result
    quoteCache.set(symbolUpper, {
      data: quoteData,
      timestamp: Date.now(),
    });

    return NextResponse.json(quoteData);

  } catch (error) {
    console.error('Quote API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch real market data';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

async function fetchQuoteFromAlphaVantage(symbol: string): Promise<QuoteData> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  
  if (!apiKey) {
    // Use Yahoo Finance for real-time data
    return await fetchFromYahooFinance(symbol);
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
      { next: { revalidate: 30 } }
    );

    if (!response.ok) {
      throw new Error(`Market data service unavailable (${response.status}). Please try again later.`);
    }

    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(`No real-time data available for ${symbol}. The symbol may be invalid or not actively traded.`);
    }

    if (data['Note']) {
      // API limit reached, use Yahoo Finance
      return await fetchFromYahooFinance(symbol);
    }

    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) {
      throw new Error(`We don't have real-time data for ${symbol} at the moment. Please try again later.`);
    }

    return {
      symbol: quote['01. symbol'] || symbol,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']) || 0,
      high52Week: parseFloat(quote['03. high']) || 0,
      low52Week: parseFloat(quote['04. low']) || 0,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error('Alpha Vantage fetch error:', error);
    // Use Yahoo Finance for real-time data
    return await fetchFromYahooFinance(symbol);
  }
}

async function fetchFromYahooFinance(symbol: string): Promise<QuoteData> {
  try {
    // Use yfinance-style API endpoint for more reliable data
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Market data service unavailable (${response.status}). Please try again later.`);
    }
    
    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error(`No real-time data available for ${symbol}. The symbol may be invalid or not actively traded.`);
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];
    
    if (!meta || !quote) {
      throw new Error(`Invalid data structure received for ${symbol}. Please try again later.`);
    }
    
    // Get real-time data
    const currentPrice = meta.regularMarketPrice || meta.chartPreviousClose;
    const previousClose = meta.chartPreviousClose;
    
    if (!currentPrice || !previousClose) {
      throw new Error(`Incomplete real-time data for ${symbol}. Please try again later.`);
    }
    
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    return {
      symbol: meta.symbol || symbol,
      price: Math.round(currentPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: meta.regularMarketVolume || 0,
      marketCap: meta.marketCap || null,
      high52Week: meta.fiftyTwoWeekHigh || 0,
      low52Week: meta.fiftyTwoWeekLow || 0,
      timestamp: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('Real-time market data error:', error);
    throw new Error(`We don't have real-time data for ${symbol} at the moment. Please check if the symbol is correct and try again later.`);
  }
}
