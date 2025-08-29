"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, DollarSign, BarChart3, Activity } from "lucide-react";

export default function StockAnalysis() {
  const [symbol, setSymbol] = useState("AAPL");

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
              />
            </div>
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stock Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Price</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$175.43</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.15 (+1.24%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.75T</div>
            <p className="text-xs text-muted-foreground">Apple Inc.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.7M</div>
            <p className="text-xs text-muted-foreground">Avg: 52.3M</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P/E Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28.5</div>
            <p className="text-xs text-muted-foreground">Industry: 25.2</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="fundamental">Fundamental</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Price Chart</CardTitle>
              <CardDescription>Interactive price chart with technical indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Chart component will be integrated here</p>
              </div>
            </CardContent>
          </Card>
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
                      <span className="text-sm font-medium">28.5</span>
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
    </div>
  );
}
