"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap, Loader2, AlertCircle } from "lucide-react";

export default function Billing() {
  const [currentUsage, setCurrentUsage] = useState({
    apiCalls: 0,
    apiLimit: 1000,
    mlPredictions: 0,
    mlLimit: 5,
    dataExports: 0,
    dataLimit: 0
  });
  const [loading, setLoading] = useState(true);

  // Simulate fetching usage data
  useEffect(() => {
    const fetchUsageData = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - in real app this would come from backend
        setCurrentUsage({
          apiCalls: Math.floor(Math.random() * 800) + 200, // Random between 200-1000
          apiLimit: 1000,
          mlPredictions: Math.floor(Math.random() * 3) + 1, // Random between 1-3
          mlLimit: 5,
          dataExports: 0,
          dataLimit: 0
        });
      } catch (error) {
        console.error('Failed to fetch usage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, []);

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (current: number, limit: number) => {
    const percentage = getUsagePercentage(current, limit);
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "month",
      description: "Perfect for getting started",
      features: [
        "1,000 API calls per day",
        "Basic stock data",
        "Community access",
        "Email support"
      ],
      popular: false,
      current: true
    },
    {
      name: "Pro",
      price: "$29",
      period: "month",
      description: "For active traders and investors",
      features: [
        "100,000 API calls per day",
        "Real-time market data",
        "Advanced technical indicators",
        "ML predictions (5 per day)",
        "Priority support",
        "Data exports"
      ],
      popular: true,
      current: false
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "month",
      description: "For professional teams and institutions",
      features: [
        "Unlimited API calls",
        "All data sources",
        "Unlimited ML predictions",
        "Custom indicators",
        "White-label solutions",
        "Dedicated support",
        "SLA guarantees"
      ],
      popular: false,
      current: false
    }
  ];



  const billingHistory = [
    {
      id: 1,
      date: "2024-01-15",
      description: "Pro Plan - Monthly",
      amount: 29.00,
      status: "Paid"
    },
    {
      id: 2,
      date: "2023-12-15",
      description: "Pro Plan - Monthly",
      amount: 29.00,
      status: "Paid"
    },
    {
      id: 3,
      date: "2023-11-15",
      description: "Pro Plan - Monthly",
      amount: 29.00,
      status: "Paid"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>
        <Button variant="outline">
          <Zap className="mr-2 h-4 w-4" />
          Upgrade Plan
        </Button>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are currently on the Free plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Free Plan</h3>
                <p className="text-muted-foreground">$0/month</p>
              </div>
            </div>
            <Button>
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{currentUsage.apiCalls.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  of {currentUsage.apiLimit.toLocaleString()} daily limit
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(currentUsage.apiCalls, currentUsage.apiLimit)}`}
                    style={{ width: `${getUsagePercentage(currentUsage.apiCalls, currentUsage.apiLimit)}%` }}
                  ></div>
                </div>
                {getUsagePercentage(currentUsage.apiCalls, currentUsage.apiLimit) >= 90 && (
                  <div className="flex items-center space-x-1 mt-2 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>Near limit</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Predictions</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{currentUsage.mlPredictions}</div>
                <p className="text-xs text-muted-foreground">
                  of {currentUsage.mlLimit} daily limit
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(currentUsage.mlPredictions, currentUsage.mlLimit)}`}
                    style={{ width: `${getUsagePercentage(currentUsage.mlPredictions, currentUsage.mlLimit)}%` }}
                  ></div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Exports</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{currentUsage.dataExports}</div>
                <p className="text-xs text-muted-foreground">
                  {currentUsage.dataLimit === 0 ? 'Not available' : `of ${currentUsage.dataLimit} monthly limit`}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-gray-400 h-2 rounded-full w-0"></div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'border-2 border-blue-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    <Crown className="mr-1 h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.current ? 'bg-gray-500' : ''}`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : plan.name === 'Free' ? 'Get Started' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Your recent invoices and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">{item.description}</div>
                    <div className="text-sm text-muted-foreground">{item.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${item.amount.toFixed(2)}</div>
                  <Badge variant="secondary">{item.status}</Badge>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Button variant="outline">
              Download All Invoices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Zap className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium">No payment method added</h3>
                <p className="text-muted-foreground">Add a payment method to upgrade your plan</p>
              </div>
            </div>
            <Button variant="outline">
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
