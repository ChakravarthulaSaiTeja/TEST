"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
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
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { CandlestickController, CandlestickElement, OhlcElement } from "chartjs-chart-financial";
import { Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ZoomIn, ZoomOut, RotateCcw, BarChart3, TrendingUp } from "lucide-react";

// Register Chart.js components, zoom plugin, and financial chart elements
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

// Debounce helper for zoom events
const debounce = (fn: Function, delay = 600) => {
  let timer: any;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Timeframe options
const timeframes = [
  { value: "1D", label: "1 Day", period: "1d", interval: "5m" },
  { value: "5D", label: "5 Days", period: "5d", interval: "15m" },
  { value: "1M", label: "1 Month", period: "1mo", interval: "1d" },
  { value: "6M", label: "6 Months", period: "6mo", interval: "1d" },
  { value: "1Y", label: "1 Year", period: "1y", interval: "1d" },
  { value: "Max", label: "Max", period: "max", interval: "1d" },
];

// Define OHLC data type
interface OHLCDataPoint {
  x: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

// Generate mock OHLC data
const generateOHLCData = (period: string, interval: string): OHLCDataPoint[] => {
  const basePrice = 150;
  const volatility = 0.02;
  const trend = 0.001;
  
  let dataPoints = 100;
  let multiplier = 1;
  
  switch (period) {
    case "1d":
      dataPoints = 288; // 5-minute intervals in a day
      multiplier = 0.1;
      break;
    case "5d":
      dataPoints = 480; // 15-minute intervals in 5 days
      multiplier = 0.2;
      break;
    case "1mo":
      dataPoints = 30;
      multiplier = 1;
      break;
    case "6mo":
      dataPoints = 180;
      multiplier = 2;
      break;
    case "1y":
      dataPoints = 365;
      multiplier = 3;
      break;
    case "max":
      dataPoints = 1000;
      multiplier = 5;
      break;
    default:
      dataPoints = 100;
      multiplier = 1;
  }

  const data: OHLCDataPoint[] = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < dataPoints; i++) {
    const change = (Math.random() - 0.5) * volatility * multiplier;
    const trendChange = trend * multiplier;
    currentPrice = Math.max(10, currentPrice * (1 + change + trendChange));
    
    const high = currentPrice * (1 + Math.random() * 0.01);
    const low = currentPrice * (1 - Math.random() * 0.01);
    const open: number = i === 0 ? basePrice : data[i - 1].c;
    const close = currentPrice;
    const volume = Math.floor(Math.random() * 1000000) + 100000;
    
    data.push({
      x: i,
      o: open,
      h: high,
      l: low,
      c: close,
      v: volume,
    });
  }
  
  return data;
};

// Generate line chart data
const generateLineData = (period: string, interval: string) => {
  const ohlcData = generateOHLCData(period, interval);
  return {
    labels: ohlcData.map((_, i) => `Point ${i + 1}`),
    datasets: [
      {
        label: "Price",
        data: ohlcData.map(d => d.c),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        hoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };
};

// Generate candlestick chart data
const generateCandlestickData = (period: string, interval: string) => {
  const ohlcData = generateOHLCData(period, interval);
  return {
    labels: ohlcData.map((_, i) => `Point ${i + 1}`),
    datasets: [
      {
        label: "OHLC",
        data: ohlcData.map(d => ({
          x: d.x,
          o: d.o,
          h: d.h,
          l: d.l,
          c: d.c,
        })),
        type: 'candlestick' as const,
      },
    ],
  };
};

// Generate volume chart data
const generateVolumeData = (period: string, interval: string) => {
  const ohlcData = generateOHLCData(period, interval);
  return {
    labels: ohlcData.map((_, i) => `Point ${i + 1}`),
    datasets: [
      {
        label: "Volume",
        data: ohlcData.map(d => ({
          x: d.x,
          y: d.v,
          o: d.o,
          h: d.h,
          l: d.l,
          c: d.c,
        })),
        type: 'bar' as const,
        backgroundColor: ohlcData.map(d => d.c >= d.o ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'),
        borderColor: ohlcData.map(d => d.c >= d.o ? '#10b981' : '#ef4444'),
        borderWidth: 1,
      },
    ],
  };
};

export default function ZoomableChartWithVolume() {
  const lineChartRef = useRef<any>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const volumeChartRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZooming, setIsZooming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1M");
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");
  const [currentData, setCurrentData] = useState<any>(null);
  const [currentVolumeData, setCurrentVolumeData] = useState<any>(null);
  const [candlestickChart, setCandlestickChart] = useState<ChartJS | null>(null);
  const [volumeChart, setVolumeChart] = useState<ChartJS | null>(null);

  // Initialize data and charts
  useEffect(() => {
    const timeframe = timeframes.find(tf => tf.value === selectedTimeframe);
    if (timeframe) {
      if (chartType === "line") {
        setCurrentData(generateLineData(timeframe.period, timeframe.interval));
      } else {
        setCurrentData(generateCandlestickData(timeframe.period, timeframe.interval));
        setCurrentVolumeData(generateVolumeData(timeframe.period, timeframe.interval));
      }
    }
  }, [selectedTimeframe, chartType]);

  // Create candlestick chart when data changes
  useEffect(() => {
    if (chartType === "candlestick" && currentData && chartRef.current) {
      // Destroy existing chart if it exists
      if (candlestickChart) {
        candlestickChart.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const chart = new ChartJS(ctx, {
          type: 'candlestick',
          data: currentData,
          options: candlestickChartOptions,
        });
        
        setCandlestickChart(chart);
      }
    }
  }, [currentData, chartType, candlestickChart]);

  // Create volume chart when data changes
  useEffect(() => {
    if (chartType === "candlestick" && currentVolumeData && volumeChartRef.current) {
      // Destroy existing chart if it exists
      if (volumeChart) {
        volumeChart.destroy();
      }

      const ctx = volumeChartRef.current.getContext('2d');
      if (ctx) {
        const chart = new ChartJS(ctx, {
          type: 'bar',
          data: currentVolumeData,
          options: volumeChartOptions,
        });
        
        setVolumeChart(chart);
      }
    }
  }, [currentVolumeData, chartType, volumeChart]);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      if (candlestickChart) {
        candlestickChart.destroy();
      }
      if (volumeChart) {
        volumeChart.destroy();
      }
    };
  }, [candlestickChart, volumeChart]);

  // Simulate data fetching
  const fetchChartData = useCallback(
    async (timeframe: string, interval?: string) => {
      if (isZooming) {
        console.log("Skipping fetch during zoom");
        return;
      }
      
      try {
        setIsLoading(true);
        console.log(`Fetching new data for timeframe=${timeframe}, interval=${interval}`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log(`Successfully updated to ${interval || 'default'} data`);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [isZooming]
  );

  // Handle timeframe change
  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    setZoomLevel(1);
    if (candlestickChart) {
      candlestickChart.resetZoom();
    }
    if (volumeChart) {
      volumeChart.resetZoom();
    }
  };

  // Debounced zoom handler
  const handleZoomComplete = debounce(({ chart }: { chart: any }) => {
    const zoom = chart.getZoomLevel();
    setZoomLevel(zoom);
    setIsZooming(false);

    console.log(`Zoom complete: level ${zoom}`);
    
    // Fetch more granular data if zoomed in significantly
    if (zoom > 2) {
      const timeframe = timeframes.find(tf => tf.value === selectedTimeframe);
      if (timeframe) {
        fetchChartData(timeframe.period, "1h");
      }
    }
  }, 600);

  // Chart options for line chart
  const lineChartOptions = {
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
          title: (ctx: any) => `Point: ${ctx[0]?.label}`,
          label: (ctx: any) => `Price: $${ctx.parsed.y.toFixed(2)}`,
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
        onZoom: ({ chart }: { chart: any }) => {
          const zoom = chart.getZoomLevel();
          setZoomLevel(zoom);
          setIsZooming(true);
          console.log(`Zooming: level ${zoom}`);
        },
        onZoomComplete: handleZoomComplete,
        onPan: ({ chart }: { chart: any }) => {
          console.log('Panning chart');
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
          callback: (val: any) => `$${val.toFixed(2)}`,
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

  // Chart options for candlestick chart
  const candlestickChartOptions = {
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
          title: (ctx: any) => `Point: ${ctx[0]?.label}`,
          label: (ctx: any) => {
            const data = ctx.raw;
            return [
              `Open: $${data.o.toFixed(2)}`,
              `High: $${data.h.toFixed(2)}`,
              `Low: $${data.l.toFixed(2)}`,
              `Close: $${data.c.toFixed(2)}`,
              `Volume: ${data.v.toLocaleString()}`,
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
        onZoom: ({ chart }: { chart: any }) => {
          const zoom = chart.getZoomLevel();
          setZoomLevel(zoom);
          setIsZooming(true);
          console.log(`Zooming: level ${zoom}`);
        },
        onZoomComplete: handleZoomComplete,
        onPan: ({ chart }: { chart: any }) => {
          console.log('Panning chart');
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
          callback: (val: any) => `$${val.toFixed(2)}`,
        },
        border: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
      },
    },
  };

  // Volume chart options
  const volumeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { 
      mode: "index" as const, 
      intersect: false 
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
          title: (ctx: any) => `Point: ${ctx[0]?.label}`,
          label: (ctx: any) => `Volume: ${ctx.parsed.y.toLocaleString()}`,
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
        },
        onZoom: ({ chart }: { chart: any }) => {
          // Sync with main chart zoom
          if (candlestickChart) {
            const mainZoom = candlestickChart.getZoomLevel();
            chart.setZoomLevel(mainZoom);
          }
        },
        onPan: ({ chart }: { chart: any }) => {
          // Sync with main chart pan
          console.log('Volume chart panning');
        },
      },
    },
    scales: {
      x: {
        display: false,
        grid: { 
          display: false 
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
          callback: (val: any) => `${(val / 1000000).toFixed(1)}M`,
        },
        border: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
      },
    },
    elements: {
      bar: {
        backgroundColor: (ctx: any) => {
          const data = ctx.raw;
          return data.c >= data.o ? '#10b981' : '#ef4444';
        },
        borderColor: (ctx: any) => {
          const data = ctx.raw;
          return data.c >= data.o ? '#10b981' : '#ef4444';
        },
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="p-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800">
      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Professional Trading Chart</h2>
          <p className="text-gray-400 text-sm">Advanced candlestick and line charts with volume analysis</p>
        </div>
        
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
              if (volumeChart) {
                volumeChart.zoom(1.2);
              }
            }}
            className="h-8 w-8 p-0 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
            title="Zoom In"
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
              if (volumeChart) {
                volumeChart.zoom(0.8);
              }
            }}
            className="h-8 w-8 p-0 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
            title="Zoom Out"
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
              if (volumeChart) {
                volumeChart.resetZoom();
              }
              setZoomLevel(1);
            }}
            className="h-8 w-8 p-0 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
            title="Reset Zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          {/* Chart Type Toggle Button - Replacing Hourly button */}
          <Select value={chartType} onValueChange={(value: "line" | "candlestick") => {
            console.log('Chart type changed to:', value);
            setChartType(value);
          }}>
            <SelectTrigger className="h-8 px-3 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="line" className="hover:bg-gray-700">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span>Line</span>
                </div>
              </SelectItem>
              <SelectItem value="candlestick" className="hover:bg-gray-700">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-green-400" />
                  <span>Candle</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chart Info */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center space-x-4 text-gray-400">
          <span className="font-medium text-white">Chart Type: {chartType === "line" ? "Line" : "Candlestick"}</span>
          <span>•</span>
          <span>Timeframe: {selectedTimeframe}</span>
          <span>•</span>
          <span>Zoom: {zoomLevel.toFixed(1)}x</span>
        </div>
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Loading data...</span>
          </div>
        )}
      </div>

      {/* Main Chart */}
      <div className="h-96 bg-gray-950 rounded-xl p-4 border border-gray-800 mb-4">
        {chartType === "line" ? (
          <Line 
            ref={lineChartRef} 
            data={currentData} 
            options={lineChartOptions}
          />
        ) : (
          <div className="h-full">
            <canvas ref={chartRef} />
          </div>
        )}
      </div>

      {/* Volume Chart (only for candlestick view) */}
      {chartType === "candlestick" && currentVolumeData && (
        <div className="h-32 bg-gray-950 rounded-xl p-4 border border-gray-800">
          <canvas ref={volumeChartRef} />
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Use mouse wheel to zoom • Drag to pan • Ctrl + drag for precise panning • Chart type dropdown switches between Line and Candlestick views</p>
      </div>
    </div>
  );
}
