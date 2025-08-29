import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Clock, TrendingUp, TrendingDown, Globe } from "lucide-react";

export default function News() {
  const mockNews = [
    {
      id: 1,
      title: "Apple Reports Record Q4 Earnings, Stock Surges 5%",
      summary: "Apple Inc. reported quarterly earnings that exceeded analyst expectations, driven by strong iPhone sales and services revenue growth.",
      source: "Reuters",
      publishedAt: "2 hours ago",
      sentiment: "positive",
      impact: "high",
      tags: ["AAPL", "Earnings", "Technology"]
    },
    {
      id: 2,
      title: "Federal Reserve Signals Potential Rate Cut in March",
      summary: "Federal Reserve officials indicated they may consider cutting interest rates as early as March, citing improved inflation data.",
      source: "Bloomberg",
      publishedAt: "4 hours ago",
      sentiment: "positive",
      impact: "high",
      tags: ["Federal Reserve", "Interest Rates", "Economy"]
    },
    {
      id: 3,
      title: "Tesla Faces Production Challenges in Q1",
      summary: "Tesla reported lower-than-expected vehicle deliveries in Q1, citing supply chain disruptions and factory upgrades.",
      source: "CNBC",
      publishedAt: "6 hours ago",
      sentiment: "negative",
      impact: "medium",
      tags: ["TSLA", "Production", "Automotive"]
    },
    {
      id: 4,
      title: "Microsoft Cloud Services Revenue Grows 25%",
      summary: "Microsoft's cloud computing division continues strong growth, with Azure revenue increasing 25% year-over-year.",
      source: "TechCrunch",
      publishedAt: "8 hours ago",
      sentiment: "positive",
      impact: "medium",
      tags: ["MSFT", "Cloud Computing", "Technology"]
    },
    {
      id: 5,
      title: "Oil Prices Drop Amid Global Economic Concerns",
      summary: "Crude oil prices fell 3% as investors worry about global economic slowdown and reduced demand forecasts.",
      source: "MarketWatch",
      publishedAt: "10 hours ago",
      sentiment: "negative",
      impact: "medium",
      tags: ["Oil", "Commodities", "Economy"]
    }
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market News</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest market news and sentiment analysis
          </p>
        </div>
        <Button>
          <Globe className="mr-2 h-4 w-4" />
          Market Overview
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search news..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">Filter</Button>
        <Button variant="outline">Sort by Date</Button>
      </div>

      {/* News Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockNews.map((article) => (
          <Card key={article.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg leading-tight">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {article.summary}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Source and Time */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Globe className="mr-1 h-3 w-3" />
                    {article.source}
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {article.publishedAt}
                  </span>
                </div>

                {/* Sentiment and Impact */}
                <div className="flex items-center space-x-2">
                  <Badge className={getSentimentColor(article.sentiment)}>
                    {article.sentiment === 'positive' && <TrendingUp className="mr-1 h-3 w-3" />}
                    {article.sentiment === 'negative' && <TrendingDown className="mr-1 h-3 w-3" />}
                    {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
                  </Badge>
                  <Badge className={getImpactColor(article.impact)}>
                    {article.impact.charAt(0).toUpperCase() + article.impact.slice(1)} Impact
                  </Badge>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Read More
                  </Button>
                  <Button variant="outline" size="sm">
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More News
        </Button>
      </div>
    </div>
  );
}
