import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Database, BarChart3, TrendingUp, Calendar, Filter } from "lucide-react";

export default function Data() {
  const mockDataSets = [
    {
      id: 1,
      name: "S&P 500 Historical Data",
      description: "Daily OHLCV data for S&P 500 index from 1950 to present",
      category: "Indices",
      size: "2.3 GB",
      records: "18,500+",
      lastUpdated: "2024-01-15",
      format: "CSV",
      free: false,
      popular: true
    },
    {
      id: 2,
      name: "NASDAQ-100 Components",
      description: "Real-time data for all NASDAQ-100 index components",
      category: "Stocks",
      size: "156 MB",
      records: "100",
      lastUpdated: "2024-01-15",
      format: "JSON",
      free: true,
      popular: true
    },
    {
      id: 3,
      name: "Cryptocurrency Price History",
      description: "Hourly price data for top 100 cryptocurrencies",
      category: "Crypto",
      size: "890 MB",
      records: "876,000+",
      lastUpdated: "2024-01-15",
      format: "CSV",
      free: false,
      popular: false
    },
    {
      id: 4,
      name: "Economic Indicators",
      description: "Monthly economic indicators including GDP, inflation, employment",
      category: "Economics",
      size: "45 MB",
      records: "12,000+",
      lastUpdated: "2024-01-10",
      format: "Excel",
      free: true,
      popular: false
    },
    {
      id: 5,
      name: "Options Chain Data",
      description: "Real-time options chain data for major stocks",
      category: "Options",
      size: "1.2 GB",
      records: "50,000+",
      lastUpdated: "2024-01-15",
      format: "JSON",
      free: false,
      popular: true
    }
  ];

  const categories = ["All", "Stocks", "Indices", "Crypto", "Forex", "Options", "Economics", "News"];
  const formats = ["All", "CSV", "JSON", "Excel", "Parquet"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Center</h1>
          <p className="text-muted-foreground">
            Access comprehensive financial data and market information
          </p>
        </div>
        <Button>
          <Database className="mr-2 h-4 w-4" />
          Request Data
        </Button>
      </div>

      {/* Data Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2 TB</div>
            <p className="text-xs text-muted-foreground">
              +2.1 TB this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Datasets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              57% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4M</div>
            <p className="text-xs text-muted-foreground">
              Today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find the data you need quickly and efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Input
                placeholder="Search datasets..."
                className="pl-10"
              />
              <Database className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                {formats.map((format) => (
                  <SelectItem key={format} value={format.toLowerCase()}>
                    {format}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Datasets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockDataSets.map((dataset) => (
          <Card key={dataset.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{dataset.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {dataset.description}
                  </CardDescription>
                </div>
                {dataset.popular && (
                  <Badge className="bg-orange-100 text-orange-800">
                    Popular
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Dataset Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <div className="font-medium">{dataset.category}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Format:</span>
                    <div className="font-medium">{dataset.format}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <div className="font-medium">{dataset.size}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Records:</span>
                    <div className="font-medium">{dataset.records}</div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="text-sm text-muted-foreground">
                  Last updated: {dataset.lastUpdated}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    {dataset.free ? 'Download' : 'Preview'}
                  </Button>
                  {!dataset.free && (
                    <Button size="sm">
                      Subscribe
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data API Information */}
      <Card>
        <CardHeader>
          <CardTitle>Data API Access</CardTitle>
          <CardDescription>
            Programmatic access to our data through REST APIs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">API Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time market data streaming</li>
                <li>• Historical data retrieval</li>
                <li>• Technical indicators calculation</li>
                <li>• News and sentiment data</li>
                <li>• WebSocket support for live updates</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rate Limits</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Free Tier:</span>
                  <span>1,000 calls/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Pro Tier:</span>
                  <span>100,000 calls/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Enterprise:</span>
                  <span>Unlimited</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <Database className="mr-2 h-4 w-4" />
                View API Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
