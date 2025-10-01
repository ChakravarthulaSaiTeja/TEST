import { NextRequest, NextResponse } from 'next/server';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relevanceScore: number;
}

interface NewsResponse {
  symbol: string;
  articles: NewsArticle[];
  totalResults: number;
  timestamp: string;
}

// Simple cache for news data (5 minutes)
const newsCache = new Map<string, { data: NewsResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const days = parseInt(searchParams.get('days') || '3');

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    const symbolUpper = symbol.toUpperCase();
    const cacheKey = `${symbolUpper}_${days}`;

    // Check cache first
    const cached = newsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Fetch news from NewsAPI
    const newsData = await fetchNewsFromAPI(symbolUpper, days);
    
    // Cache the result
    newsCache.set(cacheKey, {
      data: newsData,
      timestamp: Date.now(),
    });

    return NextResponse.json(newsData);

  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news data' },
      { status: 500 }
    );
  }
}

async function fetchNewsFromAPI(symbol: string, days: number): Promise<NewsResponse> {
  const apiKey = process.env.NEWSAPI_KEY;
  
  if (!apiKey) {
    // Fallback to simulated data if no API key
    return generateSimulatedNews(symbol, days);
  }

  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const fromDateStr = fromDate.toISOString().split('T')[0];

    // Get allowed domains from environment
    const domains = process.env.STOCK_NEWS_DOMAINS || 'seekingalpha.com,marketwatch.com,barrons.com,wsj.com,finance.yahoo.com';
    
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${symbol}&domains=${domains}&from=${fromDateStr}&sortBy=publishedAt&pageSize=8&apiKey=${apiKey}`,
      { next: { revalidate: 300 } } // 5 minutes cache
    );

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(data.message || 'NewsAPI error');
    }

    const articles: NewsArticle[] = data.articles.map((article: any) => ({
      title: article.title,
      description: article.description || '',
      url: article.url,
      source: article.source.name,
      publishedAt: article.publishedAt,
      sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
      relevanceScore: calculateRelevanceScore(article.title, article.description || '', symbol),
    }));

    // Sort by relevance and remove duplicates
    const uniqueArticles = removeDuplicateArticles(articles);
    const sortedArticles = uniqueArticles
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 8);

    return {
      symbol,
      articles: sortedArticles,
      totalResults: data.totalResults,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error('NewsAPI fetch error:', error);
    // Fallback to simulated data
    return generateSimulatedNews(symbol, days);
  }
}

function analyzeSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
  const bullishWords = [
    'bullish', 'buy', 'positive', 'growth', 'profit', 'gain', 'rise', 'increase',
    'strong', 'outperform', 'upgrade', 'beat', 'exceed', 'surge', 'rally',
    'breakthrough', 'momentum', 'optimistic', 'confidence', 'recovery'
  ];
  
  const bearishWords = [
    'bearish', 'sell', 'negative', 'decline', 'loss', 'fall', 'decrease',
    'weak', 'underperform', 'downgrade', 'miss', 'disappoint', 'drop',
    'crash', 'concern', 'risk', 'uncertainty', 'volatility', 'pressure'
  ];

  const lowerText = text.toLowerCase();
  
  let bullishScore = 0;
  let bearishScore = 0;

  bullishWords.forEach(word => {
    const matches = (lowerText.match(new RegExp(word, 'g')) || []).length;
    bullishScore += matches;
  });

  bearishWords.forEach(word => {
    const matches = (lowerText.match(new RegExp(word, 'g')) || []).length;
    bearishScore += matches;
  });

  if (bullishScore > bearishScore) return 'bullish';
  if (bearishScore > bullishScore) return 'bearish';
  return 'neutral';
}

function calculateRelevanceScore(title: string, description: string, symbol: string): number {
  const text = (title + ' ' + description).toLowerCase();
  const symbolLower = symbol.toLowerCase();
  
  let score = 0;
  
  // Direct symbol mention
  if (text.includes(symbolLower)) score += 10;
  
  // Company name mentions (simplified)
  const companyNames: { [key: string]: string[] } = {
    'AAPL': ['apple', 'iphone', 'ipad', 'mac'],
    'NVDA': ['nvidia', 'gpu', 'ai', 'artificial intelligence'],
    'TSLA': ['tesla', 'electric vehicle', 'ev', 'elon musk'],
    'MSFT': ['microsoft', 'azure', 'office', 'windows'],
    'GOOGL': ['google', 'alphabet', 'search', 'youtube'],
    'AMZN': ['amazon', 'aws', 'prime', 'e-commerce'],
    'META': ['facebook', 'meta', 'instagram', 'whatsapp'],
  };

  const companyKeywords = companyNames[symbol] || [];
  companyKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 5;
  });

  // Financial terms
  const financialTerms = ['earnings', 'revenue', 'profit', 'stock', 'shares', 'dividend', 'analyst'];
  financialTerms.forEach(term => {
    if (text.includes(term)) score += 2;
  });

  return Math.min(score, 100); // Cap at 100
}

function removeDuplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter(article => {
    const key = article.title.toLowerCase().trim();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function generateSimulatedNews(symbol: string, days: number): NewsResponse {
  const companyNames: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'NVDA': 'NVIDIA Corporation',
    'TSLA': 'Tesla Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms Inc.',
    'NFLX': 'Netflix Inc.',
    'AMD': 'Advanced Micro Devices',
    'INTC': 'Intel Corporation',
  };

  const companyName = companyNames[symbol] || symbol;
  
  const sampleArticles = [
    {
      title: `${companyName} Reports Strong Q4 Earnings Beat`,
      description: `The company exceeded analyst expectations with robust revenue growth and improved margins.`,
      source: 'MarketWatch',
      sentiment: 'bullish' as const,
    },
    {
      title: `${companyName} Stock Faces Headwinds Amid Market Volatility`,
      description: `Investors remain cautious as broader market conditions impact technology stocks.`,
      source: 'Seeking Alpha',
      sentiment: 'bearish' as const,
    },
    {
      title: `Analysts Upgrade ${companyName} Price Target Following Product Launch`,
      description: `The new product announcement has generated positive sentiment among Wall Street analysts.`,
      source: 'Barron\'s',
      sentiment: 'bullish' as const,
    },
    {
      title: `${companyName} Expands Market Share in Key Segments`,
      description: `The company continues to strengthen its competitive position in core business areas.`,
      source: 'Yahoo Finance',
      sentiment: 'neutral' as const,
    },
    {
      title: `${companyName} Faces Regulatory Challenges in Major Markets`,
      description: `New regulations could impact the company's operations and profitability outlook.`,
      source: 'Wall Street Journal',
      sentiment: 'bearish' as const,
    },
    {
      title: `${companyName} Announces Strategic Partnership Agreement`,
      description: `The collaboration is expected to drive innovation and market expansion opportunities.`,
      source: 'MarketWatch',
      sentiment: 'bullish' as const,
    },
    {
      title: `${companyName} Stock Performance Mixed Amid Sector Rotation`,
      description: `Investors are reassessing valuations as market dynamics continue to evolve.`,
      source: 'Seeking Alpha',
      sentiment: 'neutral' as const,
    },
    {
      title: `${companyName} CEO Discusses Future Growth Strategy`,
      description: `Leadership outlines plans for sustainable growth and shareholder value creation.`,
      source: 'Yahoo Finance',
      sentiment: 'bullish' as const,
    },
  ];

  const articles: NewsArticle[] = sampleArticles.map((article, index) => ({
    title: article.title,
    description: article.description,
    url: `https://example.com/news/${symbol.toLowerCase()}-${index + 1}`,
    source: article.source,
    publishedAt: new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: article.sentiment,
    relevanceScore: 80 - index * 5, // Decreasing relevance score
  }));

  return {
    symbol,
    articles,
    totalResults: articles.length,
    timestamp: new Date().toISOString(),
  };
}
