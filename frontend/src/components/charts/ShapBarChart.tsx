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

interface ShapBarChartProps {
  symbol: string;
  featureImportances: FeatureAttribution[];
  prediction: number;
}

export function ShapBarChart({ symbol, featureImportances, prediction }: ShapBarChartProps) {
  // Sort by absolute importance and include sign
  const data = featureImportances
    .map((f) => ({
      name: f.name,
      importance: f.importance,
      absImportance: Math.abs(f.importance),
    }))
    .sort((a, b) => b.absImportance - a.absImportance);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Feature Importance</CardTitle>
        <CardDescription>
          Absolute feature contributions for the latest prediction on {symbol.toUpperCase()} (₹
          {prediction.toFixed(2)})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-900 dark:text-amber-200">
            <strong>Understanding Feature Importance:</strong> This shows which features (Close price, Moving Averages, Volatility) 
            had the most impact on the prediction. 
            <strong className="block mt-1">Longer bars = More important features.</strong> 
            Green bars indicate positive impact (pushing price up), red bars indicate negative impact (pushing price down). 
            Features are sorted by absolute importance, so the most influential factors appear at the top.
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
                formatter={(value: number, name: string, props: any) => {
                  const sign = props.payload.importance >= 0 ? "+" : "";
                  return [
                    `${sign}${value.toFixed(4)}`,
                    props.payload.importance >= 0 ? "Positive Impact" : "Negative Impact",
                  ];
                }}
                labelStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="absImportance" radius={[4, 4, 4, 4]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.importance >= 0 ? "#22c55e" : "#ef4444"}
                  />
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

