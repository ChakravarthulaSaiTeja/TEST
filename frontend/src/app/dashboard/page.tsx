'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Activity,
  Brain,
  MessageCircle,
  Wallet
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Position {
  symbol: string;
  qty: number;
  avgPrice: number;
  marketValue: number;
  unrealizedPnL: number;
}

interface Balance {
  cash: number;
  buyingPower: number;
  totalValue: number;
  currency: string;
}

export default function Dashboard() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      // Fetch positions and balance from MCP client
      const [positionsRes, balanceRes] = await Promise.all([
        fetch('/api/tools/broker/positions'),
        fetch('/api/tools/broker/balance'),
      ]);

      if (positionsRes.ok) {
        const positionsData = await positionsRes.json();
        setPositions(positionsData.positions || []);
      }

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData.balance || null);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPortfolioValue = balance?.totalValue || 125000;
  const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
  const todayChange = totalUnrealizedPnL * 0.1; // Simulated daily change

  return (
    <div className="space-y-6">
      {/* Header with Theme Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your portfolio today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/chat">
            <Button className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Chat with AI Trader</span>
            </Button>
          </Link>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Theme:</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalPortfolioValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance ? (
                <span className={balance.totalValue > 100000 ? "text-green-600" : "text-red-600"}>
                  {balance.totalValue > 100000 ? "+" : ""}${(balance.totalValue - 100000).toLocaleString()}
                </span>
              ) : (
                <span className="text-green-600">+$2,500</span>
              )} from initial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Gain/Loss</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${todayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {todayChange >= 0 ? '+' : ''}${todayChange.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((todayChange / totalPortfolioValue) * 100).toFixed(2)}% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-muted-foreground">
              {positions.filter(p => p.unrealizedPnL > 0).length} profitable, {positions.filter(p => p.unrealizedPnL < 0).length} at loss
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Predictions</CardTitle>
            <Brain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              Accuracy rate this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Positions */}
      {positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <span>Portfolio Positions</span>
            </CardTitle>
            <CardDescription>
              Your current stock positions and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Symbol</th>
                    <th className="text-right p-2">Quantity</th>
                    <th className="text-right p-2">Avg Price</th>
                    <th className="text-right p-2">Market Value</th>
                    <th className="text-right p-2">Unrealized P&L</th>
                    <th className="text-right p-2">% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-medium">{position.symbol}</td>
                      <td className="p-2 text-right">{position.qty}</td>
                      <td className="p-2 text-right">${position.avgPrice.toFixed(2)}</td>
                      <td className="p-2 text-right">${position.marketValue.toFixed(2)}</td>
                      <td className={`p-2 text-right ${position.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${position.unrealizedPnL.toFixed(2)}
                      </td>
                      <td className={`p-2 text-right ${position.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {((position.unrealizedPnL / (position.avgPrice * position.qty)) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>AI Trading Assistant</CardTitle>
            <CardDescription>
              Chat with Forecaster AI for analysis and trading
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/chat">
              <Button className="w-full justify-start">
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat with AI Trader
              </Button>
            </Link>
            <Link href="/chat?mode=trade">
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Place Trade Order
              </Button>
            </Link>
            <Link href="/chat?mode=analysis">
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Get Stock Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
            <CardDescription>
              Key market indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">S&P 500</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">4,567.89</span>
                <Badge variant="secondary" className="text-green-600">+0.8%</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">NASDAQ</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">14,234.56</span>
                <Badge variant="secondary" className="text-green-600">+1.2%</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">DOW</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">34,567.89</span>
                <Badge variant="secondary" className="text-red-600">-0.3%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/50">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Bought AAPL</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900/50">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sold TSLA</p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/50">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">AI Prediction</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
