"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  TooltipItem,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Line } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, BarChart3, TrendingUp, Loader2, RefreshCw } from "lucide-react";

// Register Chart.js components and zoom plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  zoomPlugin
);

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

interface StockChartProps {
  symbol?: string;
  timeframe?: string;
  className?: string;
}

export default function StockChart({ symbol = "AAPL", timeframe = "1mo", className }: StockChartProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const chartRef = useRef<ChartJS<'line'> | null>(null);

  const fetchChartData = async (stockSymbol: string, period: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/stockHistory?symbol=${stockSymbol}&period=${period}&interval=1d`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setChartData(data);
    } catch (err) {
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

  const handleTimeframeChange = (newTimeframe: string) => {
    setSelectedTimeframe(newTimeframe);
  };

  const handleRefresh = () => {
    if (symbol) {
      fetchChartData(symbol, selectedTimeframe);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { 
      mode: "index" as const, 
      intersect: false 
    },
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: { 
          usePointStyle: true, 
          color: "#9ca3af",
          font: { size: 12 }
        },
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
            const value = ctx.parsed.y;
            const currency = symbol.includes('.NS') || symbol.includes('.BO') ? '₹' : '$';
            return `${ctx.dataset.label}: ${currency}${value.toFixed(2)}`;
          },
        },
      },
      zoom: {
        pan: { 
          enabled: true, 
          mode: "x" as const,
          modifierKey: 'ctrl' as const,
        },
        zoom: {
          wheel: { 
            enabled: true, 
            speed: 0.1 
          },
          pinch: { 
            enabled: true 
          },
          mode: "x" as const,
          drag: {
            enabled: true,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: '#3b82f6',
            borderWidth: 1,
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: { 
          display: false 
        },
        ticks: { 
          color: "#9ca3af", 
          maxTicksLimit: 8,
          maxRotation: 0,
        },
        border: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
      },
      y: {
        display: true,
        position: "right" as const,
        grid: { 
          color: "rgba(156, 163, 175, 0.1)" 
        },
        ticks: {
          color: "#9ca3af",
          callback: (val: string | number) => {
            const currency = symbol.includes('.NS') || symbol.includes('.BO') ? '₹' : '$';
            return `${currency}${Number(val).toFixed(2)}`;
          },
        },
        border: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
      },
    },
    elements: {
      point: { 
        radius: 0, 
        hoverRadius: 6,
        hoverBorderWidth: 2,
        hoverBorderColor: '#3b82f6',
      },
    },
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Stock Chart - {symbol}
          </CardTitle>
          <CardDescription>Loading real-time stock price data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
              <p className="text-muted-foreground">Fetching chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Stock Chart - {symbol}
          </CardTitle>
          <CardDescription>Error loading chart data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold mb-2 text-red-600">Chart Error</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Stock Chart - {symbol}
          </CardTitle>
          <CardDescription>No chart data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Data</h3>
              <p className="text-muted-foreground">No chart data available for this symbol</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Stock Chart - {chartData.symbol}
            </CardTitle>
            <CardDescription>
              Real-time stock price visualization
              {chartData.metadata && (
                <span className="ml-2">
                  • Current: {symbol.includes('.NS') || symbol.includes('.BO') ? '₹' : '$'}{chartData.metadata.current_price.toFixed(2)}
                  {chartData.metadata.price_change_percent !== 0 && (
                    <span className={`ml-1 ${chartData.metadata.price_change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({chartData.metadata.price_change_percent >= 0 ? '+' : ''}{chartData.metadata.price_change_percent.toFixed(2)}%)
                    </span>
                  )}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedTimeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1D</SelectItem>
                <SelectItem value="5d">5D</SelectItem>
                <SelectItem value="1mo">1M</SelectItem>
                <SelectItem value="3mo">3M</SelectItem>
                <SelectItem value="6mo">6M</SelectItem>
                <SelectItem value="1y">1Y</SelectItem>
                <SelectItem value="2y">2Y</SelectItem>
                <SelectItem value="5y">5Y</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <Line 
            ref={chartRef} 
            data={{
              labels: chartData.labels,
              datasets: chartData.datasets
            }} 
            options={chartOptions}
          />
        </div>
      </CardContent>
    </Card>
  );
}