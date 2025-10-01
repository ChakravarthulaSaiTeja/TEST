"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, BarChart3, TrendingUp } from "lucide-react";

interface StockChartProps {
  symbol?: string;
  timeframe?: string;
  className?: string;
}

export default function StockChart({ symbol = "AAPL", timeframe = "1D", className }: StockChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Stock Chart - {symbol}
            </CardTitle>
            <CardDescription>
              Real-time stock price visualization
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue={timeframe}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">1D</SelectItem>
                <SelectItem value="1W">1W</SelectItem>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="3M">3M</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 flex items-center justify-center bg-muted/20 rounded-lg">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Chart Coming Soon</h3>
            <p className="text-muted-foreground">
              Interactive stock chart will be available here
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}