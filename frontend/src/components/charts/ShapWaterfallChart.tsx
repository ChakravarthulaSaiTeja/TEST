"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface FeatureAttribution {
  name: string;
  importance: number;
}

interface ShapWaterfallChartProps {
  symbol: string;
  featureImportances: FeatureAttribution[];
  baseValue: number;
  prediction: number;
}

export function ShapWaterfallChart({
  symbol,
  featureImportances,
  baseValue,
  prediction,
}: ShapWaterfallChartProps) {
  // Calculate total contribution needed
  const totalContribution = prediction - baseValue;
  
  // Calculate sum of absolute importances for scaling
  const totalAbsImportance = featureImportances.reduce(
    (sum, f) => sum + Math.abs(f.importance),
    0
  );

  // Scale feature contributions to price space
  // Each feature's contribution is proportional to its importance
  const sortedFeatures = [...featureImportances].sort(
    (a, b) => Math.abs(b.importance) - Math.abs(a.importance)
  );

  // Build waterfall data with proper positioning
  const waterfallData: any[] = [];
  let cumulative = baseValue;

  // Start with base value
  waterfallData.push({
    name: "Base Value",
    start: 0,
    end: baseValue,
    value: baseValue,
    type: "base",
  });

  // Add each feature contribution (scaled to price space)
  sortedFeatures.forEach((feature) => {
    // Scale the importance to price space proportionally
    const scaledContribution = totalAbsImportance > 0
      ? (feature.importance / totalAbsImportance) * totalContribution
      : 0;
    
    const start = cumulative;
    cumulative += scaledContribution;
    const end = cumulative;
    waterfallData.push({
      name: feature.name,
      start: start,
      end: end,
      value: scaledContribution,
      type: feature.importance >= 0 ? "positive" : "negative",
    });
  });

  // Final prediction (small adjustment if needed due to rounding)
  const adjustment = prediction - cumulative;
  if (Math.abs(adjustment) > 0.01) {
    waterfallData.push({
      name: "Prediction",
      start: cumulative,
      end: prediction,
      value: adjustment,
      type: "prediction",
    });
  } else {
    // If adjustment is tiny, just update the last feature to reach prediction
    if (waterfallData.length > 1) {
      const lastFeature = waterfallData[waterfallData.length - 1];
      lastFeature.end = prediction;
      lastFeature.value += adjustment;
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case "base":
        return "#6b7280"; // Gray
      case "positive":
        return "#22c55e"; // Green
      case "negative":
        return "#ef4444"; // Red
      case "prediction":
        return "#3b82f6"; // Blue
      default:
        return "#8b5cf6";
    }
  };

  // Transform data for stacked bar chart
  const chartData = waterfallData.map((entry, index) => {
    if (index === 0) {
      // Base value starts at 0
      return {
        name: entry.name,
        base: 0,
        contribution: entry.value,
        cumulative: entry.end,
        type: entry.type,
        value: entry.value,
      };
    } else {
      // Each subsequent bar starts from previous cumulative
      const prevCumulative = waterfallData[index - 1].end;
      return {
        name: entry.name,
        base: prevCumulative,
        contribution: entry.value,
        cumulative: entry.end,
        type: entry.type,
        value: entry.value,
      };
    }
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>SHAP Waterfall Chart</CardTitle>
        <CardDescription>
          How each feature contributes to the final prediction for {symbol.toUpperCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <p className="text-sm text-indigo-900 dark:text-indigo-200">
            <strong>Understanding the Waterfall:</strong> This chart shows the step-by-step journey from the base value (average prediction) 
            to the final prediction. 
            <strong className="block mt-1">Each bar shows how a feature moves the prediction up (green) or down (red).</strong> 
            Start from the gray "Base Value" bar, then see how each feature (Close, MA_20, MA_50, Volatility) adds or subtracts value. 
            The final blue bar is the predicted price. This helps you understand exactly which factors drove the prediction.
          </p>
        </div>
        <div className="h-96">
        {featureImportances.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No explainability data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                label={{ value: "Price (₹)", angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
              />
              <Tooltip
                formatter={(value: number, name: string, props: any) => {
                  const entry = props.payload;
                  if (entry.type === "base") {
                    return [`₹${entry.cumulative.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, "Base Value"];
                  } else if (entry.type === "prediction") {
                    return [`₹${entry.cumulative.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, "Final Prediction"];
                  } else {
                    const change = entry.value >= 0 ? "+" : "";
                    return [
                      `${change}₹${Math.abs(entry.value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
                      `Contribution (from ₹${entry.base.toLocaleString("en-IN", { maximumFractionDigits: 2 })} to ₹${entry.cumulative.toLocaleString("en-IN", { maximumFractionDigits: 2 })})`,
                    ];
                  }
                }}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ fontSize: 12 }}
              />
              {/* Base layer - invisible bars to position correctly */}
              <Bar dataKey="base" stackId="waterfall" fill="transparent" />
              {/* Contribution bars */}
              <Bar dataKey="contribution" stackId="waterfall" radius={[0, 0, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.type)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        </div>
      </CardContent>
    </Card>
  );
}
