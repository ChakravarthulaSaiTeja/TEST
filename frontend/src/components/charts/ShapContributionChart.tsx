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
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface FeatureAttribution {
  name: string;
  importance: number;
}

interface ShapContributionChartProps {
  symbol: string;
  featureImportances: FeatureAttribution[];
  prediction: number;
}

export function ShapContributionChart({
  symbol,
  featureImportances,
  prediction,
}: ShapContributionChartProps) {
  // Separate positive and negative contributions
  const data = featureImportances.map((f) => ({
    name: f.name,
    positive: f.importance >= 0 ? f.importance : 0,
    negative: f.importance < 0 ? f.importance : 0,
    total: Math.abs(f.importance),
  }));

  // Sort by absolute importance
  data.sort((a, b) => b.total - a.total);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Feature Contribution Breakdown</CardTitle>
        <CardDescription>
          Positive and negative contributions of each feature to the prediction for{" "}
          {symbol.toUpperCase()} (₹{prediction.toFixed(2)})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-lg border border-teal-200 dark:border-teal-800">
          <p className="text-sm text-teal-900 dark:text-teal-200">
            <strong>Understanding Contributions:</strong> This stacked bar chart separates positive (green) and negative (red) 
            contributions from each feature. 
            <strong className="block mt-1">Green segments push the price up, red segments push it down.</strong> 
            The total height shows the absolute importance of each feature. 
            This view helps you see the net effect of each factor - whether it's bullish (more green) or bearish (more red) for the prediction.
          </p>
        </div>
        <div className="h-80">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No explainability data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 16, right: 24, left: 16, bottom: 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toFixed(4)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const formatted = value.toFixed(4);
                  return name === "positive"
                    ? [`+${formatted}`, "Positive Contribution"]
                    : name === "negative"
                    ? [formatted, "Negative Contribution"]
                    : [formatted, "Absolute Importance"];
                }}
                labelStyle={{ fontSize: 12 }}
              />
              <Legend
                formatter={(value) => {
                  if (value === "positive") return "Positive Impact";
                  if (value === "negative") return "Negative Impact";
                  return value;
                }}
              />
              <Bar dataKey="positive" stackId="a" fill="#22c55e" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-positive-${index}`} fill="#22c55e" />
                ))}
              </Bar>
              <Bar dataKey="negative" stackId="a" fill="#ef4444" radius={[4, 0, 0, 4]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-negative-${index}`} fill="#ef4444" />
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
