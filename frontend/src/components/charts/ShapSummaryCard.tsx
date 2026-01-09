"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface FeatureAttribution {
  name: string;
  importance: number;
}

interface ShapSummaryCardProps {
  symbol: string;
  featureImportances: FeatureAttribution[];
  baseValue: number;
  prediction: number;
}

export function ShapSummaryCard({
  symbol,
  featureImportances,
  baseValue,
  prediction,
}: ShapSummaryCardProps) {
  // Calculate total positive and negative contributions
  const totalPositive = featureImportances
    .filter((f) => f.importance >= 0)
    .reduce((sum, f) => sum + f.importance, 0);
  const totalNegative = featureImportances
    .filter((f) => f.importance < 0)
    .reduce((sum, f) => sum + f.importance, 0);
  const netContribution = totalPositive + totalNegative;
  const change = prediction - baseValue;

  // Top contributing features
  const topFeatures = [...featureImportances]
    .sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance))
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>SHAP Explanation Summary</CardTitle>
        <CardDescription>
          How features contributed to the prediction for {symbol.toUpperCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <strong>What is SHAP?</strong> SHAP (SHapley Additive exPlanations) explains how each feature contributed to the prediction. 
            The <strong>Base Value</strong> is the model's average prediction. 
            <strong className="block mt-1">Net Feature Contribution</strong> shows how much features moved the prediction from the base. 
            Positive contributions increase the price prediction, negative contributions decrease it. 
            This helps you understand which market factors (price trends, volatility, moving averages) influenced the AI's forecast.
          </p>
        </div>
        {/* Base Value and Prediction */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Base Value</p>
            <p className="text-2xl font-bold">₹{baseValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Prediction</p>
            <p className="text-2xl font-bold text-blue-600">
              ₹{prediction.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Net Contribution */}
        <div className="space-y-1 border-t pt-4">
          <p className="text-sm text-muted-foreground">Net Feature Contribution</p>
          <div className="flex items-center gap-2">
            {change >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <p className={`text-xl font-semibold ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
              {change >= 0 ? "+" : ""}₹{change.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Contribution Breakdown */}
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Positive Contributions</p>
            <p className="text-lg font-semibold text-green-600">
              +{totalPositive.toFixed(4)}
            </p>
            <p className="text-xs text-muted-foreground">(relative impact)</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Negative Contributions</p>
            <p className="text-lg font-semibold text-red-600">
              {totalNegative.toFixed(4)}
            </p>
            <p className="text-xs text-muted-foreground">(relative impact)</p>
          </div>
        </div>

        {/* Top Features */}
        <div className="space-y-2 border-t pt-4">
          <p className="text-sm font-medium">Top Contributing Features</p>
          <div className="space-y-2">
            {topFeatures.map((feature, idx) => (
              <div key={feature.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {feature.importance >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">{feature.name}</span>
                </div>
                <span
                  className={`font-semibold ${
                    feature.importance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {feature.importance >= 0 ? "+" : ""}
                  {feature.importance.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
