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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Navigation */}
      <nav className="border-b border-white/20 bg-white/10 backdrop-blur-xl supports-[backdrop-filter]:bg-white/5 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Forecaster AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-medium">Features</a>
              <a href="#pricing" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-medium">Pricing</a>
              <a href="#about" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 font-medium">About</a>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <Badge className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl px-6 py-2 text-lg font-semibold">
              🚀 AI-Powered Trading Intelligence
            </Badge>
            <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-8 leading-tight">
              Master the Markets with AI Precision
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Leverage advanced machine learning algorithms to predict market movements, analyze sentiment, and make data-driven trading decisions with unprecedented accuracy.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 font-semibold">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-10 py-4 rounded-2xl border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-105 font-semibold">
                Watch Demo
              </Button>
            </div>
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-primary/10 dark:to-accent/10">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              🚀 <span className="text-blue-600 dark:text-primary">Demo Credentials</span>
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
                      demo@forecaster.ai
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText('demo@forecaster.ai');
                        }
                      }}
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
                      Demo123!
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText('Demo123!');
                        }
                      }}
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 dark:bg-gradient-to-r dark:from-primary/5 dark:via-accent/5 dark:to-primary/5">
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
