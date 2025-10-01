"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, DollarSign, BarChart3, Activity, Loader2 } from "lucide-react";
import StockChart from "@/components/charts/StockChart";

interface StockData {
  symbol: string;
  name: string;
  current_price: number;
  previous_close: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap: number;
  pe_ratio: number;
  dividend_yield: number;
}

export default function StockAnalysis() {
  const [symbol, setSymbol] = useState("AAPL");
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockData = async (stockSymbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/stocks/${stockSymbol}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const data = await response.json();
      setStockData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
      setStockData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData(symbol);
  }, [symbol]);

  const handleAnalyze = () => {
    if (symbol.trim()) {
      fetchStockData(symbol.trim());
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Analysis</h1>
        <p className="text-muted-foreground">Analyze stocks with real-time data and technical indicators</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Enter stock symbol (e.g., AAPL, TSLA, GOOGL)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
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
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Live Price Ticker */}
      {stockData && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Live Price Updates</h3>
                  <p className="text-sm text-blue-700">Real-time data from market sources</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(stockData.current_price)}
                </div>
                <div className={`text-sm font-medium ${
                  stockData.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stockData.change >= 0 ? '+' : ''}{new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(stockData.change)} ({stockData.change_percent.toFixed(2)}%)
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
              <div className="text-2xl font-bold">{formatCurrency(stockData.current_price)}</div>
              <p className={`text-xs flex items-center ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-3 w-3 mr-1 ${stockData.change < 0 ? 'rotate-180' : ''}`} />
                {stockData.change >= 0 ? '+' : ''}{formatCurrency(stockData.change)} ({stockData.change_percent.toFixed(2)}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stockData.market_cap)}</div>
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
              <div className="text-2xl font-bold">{stockData.pe_ratio?.toFixed(2) || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Trailing P/E</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts and Analysis */}
      {stockData && (
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="fundamental">Fundamental</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>

                  <TabsContent value="chart" className="mt-6">
          <StockChart symbol={symbol} />
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
                    <h4 className="font-medium text-blue-600">Trend Indicators</h4>
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
                        <Badge variant="outline" className="text-blue-600 border-blue-600">Strong</Badge>
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
                    <h4 className="font-medium text-blue-600">Valuation Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">P/E Ratio</span>
                        <span className="text-sm font-medium">{stockData.pe_ratio?.toFixed(2) || 'N/A'}</span>
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
      )}
    </div>
  );
}
