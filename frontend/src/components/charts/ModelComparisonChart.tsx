"use client";

import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ModelComparisonData {
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
}

interface ModelComparisonChartProps {
  symbol: string;
  comparisonData: ModelComparisonData | null;
  loading: boolean;
  className?: string;
}

export function ModelComparisonChart({
  symbol,
  comparisonData,
  loading,
  className,
}: ModelComparisonChartProps) {
  const [activeTab, setActiveTab] = useState<"error" | "accuracy">("error");

  if (loading || !comparisonData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Model Performance Comparison</CardTitle>
          <CardDescription>Loading comparison data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate average errors for each model
  const modelErrors: Record<string, number> = {};
  const modelAccuracies: Record<string, number> = {};

  Object.keys(comparisonData.errors).forEach((model) => {
    const errors = comparisonData.errors[model as keyof typeof comparisonData.errors] as number[];
    if (errors && errors.length > 0) {
      const validErrors = errors.filter((e) => e !== null && !isNaN(e));
      if (validErrors.length > 0) {
        const avgError = validErrors.reduce((a, b) => a + b, 0) / validErrors.length;
        modelErrors[model] = avgError;
        // Accuracy = 100 - average percentage error
        modelAccuracies[model] = Math.max(0, 100 - avgError);
      }
    }
  });

  const errorChartData = {
    labels: Object.keys(modelErrors).map((m) => m.toUpperCase().replace("_", " ")),
    datasets: [
      {
        label: "Average Error (%)",
        data: Object.values(modelErrors),
        backgroundColor: [
          "rgba(249, 115, 22, 0.7)", // Orange for LSTM
          "rgba(34, 197, 94, 0.7)", // Green for GRU
          "rgba(239, 68, 68, 0.7)", // Red for Attention LSTM
        ],
        borderColor: [
          "rgba(249, 115, 22, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const accuracyChartData = {
    labels: Object.keys(modelAccuracies).map((m) => m.toUpperCase().replace("_", " ")),
    datasets: [
      {
        label: "Accuracy (%)",
        data: Object.values(modelAccuracies),
        backgroundColor: [
          "rgba(34, 197, 94, 0.7)", // Green
          "rgba(34, 197, 94, 0.7)",
          "rgba(34, 197, 94, 0.7)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(34, 197, 94, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: function (context: any) {
            if (activeTab === "error") {
              return `Average Error: ${context.parsed.y.toFixed(2)}%`;
            } else {
              return `Accuracy: ${context.parsed.y.toFixed(2)}%`;
            }
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: activeTab === "error" ? "Error (%)" : "Accuracy (%)",
          font: {
            size: 12,
            weight: "bold" as const,
          },
        },
        ticks: {
          callback: function (value: any) {
            return `${value.toFixed(1)}%`;
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Model Performance Comparison</CardTitle>
        <CardDescription>
          Compare prediction accuracy and errors across all models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "error" | "accuracy")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="error">Average Error</TabsTrigger>
            <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
          </TabsList>
          <TabsContent value="error" className="mt-4">
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Understanding Error %:</strong> This shows the average percentage error between predicted and actual prices. 
                <strong className="block mt-1">Lower error % = More accurate model.</strong> 
                A model with 2% error means predictions are typically within 2% of actual prices.
              </p>
            </div>
            <div className="h-[300px]">
              <Bar data={errorChartData} options={chartOptions} />
            </div>
          </TabsContent>
          <TabsContent value="accuracy" className="mt-4">
            <div className="mb-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-900 dark:text-green-200">
                <strong>Understanding Accuracy %:</strong> This represents how accurate each model's predictions are. 
                <strong className="block mt-1">Higher accuracy % = Better model performance.</strong> 
                Accuracy is calculated as 100% minus the average error percentage. Models with accuracy above 80% are considered highly reliable.
              </p>
            </div>
            <div className="h-[300px]">
              <Bar data={accuracyChartData} options={chartOptions} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
