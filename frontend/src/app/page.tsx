"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight, 
  BarChart3, 
  Brain, 
  TrendingUp, 
  Globe, 
  Shield, 
  Zap,
  CheckCircle2,
  User,
  Key,
  Copy
} from "lucide-react";
import Link from "next/link";
import ZoomableChartWithVolume from "@/components/ZoomableChartWithVolume";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 gradient-primary rounded-xl shadow-glow">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">Forecaster AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-foreground hover:text-primary transition-colors duration-200">Features</a>
              <a href="#pricing" className="text-foreground hover:text-primary transition-colors duration-200">Pricing</a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors duration-200">About</a>
              <Link href="/dashboard">
                <Button className="gradient-primary hover:shadow-glow transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5"></div>
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-6 gradient-primary text-white border-0 shadow-glow">
            🚀 AI-Powered Trading Intelligence
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Master the Markets with
            <span className="text-gradient"> AI Precision</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Leverage advanced machine learning algorithms to predict market movements, analyze sentiment, and make data-driven trading decisions with unprecedented accuracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6 gradient-primary hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              🚀 <span className="text-blue-600">Demo Credentials</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Use these credentials to test the platform immediately
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white dark:bg-gray-800 shadow-lg border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">Test Account</CardTitle>
                <CardDescription className="text-lg">
                  Ready-to-use credentials for immediate access
                </CardDescription>
              </CardHeader>
              
              <div className="px-6 pb-6 space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-lg font-mono bg-white dark:bg-gray-800 px-3 py-2 rounded border">
                      test@example.com
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText('test@example.com')}
                      className="ml-2"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Key className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Password</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-lg font-mono bg-white dark:bg-gray-800 px-3 py-2 rounded border">
                      password
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText('password')}
                      className="ml-2"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Active Account</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Free Tier</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Link href="/auth/signin" className="w-full">
                    <Button className="w-full gradient-primary hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105">
                      <User className="mr-2 h-5 w-5" />
                      Sign In with Demo Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-gradient">Forecaster AI</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with comprehensive market analysis to give you the edge you need.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="gradient-card border-0 shadow-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 shadow-glow">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-gradient">AI-Powered Predictions</CardTitle>
                <CardDescription>
                  Advanced machine learning models analyze market patterns and predict price movements with high accuracy.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-card border-0 shadow-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center mb-4 shadow-glow">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-gradient">Real-Time Analysis</CardTitle>
                <CardDescription>
                  Get instant insights with real-time market data, technical indicators, and sentiment analysis.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-card border-0 shadow-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center mb-4 shadow-glow">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-gradient">Portfolio Optimization</CardTitle>
                <CardDescription>
                  AI-driven portfolio recommendations and risk management strategies for optimal returns.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-card border-0 shadow-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 shadow-glow">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-gradient">Global Market Coverage</CardTitle>
                <CardDescription>
                  Access to stocks, crypto, forex, and commodities from markets around the world.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-card border-0 shadow-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center mb-4 shadow-glow">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-gradient">Enterprise-grade Security</CardTitle>
                <CardDescription>
                  Enterprise-grade security with bank-level encryption and compliance standards.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="gradient-card border-0 shadow-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center mb-4 shadow-glow">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-gradient">Lightning Fast</CardTitle>
                <CardDescription>
                  Ultra-fast execution with low-latency connections and real-time data streaming.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Chart Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Professional Trading Charts
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience our advanced charting platform with candlestick views, volume analysis, and smooth zoom/pan functionality.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <ZoomableChartWithVolume />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your <span className="text-gradient">Trading</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of traders who have already revolutionized their approach with AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Input 
              placeholder="Enter your email address" 
              className="max-w-md border-primary/20 focus:border-primary focus:ring-primary/20"
            />
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6 gradient-primary hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-b from-card/50 to-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 gradient-primary rounded-lg shadow-glow">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gradient">Forecaster AI</span>
              </div>
              <p className="text-muted-foreground">
                Empowering traders with AI-driven market intelligence and predictive analytics.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Forecaster AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
