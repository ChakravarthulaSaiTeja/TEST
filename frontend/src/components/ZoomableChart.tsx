"use client";

import React, { useRef, useState, useCallback } from "react";
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
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

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

// Debounce helper for zoom events
const debounce = <T extends unknown[]>(fn: (...args: T) => void, delay = 600) => {
  let timer: NodeJS.Timeout;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export default function ZoomableChart() {
  const chartRef = useRef<ChartJS<'line'> | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZooming, setIsZooming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock financial data (replace with real API data)
  const chartData = {
    labels: Array.from({ length: 100 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (99 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: "Stock Price",
        data: Array.from({ length: 100 }, (_, i) => {
          // Simulate realistic stock price movement
          const basePrice = 150;
          const trend = i * 0.5; // Upward trend
          const volatility = Math.sin(i / 10) * 8; // Price fluctuations
          return basePrice + trend + volatility;
        }),
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

  // Simulate data fetching (replace with real API calls)
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

  // Debounced zoom handler
  const handleZoomComplete = debounce(({ chart }: { chart: ChartJS<'line'> }) => {
    const zoom = chart.getZoomLevel();
    setZoomLevel(zoom);
    setIsZooming(false);

    console.log(`Zoom complete: level ${zoom}`);
    
    // Fetch more granular data if zoomed in significantly
    if (zoom > 2) {
      fetchChartData("1mo", "1h");
    }
  }, 600);

  // Chart options with zoom configuration
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
          label: (ctx: TooltipItem<'line'>) => `Price: $${ctx.parsed.y.toFixed(2)}`,
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
        onZoom: ({ chart }: { chart: ChartJS<'line'> }) => {
          const zoom = chart.getZoomLevel();
          setZoomLevel(zoom);
          setIsZooming(true);
          console.log(`Zooming: level ${zoom}`);
        },
        onZoomComplete: handleZoomComplete,
        onPan: () => {
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
          callback: (val: string | number) => `$${Number(val).toFixed(2)}`,
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

  return (
    <div className="p-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Interactive Stock Chart</h2>
          <p className="text-gray-400 text-sm">Smooth zoom and pan with real-time data</p>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => chartRef.current?.zoom(1.2)}
            className="h-9 w-9 p-0 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => chartRef.current?.zoom(0.8)}
            className="h-9 w-9 p-0 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => chartRef.current?.resetZoom()}
            className="h-9 w-9 p-0 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
            title="Reset Zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chart Info */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center space-x-4 text-gray-400">
          <span>Zoom: {zoomLevel.toFixed(1)}x</span>
          <span>•</span>
          <span>Data Points: {chartData.labels.length}</span>
        </div>
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Loading data...</span>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="h-96 bg-gray-950 rounded-xl p-4 border border-gray-800">
        <Line 
          ref={chartRef} 
          data={chartData} 
          options={chartOptions}
        />
      </div>

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Use mouse wheel to zoom • Drag to pan • Ctrl + drag for precise panning</p>
      </div>
    </div>
  );
}
