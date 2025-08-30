"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from "chart.js";
import { CandlestickController, CandlestickElement, OhlcElement } from "chartjs-chart-financial";
import { Line } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Activity, Maximize2, Minimize2, Palette, Clock, Sun, Moon, Monitor, ZoomIn, ZoomOut, RotateCcw, BarChart3, TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import zoomPlugin from 'chartjs-plugin-zoom';

// Register Chart.js components
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
  zoomPlugin,
  CandlestickController,
  CandlestickElement,
  OhlcElement
);

interface StockChartProps {
  symbol: string;
  className?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
    pointBackgroundColor: string[];
    pointBorderColor: string[];
  }[];
}

interface ChartDataItem {
  date?: string;
  Date?: string;
  close?: number;
  Close?: number;
}

const timeframes = [
  { value: "1d", label: "1 Day", interval: "5m" },
  { value: "5d", label: "5 Days", interval: "15m" },
  { value: "1mo", label: "1 Month", interval: "1d" },
  { value: "3mo", label: "3 Months", interval: "1d" },
  { value: "6mo", label: "6 Months", interval: "1d" },
  { value: "1y", label: "1 Year", interval: "1d" },
  { value: "max", label: "Max (All Time)", interval: "1d" },
];

export default function StockChart({ symbol, className }: StockChartProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1mo");
  const [currentInterval, setCurrentInterval] = useState("1d");
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZooming, setIsZooming] = useState(false);
  const [candlestickChart, setCandlestickChart] = useState<ChartJS | null>(null);

  const [isMaximized, setIsMaximized] = useState(false);
  const [showColorTheme, setShowColorTheme] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chartRef = useRef<any>(null);
  const lineChartRef = useRef<any>(null);
  
  const { theme, setTheme } = useTheme();

  // Create candlestick chart when data changes
  useEffect(() => {
    if (chartType === "candlestick" && chartData && chartRef.current) {
      // Destroy existing chart if it exists
      if (candlestickChart) {
        candlestickChart.destroy();
        setCandlestickChart(null);
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Convert line chart data to candlestick format
        const candlestickData = {
          labels: chartData.labels,
          datasets: [{
            label: `${symbol} OHLC`,
            data: chartData.datasets[0].data.map((price, index) => ({
              x: index, // Use numeric index for x-axis
              o: price * 0.99, // Simulate open price
              h: price * 1.02, // Simulate high price
              l: price * 0.98, // Simulate low price
              c: price,         // Close price from line data
            })),
            type: 'candlestick' as const,
          }],
        };

        // Create candlestick-specific chart options
        const candlestickOptions = {
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
                padding: 20,
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
                title: (ctx: any) => `Date: ${chartData.labels[ctx.dataIndex] || `Point ${ctx.dataIndex + 1}`}`,
                label: (ctx: any) => {
                  const data = ctx.raw;
                  return [
                    `Open: $${data.o.toFixed(2)}`,
                    `High: $${data.h.toFixed(2)}`,
                    `Low: $${data.l.toFixed(2)}`,
                    `Close: $${data.c.toFixed(2)}`,
                  ];
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
              type: 'linear' as const,
              display: true,
              grid: { display: false },
              ticks: {
                color: "#9ca3af",
                maxTicksLimit: 8,
                maxRotation: 0,
                callback: (value: any) => {
                  const index = Math.floor(value);
                  return chartData.labels[index] || `Point ${index + 1}`;
                }
              },
              border: {
                color: 'rgba(156, 163, 175, 0.2)',
              },
            },
            y: {
              display: true,
              position: "right" as const,
              grid: { color: "rgba(156, 163, 175, 0.1)" },
              ticks: {
                color: "#9ca3af",
                callback: (val: any) => `$${val.toFixed(2)}`,
              },
              border: {
                color: 'rgba(156, 163, 175, 0.2)',
              },
            },
          },
        };

        const chart = new ChartJS(ctx, {
          type: 'candlestick',
          data: candlestickData,
          options: candlestickOptions,
        });
        
        setCandlestickChart(chart);
      }
    }
  }, [chartData, chartType, symbol]);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      if (candlestickChart) {
        candlestickChart.destroy();
      }
    };
  }, [candlestickChart]);

  // Function to determine interval based on zoom level and timeframe
  const getIntervalForZoom = (timeframe: string, zoom: number): string => {
    if (timeframe === "max") {
      if (zoom >= 8) return "1h";      // Very zoomed in: hourly
      if (zoom >= 4) return "1d";      // Moderately zoomed: daily
      if (zoom >= 2) return "1wk";     // Slightly zoomed: weekly
      return "1mo";                     // Default: monthly
    } else if (timeframe === "1y") {
      if (zoom >= 6) return "1h";      // Very zoomed: hourly
      if (zoom >= 3) return "1d";      // Moderately zoomed: daily
      if (zoom >= 2) return "1wk";     // Slightly zoomed: weekly
      return "1mo";                     // Default: monthly
    } else if (timeframe === "6mo") {
      if (zoom >= 5) return "1h";      // Very zoomed: hourly
      if (zoom >= 2.5) return "1d";    // Moderately zoomed: daily
      return "1wk";                     // Default: weekly
    } else if (timeframe === "3mo") {
      if (zoom >= 4) return "1h";      // Very zoomed: hourly
      if (zoom >= 2) return "1d";      // Moderately zoomed: daily
      return "1wk";                     // Default: weekly
    } else if (timeframe === "1mo") {
      if (zoom >= 3) return "1h";      // Very zoomed: hourly
      if (zoom >= 1.5) return "1d";    // Moderately zoomed: daily
      return "1d";                      // Default: daily
    } else if (timeframe === "5d") {
      if (zoom >= 2.5) return "1h";    // Very zoomed: hourly
      return "1d";                      // Default: daily
    } else if (timeframe === "1d") {
      if (zoom >= 2) return "5m";      // Very zoomed: 5-minute
      return "15m";                     // Default: 15-minute
    }
    return "1d"; // Fallback
  };

  const fetchChartData = useCallback(async (timeframe: string, interval?: string) => {
    // Don't fetch if currently zooming
    if (isZooming) {
      console.log('Skipping data fetch - currently zooming');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // For max timeframe, use max to get full lifetime data
      const period = timeframe === "max" ? "max" : timeframe;
      const dataInterval = interval || getIntervalForZoom(timeframe, zoomLevel);
      
      const response = await fetch(`http://localhost:8000/api/v1/stocks/${symbol}/history?period=${period}&interval=${dataInterval}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Format dates to show only the date part (MM/DD format)
        const labels = data.map((item: ChartDataItem) => {
          const dateStr = item.date || item.Date || '';
          if (dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
          }
          return '';
        });
        
        const prices = data.map((item: ChartDataItem) => item.close || item.Close || 0);
        


        // Create color arrays for each data point based on performance
        const pointColors = prices.map((price: number, index: number) => {
          if (index === 0) return '#6b7280'; // Neutral color for first point
          
          const previousPrice = prices[index - 1];
          const isPointPositive = price >= previousPrice;
          
          return isPointPositive ? '#10b981' : '#ef4444'; // Green or Red
        });

        // Create color arrays for point borders
        const pointBorderColors = pointColors.map((color: string) => color);

        // Use a gradient background that shows both green and red themes
        const chartData: ChartData = {
          labels,
          datasets: [
            {
              label: `${symbol} Price`,
              data: prices,
              borderColor: '#3b82f6', // Blue line for overall trend
              backgroundColor: showColorTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.1,
              pointBackgroundColor: showColorTheme ? pointColors : Array(prices.length).fill('#3b82f6'),
              pointBorderColor: showColorTheme ? pointBorderColors : Array(prices.length).fill('#3b82f6'),
            },
          ],
        };
        
        setChartData(chartData);
        setCurrentInterval(dataInterval);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      console.error('Chart data error:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol, showColorTheme, zoomLevel, isZooming]);

  const startRealTimeUpdates = useCallback(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Update every 30 seconds for real-time feel
    intervalRef.current = setInterval(() => {
      fetchChartData(selectedTimeframe);
    }, 30000);
  }, [fetchChartData, selectedTimeframe]);

  const stopRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchChartData(selectedTimeframe);
    startRealTimeUpdates();

    return () => {
      stopRealTimeUpdates();
    };
  }, [fetchChartData, startRealTimeUpdates, stopRealTimeUpdates, selectedTimeframe]);

  // Handle escape key to exit maximized view
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMaximized) {
        setIsMaximized(false);
      }
    };

    if (isMaximized) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when maximized
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMaximized]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          title: function(context: { label: string }[]) {
            return `Date: ${context[0]?.label || ''}`;
          },
          label: function(context: { parsed: { y: number } }) {
            return `Price: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x' as const,
        },
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x' as const,
        },
        onZoom: ({ chart }: { chart: any }) => {
          // Get current zoom level
          const zoom = chart.getZoomLevel();
          setZoomLevel(zoom);
          setIsZooming(true);
          
          console.log(`Zooming: level ${zoom}, current interval: ${currentInterval}`);
          
          // Don't fetch data during active zooming
          // We'll handle data fetching in onZoomComplete
        },
        onZoomComplete: ({ chart }: { chart: any }) => {
          // Final zoom level after zoom completes
          const zoom = chart.getZoomLevel();
          setZoomLevel(zoom);
          setIsZooming(false);
          
          console.log(`Zoom complete: level ${zoom}, current interval: ${currentInterval}`);
          
          // Fetch more granular data if needed after zoom completes
          if (zoom > 1.5) { // Lowered threshold for smoother transitions
            const newInterval = getIntervalForZoom(selectedTimeframe, zoom);
            console.log(`Checking interval change: ${currentInterval} -> ${newInterval}`);
            
            if (newInterval !== currentInterval) {
              console.log(`Fetching new data: ${newInterval} for zoom level ${zoom}`);
              fetchChartData(selectedTimeframe, newInterval);
            }
          }
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
          color: '#6b7280',
          maxTicksLimit: selectedTimeframe === "max" ? 12 : 8,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        display: true,
        position: 'right' as const,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          callback: function(tickValue: string | number) {
            const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
            return `$${value.toFixed(2)}`;
          },
        },
      },
    },
    elements: {
      point: {
        radius: showColorTheme ? 3 : 0,
        hoverRadius: 6,
        hoverBorderWidth: 2,
      },
    },
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const toggleColorTheme = () => {
    setShowColorTheme(!showColorTheme);
  };

  return (
    <>
      {isMaximized && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMaximized(false)}
        />
      )}
      <Card className={`${className} ${isMaximized ? 'fixed inset-4 z-50 bg-white shadow-2xl dark:bg-gray-900' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Live Price Chart</span>
              </CardTitle>
              <CardDescription>
                Real-time {symbol} price chart with interactive features
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((tf) => (
                    <SelectItem key={tf.value} value={tf.value}>
                      {tf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Chart Type Dropdown */}
              <Select value={chartType} onValueChange={(value: "line" | "candlestick") => setChartType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <span>Line</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="candlestick">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-green-400" />
                      <span>Candlestick</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleColorTheme}
                title={showColorTheme ? "Disable Color Theme" : "Enable Color Theme"}
                className={showColorTheme ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}
              >
                <Palette className="h-4 w-4" />
              </Button>
              {/* Theme toggle button - only show when maximized */}
              {isMaximized && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="h-8 px-3"
                  title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="h-4 w-4 mr-2" />
                      <span>Dark</span>
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4 mr-2" />
                      <span>Light</span>
                    </>
                  )}
                </Button>
              )}
              {/* Zoom Controls */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (chartType === "line" && lineChartRef.current) {
                      lineChartRef.current.zoom(1.2);
                    } else if (candlestickChart) {
                      candlestickChart.zoom(1.2);
                    }
                  }}
                  title="Zoom In"
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (chartType === "line" && lineChartRef.current) {
                      lineChartRef.current.zoom(0.8);
                    } else if (candlestickChart) {
                      candlestickChart.zoom(0.8);
                    }
                  }}
                  title="Zoom Out"
                  className="h-8 w-8 p-0"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (chartType === "line" && lineChartRef.current) {
                      lineChartRef.current.resetZoom();
                    } else if (candlestickChart) {
                      candlestickChart.resetZoom();
                    }
                  }}
                  title="Reset Zoom"
                  className="h-8 w-8 p-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                {/* Manual hourly data fetch for testing */}
                {currentInterval === "1d" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log("Manual fetch hourly data");
                      fetchChartData(selectedTimeframe, "1h");
                    }}
                    title="Fetch Hourly Data"
                    className="h-8 px-2 text-xs"
                  >
                    Hourly
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMaximize}
                title={isMaximized ? "Minimize" : "Maximize"}
              >
                {isMaximized ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className={`flex items-center justify-center ${isMaximized ? 'h-[80vh]' : 'h-96'}`}>
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading chart data...</span>
              </div>
            </div>
          ) : error ? (
            <div className={`flex items-center justify-center ${isMaximized ? 'h-[80vh]' : 'h-96'}`}>
              <div className="text-center">
                <p className="text-red-600 mb-2">{error}</p>
                <Button onClick={() => fetchChartData(selectedTimeframe)} variant="outline">
                  Retry
                </Button>
              </div>
            </div>
          ) : chartData ? (
            <div 
              className={isMaximized ? 'h-[80vh]' : 'h-96'}
              onWheel={(e) => {
                // Handle horizontal scrolling for touchpad
                if (e.deltaX !== 0) {
                  e.preventDefault();
                  if (chartRef.current) {
                    const chart = chartRef.current;
                    // Pan horizontally based on deltaX
                    const panAmount = e.deltaX * 0.5; // Adjust sensitivity
                    chart.pan({ x: -panAmount, y: 0 });
                  }
                }
              }}
            >
              {chartType === "line" ? (
                <Line data={chartData} options={chartOptions} ref={lineChartRef} />
              ) : (
                <div className="h-full">
                  <canvas ref={chartRef} />
                </div>
              )}
            </div>
          ) : (
            <div className={`flex items-center justify-center text-muted-foreground ${isMaximized ? 'h-[80vh]' : 'h-96'}`}>
              No chart data available
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              {showColorTheme && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Positive</span>
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Negative</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
            {/* Current interval display */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Chart: {chartType === "line" ? "Line" : "Candlestick"}</span>
              <span>| Data: {currentInterval}</span>
              {zoomLevel > 1 && <span>| Zoom: {zoomLevel.toFixed(1)}x</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
