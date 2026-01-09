"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Activity, Loader2 } from "lucide-react";

// NIFTY 50 Index symbol
const NIFTY50_SYMBOL = "^NSEI";
const NIFTY50_NAME = "NIFTY 50";

interface StockSentiment {
  symbol: string;
  name: string;
  score: number;
  sentiment: "Bullish" | "Bearish" | "Neutral";
  changePercent: number;
  price: number;
  volume: number;
  trend: "Up" | "Down" | "Sideways";
}

export default function Sentiment() {
  const [stockSentiments, setStockSentiments] = useState<StockSentiment[]>([]);
  const [overallSentiment, setOverallSentiment] = useState({
    score: 0.5,
    sentiment: "Neutral" as "Bullish" | "Bearish" | "Neutral",
    confidence: 0.75,
    change: 0,
    changePercent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockSentiments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch sentiment data from backend API for NIFTY 50
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/sentiment/${encodeURIComponent(NIFTY50_SYMBOL)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch sentiment data: ${response.statusText}`);
      }

      const sentimentData = await response.json();
      
      if (!sentimentData) {
        throw new Error('No sentiment data received');
      }

      // Create stock sentiment object from API response
      const stockSentiment: StockSentiment = {
        symbol: sentimentData.symbol,
        name: sentimentData.name || NIFTY50_NAME,
        score: sentimentData.score,
        sentiment: sentimentData.sentiment,
        changePercent: sentimentData.change_percent,
        price: sentimentData.price,
        volume: sentimentData.volume,
        trend: sentimentData.trend,
      };
      
      setStockSentiments([stockSentiment]);
      
      // Set overall sentiment from API data
      setOverallSentiment({
        score: sentimentData.score,
        sentiment: sentimentData.sentiment,
        confidence: sentimentData.confidence,
        change: sentimentData.change,
        changePercent: sentimentData.change_percent,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sentiment data');
      console.error('Error fetching sentiment data:', err);
      setStockSentiments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockSentiments();
  }, []);

  // Removed mock data - using real data from backend API

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'very positive':
      case 'bullish':
        return 'bg-green-100 text-green-800';
      case 'negative':
      case 'very negative':
      case 'bearish':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'very positive':
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
      case 'very negative':
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sentiment Analysis</h1>
          <p className="text-muted-foreground">
            AI-powered sentiment analysis based on real-time stock data and market trends
          </p>
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              <strong>Note:</strong> Sentiment analysis is calculated at the start of each trading day based on price movements, volume trends, and historical patterns. Sentiment scores range from 0 (Bearish) to 1 (Bullish).
            </p>
          </div>
        </div>
        <Button onClick={fetchStockSentiments} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Activity className="mr-2 h-4 w-4" />
              Refresh Analysis
            </>
          )}
        </Button>
      </div>

      {/* Overall Sentiment */}
      <Card>
        <CardHeader>
          <CardTitle>NIFTY 50 Market Sentiment</CardTitle>
          <CardDescription>
            Overall sentiment for NIFTY 50 index based on real-time data and technical indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <span className="ml-2 text-muted-foreground">Analyzing sentiment...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>Error: {error}</p>
              <Button onClick={fetchStockSentiments} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    overallSentiment.score > 0.6 ? 'text-green-600' : 
                    overallSentiment.score < 0.4 ? 'text-red-600' : 
                    'text-purple-600'
                  }`}>
                    {overallSentiment.score.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">Sentiment Score</p>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    overallSentiment.sentiment === 'Bullish' ? 'text-green-600' :
                    overallSentiment.sentiment === 'Bearish' ? 'text-red-600' :
                    'text-purple-600'
                  }`}>
                    {overallSentiment.sentiment}
                  </div>
                  <p className="text-sm text-muted-foreground">Overall Sentiment</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{(overallSentiment.confidence * 100).toFixed(0)}%</div>
                  <p className="text-sm text-muted-foreground">Confidence Level</p>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    overallSentiment.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {overallSentiment.changePercent >= 0 ? '+' : ''}{overallSentiment.changePercent.toFixed(2)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Change</p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Sentiment Trend</span>
                  <span className={`text-sm ${
                    overallSentiment.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {overallSentiment.changePercent >= 0 ? '+' : ''}{overallSentiment.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      overallSentiment.score > 0.6 ? 'bg-green-600' :
                      overallSentiment.score < 0.4 ? 'bg-red-600' :
                      'bg-purple-600'
                    }`}
                    style={{ width: `${overallSentiment.score * 100}%` }}
                  ></div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Stock Sentiment Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>NIFTY 50 Sentiment Analysis</CardTitle>
            <CardDescription>
              Real-time sentiment analysis for NIFTY 50 index
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
              </div>
            ) : stockSentiments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No sentiment data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stockSentiments.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        stock.sentiment === 'Bullish' ? 'bg-green-100 dark:bg-green-900/50' :
                        stock.sentiment === 'Bearish' ? 'bg-red-100 dark:bg-red-900/50' :
                        'bg-purple-100 dark:bg-purple-900/50'
                      }`}>
                        {stock.trend === 'Up' && <TrendingUp className={`h-4 w-4 ${
                          stock.sentiment === 'Bullish' ? 'text-green-600' : 'text-purple-600'
                        }`} />}
                        {stock.trend === 'Down' && <TrendingDown className={`h-4 w-4 ${
                          stock.sentiment === 'Bearish' ? 'text-red-600' : 'text-purple-600'
                        }`} />}
                        {stock.trend === 'Sideways' && <BarChart3 className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div>
                        <div className="font-medium">{stock.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })} • {stock.trend} trend
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSentimentColor(stock.sentiment)}>
                          {stock.sentiment}
                        </Badge>
                        <span className="text-sm font-medium">{stock.score.toFixed(2)}</span>
                      </div>
                      <div className={`text-xs ${
                        stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Indicators</CardTitle>
            <CardDescription>
              Key technical indicators for NIFTY 50 sentiment analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : stockSentiments.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">RSI</div>
                    <div className="text-lg font-semibold">
                      {stockSentiments[0].score > 0.6 ? 'Overbought' : stockSentiments[0].score < 0.4 ? 'Oversold' : 'Neutral'}
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Trend</div>
                    <div className="text-lg font-semibold">{stockSentiments[0].trend}</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Sentiment analysis is based on price movements, volume trends, and technical indicators (RSI, MACD, Moving Averages).
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No technical data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* NIFTY 50 Sentiment Details */}
      {stockSentiments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>NIFTY 50 Sentiment Details</CardTitle>
            <CardDescription>
              Detailed sentiment analysis for NIFTY 50 index
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Current Price</div>
                  <div className="text-2xl font-bold">
                    ₹{stockSentiments[0].price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-sm mt-1 ${
                    stockSentiments[0].changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stockSentiments[0].changePercent >= 0 ? '+' : ''}{stockSentiments[0].changePercent.toFixed(2)}%
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Volume</div>
                  <div className="text-2xl font-bold">
                    {stockSentiments[0].volume >= 1e7 
                      ? `${(stockSentiments[0].volume / 1e7).toFixed(2)}Cr`
                      : stockSentiments[0].volume >= 1e5
                      ? `${(stockSentiments[0].volume / 1e5).toFixed(2)}L`
                      : stockSentiments[0].volume.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Sentiment Analysis</div>
                <div className="text-sm text-muted-foreground">
                  The sentiment score is calculated based on price movements, volume trends, RSI (Relative Strength Index), 
                  MACD (Moving Average Convergence Divergence), and moving averages. A score above 0.6 indicates bullish sentiment, 
                  below 0.4 indicates bearish sentiment, and between 0.4-0.6 indicates neutral sentiment.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NIFTY 50 Information */}
      <Card>
        <CardHeader>
          <CardTitle>About NIFTY 50 Sentiment Analysis</CardTitle>
          <CardDescription>
            Understanding sentiment analysis for the NIFTY 50 index
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                What is Sentiment Analysis?
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                Sentiment analysis for NIFTY 50 combines multiple technical indicators including price movements, 
                volume trends, RSI, MACD, and moving averages to determine overall market sentiment. This helps 
                investors understand whether the market is bullish, bearish, or neutral.
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-3 border rounded-lg">
                <div className="text-sm font-medium mb-1">Bullish Sentiment (Score &gt; 0.6)</div>
                <div className="text-xs text-muted-foreground">
                  Indicates positive market outlook with upward price trends and strong buying pressure.
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-sm font-medium mb-1">Bearish Sentiment (Score &lt; 0.4)</div>
                <div className="text-xs text-muted-foreground">
                  Indicates negative market outlook with downward price trends and selling pressure.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
