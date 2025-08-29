"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  BarChart3, 
  Target, 
  Calendar,
  Activity,
  Zap
} from "lucide-react";

export default function Predictions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Predictions</h1>
        <p className="text-muted-foreground">
          AI-powered stock predictions and market insights.
        </p>
      </div>

      {/* Prediction Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.3%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              18 bullish, 6 bearish
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Confidence</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              High confidence signals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Update</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h</div>
            <p className="text-xs text-muted-foreground">
              Real-time updates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Models */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span>LSTM Neural Network</span>
            </CardTitle>
            <CardDescription>
              Time series prediction model
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accuracy</span>
                <span>89.2%</span>
              </div>
              <Progress value={89.2} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Confidence</span>
                <span>High</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Prophet Model</span>
            </CardTitle>
            <CardDescription>
              Facebook&apos;s forecasting tool
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accuracy</span>
                <span>85.7%</span>
              </div>
              <Progress value={85.7} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Confidence</span>
                <span>Medium</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span>XGBoost</span>
            </CardTitle>
            <CardDescription>
              Gradient boosting model
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accuracy</span>
                <span>91.1%</span>
              </div>
              <Progress value={91.1} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Confidence</span>
                <span>High</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Predictions</CardTitle>
          <CardDescription>
            Latest AI-generated stock predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center dark:bg-green-900/50">
                  <span className="text-lg font-bold text-green-600">AAPL</span>
                </div>
                <div>
                  <p className="font-medium">Apple Inc.</p>
                  <p className="text-sm text-muted-foreground">LSTM Model • 89.2% confidence</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">Bullish</p>
                <p className="text-sm text-muted-foreground">Target: $185.00</p>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                  +5.5% expected
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center dark:bg-red-900/50">
                  <span className="text-lg font-bold text-red-600">TSLA</span>
                </div>
                <div>
                  <p className="font-medium">Tesla, Inc.</p>
                  <p className="text-sm text-muted-foreground">XGBoost Model • 91.1% confidence</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-red-600">Bearish</p>
                <p className="text-sm text-muted-foreground">Target: $220.00</p>
                <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                  -10.4% expected
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center dark:bg-blue-900/50">
                  <span className="text-lg font-bold text-blue-600">NVDA</span>
                </div>
                <div>
                  <p className="font-medium">NVIDIA Corporation</p>
                  <p className="text-sm text-muted-foreground">Prophet Model • 85.7% confidence</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">Bullish</p>
                <p className="text-sm text-muted-foreground">Target: $500.00</p>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                  +9.5% expected
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate New Prediction */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Prediction</CardTitle>
          <CardDescription>
            Get AI-powered insights for any stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button className="flex-1">
              <Brain className="mr-2 h-4 w-4" />
              Run Full Analysis
            </Button>
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Quick Prediction
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
