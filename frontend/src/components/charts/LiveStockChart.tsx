"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Maximize2, 
  Settings,
  TrendingUp,
  TrendingDown
} from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartData {
  symbol: string;
  period: string;
  interval: string;
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
    tension?: number;
    pointRadius?: number;
    hoverRadius?: number;
    borderWidth?: number;
    yAxisID?: string;
    type?: string;
  }>;
  metadata: {
    current_price: number;
    price_change: number;
    price_change_percent: number;
    volume: number;
    high_52w: number;
    low_52w: number;
    previous_close?: number;
    open?: number;
    day_high?: number;
    day_low?: number;
    avg_volume?: number;
  };
}

interface LiveStockChartProps {
  symbol?: string;
  className?: string;
}

const TIMEFRAMES = [
  { value: "1d", label: "1D" },
  { value: "5d", label: "5D" },
  { value: "1mo", label: "1M" },
  { value: "6mo", label: "6M" },
  { value: "ytd", label: "YTD" },
  { value: "1y", label: "1Y" },
  { value: "5y", label: "5Y" },
  { value: "max", label: "All" },
];

export default function LiveStockChart({ 
  symbol = "^NSEI", 
  className 
}: LiveStockChartProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [stockInfo, setStockInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("6mo");
  const [showKeyEvents, setShowKeyEvents] = useState(false);
  const chartRef = useRef<ChartJS | null>(null);

  const fetchChartData = async (stockSymbol: string, period: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[LiveStockChart] Fetching chart data for ${stockSymbol} with period ${period}`);
      
      // Fetch chart data
      const chartResponse = await fetch(
        `/api/stockHistory?symbol=${encodeURIComponent(stockSymbol)}&period=${period}&interval=1d`
      );
      
      if (!chartResponse.ok) {
        const errorText = await chartResponse.text();
        console.error(`[LiveStockChart] Chart API error: ${chartResponse.status} - ${errorText}`);
        throw new Error(`Failed to fetch chart data: ${chartResponse.statusText}`);
      }
      
      const chartDataResult = await chartResponse.json();
      console.log(`[LiveStockChart] Received chart data:`, {
        labels: chartDataResult.labels?.length,
        datasets: chartDataResult.datasets?.length,
        metadata: chartDataResult.metadata
      });
      
      // Fetch stock info for additional metrics
      try {
        const infoResponse = await fetch('/api/searchStocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: stockSymbol }),
        });
        
        if (infoResponse.ok) {
          const infoData = await infoResponse.json();
          setStockInfo(infoData);
          
          // Merge metadata
          if (chartDataResult.metadata) {
            chartDataResult.metadata = {
              ...chartDataResult.metadata,
              previous_close: infoData.previousClose || chartDataResult.metadata.current_price,
              open: infoData.price || chartDataResult.metadata.current_price,
              day_high: infoData.price || chartDataResult.metadata.current_price,
              day_low: infoData.price || chartDataResult.metadata.current_price,
              avg_volume: infoData.volume || chartDataResult.metadata.volume,
            };
          }
        }
      } catch (infoErr) {
        console.warn('Could not fetch stock info:', infoErr);
      }
      
      // Validate chart data structure
      if (!chartDataResult.labels || !chartDataResult.datasets || chartDataResult.datasets.length === 0) {
        throw new Error('Invalid chart data structure received from API');
      }
      
      setChartData(chartDataResult);
    } catch (err) {
      console.error(`[LiveStockChart] Error fetching chart data:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchChartData(symbol, selectedTimeframe);
    }
  }, [symbol, selectedTimeframe]);

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1e7) return `${(value / 1e7).toFixed(2)}Cr`;
    if (value >= 1e5) return `${(value / 1e5).toFixed(2)}L`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return new Intl.NumberFormat('en-IN').format(value);
  };

  if (loading && !chartData) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="h-[600px] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !chartData) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="h-[600px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-2 font-semibold">
                {error || 'No chart data available'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Symbol: {symbol} | Timeframe: {selectedTimeframe}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => fetchChartData(symbol, selectedTimeframe)} variant="outline">
                  Retry
                </Button>
                <Button 
                  onClick={() => {
                    setSelectedTimeframe("1mo");
                    fetchChartData(symbol, "1mo");
                  }} 
                  variant="outline"
                >
                  Try 1M
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPrice = chartData.metadata?.current_price || 0;
  const priceChange = chartData.metadata?.price_change_percent || 0;
  const isPositive = priceChange >= 0;

  // Prepare chart datasets with price and volume
  // Handle both "Price" and first dataset as price
  const priceDataset = chartData.datasets.find(d => d.label === "Price") || chartData.datasets[0];
  const volumeDataset = chartData.datasets.find(d => d.label === "Volume") || chartData.datasets[1];
  
  const priceData = priceDataset?.data || [];
  const volumeData = volumeDataset?.data || [];
  
  // Validate we have data to display
  if (priceData.length === 0 || !chartData.labels || chartData.labels.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="h-[600px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-2 font-semibold">No chart data available</p>
              <p className="text-sm text-muted-foreground mb-4">
                The chart data is empty. Please check if the backend is running and the symbol is correct.
              </p>
              <Button onClick={() => fetchChartData(symbol, selectedTimeframe)} variant="outline">
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  console.log(`[LiveStockChart] Preparing chart:`, {
    priceDataLength: priceData.length,
    volumeDataLength: volumeData.length,
    labelsLength: chartData.labels?.length
  });

  const chartDatasets: any[] = [
    {
      label: "Price",
      data: priceData,
      borderColor: "#22c55e", // Green line
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      fill: false,
      tension: 0.1,
      pointRadius: 0,
      hoverRadius: 4,
      borderWidth: 2,
      yAxisID: "y",
    },
  ];

  // Add volume bars if available
  if (volumeData.length > 0) {
    chartDatasets.push({
      label: "Volume",
      data: volumeData,
      type: "bar",
      backgroundColor: "rgba(156, 163, 175, 0.3)",
      borderColor: "rgba(156, 163, 175, 0.5)",
      borderWidth: 0,
      yAxisID: "y1",
      maxBarThickness: 20,
    });
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: (ctx: TooltipItem<'line'>[]) => `Date: ${ctx[0]?.label}`,
          label: (ctx: TooltipItem<'line'>) => {
            if (ctx.datasetIndex === 0) {
              return `Price: ${formatCurrency(ctx.parsed.y)}`;
            } else {
              return `Volume: ${formatNumber(ctx.parsed.y)}`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: "#9ca3af",
          maxTicksLimit: 8,
        },
        border: {
          color: "rgba(156, 163, 175, 0.2)",
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
        ticks: {
          color: "#9ca3af",
          callback: (val: string | number) => {
            return formatCurrency(Number(val));
          },
        },
        border: {
          color: "rgba(156, 163, 175, 0.2)",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(156, 163, 175, 0.5)",
          callback: (val: string | number) => {
            return formatNumber(Number(val));
          },
        },
      },
    },
  };

  // Plugin to draw current price line
  const currentPricePlugin = {
    id: "currentPriceLine",
    afterDraw: (chart: any) => {
      if (currentPrice > 0) {
        const ctx = chart.ctx;
        const yScale = chart.scales.y;
        const yPos = yScale.getPixelForValue(currentPrice);
        
        ctx.save();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(chart.chartArea.left, yPos);
        ctx.lineTo(chart.chartArea.right, yPos);
        ctx.stroke();
        ctx.restore();
      }
    },
  };

  return (
    <Card className={`bg-background border-border ${className}`}>
      <CardContent className="p-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="key-events"
                checked={showKeyEvents}
                onCheckedChange={setShowKeyEvents}
              />
              <Label htmlFor="key-events" className="text-sm text-muted-foreground cursor-pointer">
                Key Events
              </Label>
            </div>
            <div className="text-sm text-muted-foreground">
              {chartData.symbol}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="px-6 py-4">
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Understanding the Price Chart:</strong> This chart shows historical price movements over your selected timeframe. 
              <strong className="block mt-1">Upward trends (green) indicate price increases, downward trends (red) indicate decreases.</strong> 
              The shaded area under the line shows price volatility. Use the timeframe buttons (1D, 1M, 6M, etc.) to view different periods. 
              The red dashed line indicates the current price level. Volume bars at the bottom show trading activity - higher volume often indicates stronger price movements.
            </p>
          </div>
          <div className="h-[400px] relative">
            <Chart
              ref={chartRef}
              type="line"
              data={{
                labels: chartData.labels,
                datasets: chartDatasets,
              }}
              options={chartOptions}
              plugins={[currentPricePlugin]}
            />
            {/* Current Price Indicator */}
            {currentPrice > 0 && (
              <div className="absolute right-0 top-0 flex items-center pointer-events-none">
                <div className="flex flex-col items-end gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
                  <div className="text-xs font-semibold text-red-600">
                    {formatCurrency(currentPrice)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="px-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            {TIMEFRAMES.map((tf) => (
              <Button
                key={tf.value}
                variant={selectedTimeframe === tf.value ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTimeframeChange(tf.value)}
                className={`text-xs ${
                  selectedTimeframe === tf.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tf.label}
              </Button>
            ))}
          </div>
          {/* Percentage Change */}
          <div className="mt-2">
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                isPositive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? "+" : ""}
              {priceChange.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="px-6 py-4 grid grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Previous Close</span>
              <span className="text-sm font-medium">
                {formatCurrency(chartData.metadata?.previous_close || currentPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Open</span>
              <span className="text-sm font-medium">
                {formatCurrency(chartData.metadata?.open || currentPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Volume</span>
              <span className="text-sm font-medium">
                {formatNumber(chartData.metadata?.volume || 0)}
              </span>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Day&apos;s Range</span>
              <span className="text-sm font-medium">
                {formatCurrency(chartData.metadata?.day_low || currentPrice)} -{" "}
                {formatCurrency(chartData.metadata?.day_high || currentPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">52 Week Range</span>
              <span className="text-sm font-medium">
                {formatCurrency(chartData.metadata?.low_52w || currentPrice)} -{" "}
                {formatCurrency(chartData.metadata?.high_52w || currentPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg. Volume</span>
              <span className="text-sm font-medium">
                {formatNumber(chartData.metadata?.avg_volume || chartData.metadata?.volume || 0)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
