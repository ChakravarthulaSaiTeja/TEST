"use client";

import React, { useState, useEffect } from "react";
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
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PredictionComparisonData {
  symbol: string;
  dates: string[];
  actual_prices: number[];
  predictions: {
    lstm?: number[];
    gru?: number[];
    attention_lstm?: number[];
  };
  errors: {
    lstm?: number[];
    gru?: number[];
    attention_lstm?: number[];
  };
  timestamp: string;
}

interface PredictionComparisonChartProps {
  symbol: string;
  className?: string;
}

export function PredictionComparisonChart({ symbol, className }: PredictionComparisonChartProps) {
  const [data, setData] = useState<PredictionComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(100);
  const [selectedModels, setSelectedModels] = useState<string[]>(["lstm", "gru", "attention_lstm"]);

  const fetchComparisonData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${apiUrl}/api/v1/predictions/${encodeURIComponent(symbol)}/prediction-comparison?days=${days}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch comparison data: ${response.statusText}`);
      }

      const comparisonData = await response.json();
      setData(comparisonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch comparison data");
      console.error("Error fetching comparison data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, days]);

  const chartData = React.useMemo(() => {
    if (!data) return null;

    const datasets: any[] = [
      {
        label: "Actual Prices",
        data: data.actual_prices,
        borderColor: "#3b82f6", // Blue
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 2,
      },
    ];

    // Add model predictions
    const modelColors: Record<string, string> = {
      lstm: "#f97316", // Orange
      gru: "#22c55e", // Green
      attention_lstm: "#ef4444", // Red
    };

    const modelNames: Record<string, string> = {
      lstm: "LSTM Predictions",
      gru: "GRU Predictions",
      attention_lstm: "Attention LSTM Predictions",
    };

    selectedModels.forEach((model) => {
      if (data.predictions[model as keyof typeof data.predictions]) {
        const predictions = data.predictions[model as keyof typeof data.predictions] as number[];
        // Filter out null values
        const validPredictions = predictions.filter((p) => p !== null && !isNaN(p));
        if (validPredictions.length > 0) {
          datasets.push({
            label: modelNames[model] || model.toUpperCase(),
            data: predictions,
            borderColor: modelColors[model] || "#8b5cf6",
            backgroundColor: "transparent",
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            borderWidth: 2,
            borderDash: model === "attention_lstm" ? [5, 5] : undefined,
          });
        }
      }
    });

    return {
      labels: data.dates,
      datasets,
    };
  }, [data, selectedModels]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: "Stock Price Predictions vs Actual Prices",
        font: {
          size: 16,
          weight: "bold" as const,
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Time (Test Samples)",
          font: {
            size: 12,
            weight: "bold" as const,
          },
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          maxTicksLimit: 10,
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Stock Price (₹)",
          font: {
            size: 12,
            weight: "bold" as const,
          },
        },
        ticks: {
          callback: function (value: any) {
            return `₹${value.toLocaleString("en-IN")}`;
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Prediction Comparison</CardTitle>
          <CardDescription>Loading comparison data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Prediction Comparison</CardTitle>
          <CardDescription>Error loading comparison data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex flex-col items-center justify-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchComparisonData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !chartData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Prediction Comparison</CardTitle>
          <CardDescription>No comparison data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center">
            <p className="text-muted-foreground">No data to display</p>
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
            <CardTitle>Prediction Comparison</CardTitle>
            <CardDescription>
              Actual prices vs predictions from all models for {symbol.toUpperCase()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">Last 50 days</SelectItem>
                <SelectItem value="100">Last 100 days</SelectItem>
                <SelectItem value="200">Last 200 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchComparisonData} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-purple-900 dark:text-purple-200">
            <strong>Understanding This Chart:</strong> This compares actual stock prices (blue line) with predictions from different AI models. 
            <strong className="block mt-1">Closer the prediction lines are to the actual price line = Better the model.</strong> 
            The first ~71 days show only actual prices because models need 120 days of historical data before making predictions. 
            Use this to see which model (LSTM, GRU, or Attention LSTM) tracks actual prices most accurately.
          </p>
        </div>
        <div className="h-[500px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}
