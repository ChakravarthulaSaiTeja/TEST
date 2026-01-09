"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, DollarSign, BarChart3, Activity, Loader2 } from "lucide-react";
import StockChart from "@/components/charts/StockChart";
import LiveStockChart from "@/components/charts/LiveStockChart";

interface StockData {
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
  lastUpdated?: string;
}

// NIFTY 50 Index symbol for yfinance
const NIFTY50_SYMBOL = "^NSEI";
const NIFTY50_NAME = "NIFTY 50";

export default function StockAnalysis() {
  const [symbol, setSymbol] = useState(NIFTY50_SYMBOL);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchStockData = async (stockSymbol: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[Analysis] Fetching stock data for: ${stockSymbol}`);
      
      const response = await fetch('/api/searchStocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: stockSymbol }),
      });
      
      console.log(`[Analysis] Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`[Analysis] API error: ${response.status} - ${errorText}`);
        
        if (response.status === 404) {
          throw new Error('Company not found. Please check if the backend is running and the symbol is correct.');
        }
        throw new Error(`Failed to fetch data: ${response.statusText}. ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`[Analysis] Received data:`, data);
      
      if (!data || !data.price) {
        throw new Error('Invalid data received from API');
      }
      
      setStockData(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error(`[Analysis] Error fetching stock data:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
      setStockData(null);
    } finally {
      setLoading(false);
    }
  };

  // Preload NIFTY 50 data on mount and update when symbol changes
  useEffect(() => {
    fetchStockData(symbol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  // Auto-refresh every 30 seconds when enabled
  useEffect(() => {
    if (!autoRefresh || !stockData) return;

    const interval = setInterval(() => {
      fetchStockData(symbol);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, symbol, stockData]);

  const handleAnalyze = () => {
    if (symbol.trim()) {
      fetchStockData(symbol.trim());
    }
  };

  const handleStockClick = (stockName: string) => {
    setSymbol(stockName);
    fetchStockData(stockName);
  };

  const formatCurrency = (value: number, currency: string = 'INR') => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
      currency: currency === 'INR' ? 'INR' : 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
  };

  const formatNumber = (value: number) => {
    // Indian numbering system: Crores, Lakhs
    if (value >= 1e7) return `${(value / 1e7).toFixed(2)}Cr`; // Crores
    if (value >= 1e5) return `${(value / 1e5).toFixed(2)}L`; // Lakhs
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return new Intl.NumberFormat('en-IN').format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">NIFTY 50 Analysis</h1>
        <p className="text-muted-foreground">Analyze NIFTY 50 index with real-time data and technical indicators</p>
      </div>

      {/* NIFTY 50 Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Index Selection</CardTitle>
          <CardDescription>Analyze NIFTY 50 index or search for other symbols</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={symbol === NIFTY50_SYMBOL ? "default" : "outline"}
              onClick={() => {
                setSymbol(NIFTY50_SYMBOL);
                handleStockClick(NIFTY50_SYMBOL);
              }}
              disabled={loading}
              className={`transition-all ${
                symbol === NIFTY50_SYMBOL
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-primary/10"
              }`}
            >
              {NIFTY50_NAME}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Enter symbol (e.g., ^NSEI for NIFTY 50, RELIANCE.NS, TCS.NS)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="bg-background border-input"
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => fetchStockData(symbol)} 
              disabled={loading}
              title="Refresh data"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button 
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              disabled={loading}
              title="Auto-refresh every 30 seconds"
            >
              <Activity className="mr-2 h-4 w-4" />
              {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 font-semibold mb-2">{error}</p>
              <p className="text-sm text-muted-foreground mb-4">
                Make sure the backend server is running on http://localhost:8000
              </p>
              <Button onClick={() => fetchStockData(symbol)} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Price Ticker */}
      {loading && !stockData && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600 mr-2" />
              <span className="text-muted-foreground">Loading stock data...</span>
            </div>
          </CardContent>
        </Card>
      )}
      {stockData && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">Live Price Updates</h3>
                  <p className="text-sm text-purple-700">Real-time data from market sources</p>
                  {lastRefresh && (
                    <p className="text-xs text-purple-600 mt-1">
                      Last updated: {lastRefresh.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-900">
                  {stockData.priceFormatted}
                </div>
                <div className={`text-sm font-medium ${
                  stockData.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stockData.change >= 0 ? '+' : ''}{formatCurrency(stockData.change, stockData.currency)} ({stockData.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Overview */}
      {stockData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Price</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stockData.price, stockData.currency)}</div>
              <p className={`text-xs flex items-center ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-3 w-3 mr-1 ${stockData.change < 0 ? 'rotate-180' : ''}`} />
                {stockData.change >= 0 ? '+' : ''}{formatCurrency(stockData.change, stockData.currency)} ({stockData.changePercent.toFixed(2)}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stockData.marketCap)}</div>
              <p className="text-xs text-muted-foreground">{stockData.name}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stockData.volume)}</div>
              <p className="text-xs text-muted-foreground">Today&apos;s Volume</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">P/E Ratio</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockData.peRatio?.toFixed(2) || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Trailing P/E</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts and Analysis */}
      {stockData ? (
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="fundamental">Fundamental</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="mt-6">
            <LiveStockChart symbol={stockData.symbol} />
          </TabsContent>

          <TabsContent value="technical" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Indicators</CardTitle>
                <CardDescription>Key technical analysis signals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-medium text-purple-600">Trend Indicators</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Moving Averages</span>
                        <Badge variant="outline" className="text-green-600 border-green-600">Bullish</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">MACD</span>
                        <Badge variant="outline" className="text-green-600 border-green-600">Positive</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">ADX</span>
                        <Badge variant="outline" className="text-purple-600 border-purple-600">Strong</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-green-600">Momentum Indicators</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">RSI (14)</span>
                        <Badge variant="outline" className="text-green-600 border-green-600">65.4</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Stochastic</span>
                        <Badge variant="outline" className="text-green-600 border-green-600">72.3</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Williams %R</span>
                        <Badge variant="outline" className="text-green-600 border-green-600">-28.5</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fundamental" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Fundamental Analysis</CardTitle>
                <CardDescription>Company financial metrics and ratios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-medium text-purple-600">Valuation Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">P/E Ratio</span>
                        <span className="text-sm font-medium">{stockData.peRatio?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">P/B Ratio</span>
                        <span className="text-sm font-medium">12.3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">P/S Ratio</span>
                        <span className="text-sm font-medium">6.8</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-green-600">Financial Health</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Debt/Equity</span>
                        <span className="text-sm font-medium">0.45</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Current Ratio</span>
                        <span className="text-sm font-medium">1.8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">ROE</span>
                        <span className="text-sm font-medium">18.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent News</CardTitle>
                <CardDescription>Latest news and events affecting the stock</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Apple Reports Strong Q4 Earnings</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Apple Inc. reported better-than-expected quarterly results, driven by strong iPhone sales and services growth.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">2 hours ago • Positive Impact</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">New Product Launch Expected</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Rumors suggest Apple is planning to launch new products in the coming weeks.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">1 day ago • Neutral Impact</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => fetchStockData(symbol)} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
