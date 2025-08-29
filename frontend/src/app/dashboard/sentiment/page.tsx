import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, MessageSquare, Twitter, Globe, BarChart3, Activity } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function Sentiment() {
  const mockSentimentData = {
    overall: {
      score: 0.72,
      sentiment: "Bullish",
      confidence: 0.85,
      change: "+0.15",
      changePercent: "+26.3%"
    },
    sources: [
      {
        name: "News Articles",
        score: 0.68,
        sentiment: "Positive",
        count: 45,
        change: "+0.12"
      },
      {
        name: "Social Media",
        score: 0.75,
        sentiment: "Very Positive",
        count: 234,
        change: "+0.18"
      },
      {
        name: "Analyst Reports",
        score: 0.71,
        sentiment: "Positive",
        count: 12,
        change: "+0.08"
      },
      {
        name: "Earnings Calls",
        score: 0.76,
        sentiment: "Very Positive",
        count: 8,
        change: "+0.22"
      }
    ],
    trending: [
      {
        keyword: "AI Technology",
        sentiment: "Positive",
        score: 0.82,
        mentions: 156,
        change: "+12%"
      },
      {
        keyword: "Supply Chain",
        sentiment: "Neutral",
        score: 0.51,
        mentions: 89,
        change: "-3%"
      },
      {
        keyword: "Interest Rates",
        sentiment: "Negative",
        score: 0.32,
        mentions: 234,
        change: "+8%"
      },
      {
        keyword: "Earnings Growth",
        sentiment: "Positive",
        score: 0.78,
        mentions: 67,
        change: "+15%"
      }
    ],
    recent: [
      {
        id: 1,
        source: "Reuters",
        title: "Tech stocks surge on strong earnings reports",
        sentiment: "Positive",
        score: 0.85,
        publishedAt: "2 hours ago",
        impact: "High"
      },
      {
        id: 2,
        source: "Twitter",
        content: "Great quarter for $AAPL! Services revenue growth is impressive",
        sentiment: "Positive",
        score: 0.78,
        publishedAt: "3 hours ago",
        impact: "Medium"
      },
      {
        id: 3,
        source: "Bloomberg",
        title: "Federal Reserve signals potential rate cuts",
        sentiment: "Positive",
        score: 0.72,
        publishedAt: "4 hours ago",
        impact: "High"
      },
      {
        id: 4,
        source: "Reddit",
        content: "Market seems overvalued, expecting correction soon",
        sentiment: "Negative",
        score: 0.35,
        publishedAt: "5 hours ago",
        impact: "Low"
      }
    ]
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'very positive':
      case 'bullish':
        return 'bg-green-100 text-green-800';
      case 'negative':
      case 'very negative':
      case 'bearish':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'very positive':
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
      case 'very negative':
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sentiment Analysis</h1>
          <p className="text-muted-foreground">
            AI-powered sentiment analysis from news, social media, and market data
          </p>
        </div>
        <Button>
          <Activity className="mr-2 h-4 w-4" />
          Refresh Analysis
        </Button>
      </div>

      {/* Overall Sentiment */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Market Sentiment</CardTitle>
          <CardDescription>
            Aggregated sentiment across all sources and timeframes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{mockSentimentData.overall.score}</div>
              <p className="text-sm text-muted-foreground">Sentiment Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{mockSentimentData.overall.sentiment}</div>
              <p className="text-sm text-muted-foreground">Overall Sentiment</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{mockSentimentData.overall.confidence}</div>
              <p className="text-sm text-muted-foreground">Confidence Level</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{mockSentimentData.overall.change}</div>
              <p className="text-sm text-muted-foreground">24h Change</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Sentiment Trend</span>
              <span className="text-sm text-green-600">{mockSentimentData.overall.changePercent}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${mockSentimentData.overall.score * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment by Source</CardTitle>
            <CardDescription>
              Sentiment analysis breakdown across different data sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSentimentData.sources.map((source) => (
                <div key={source.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {source.name === "News Articles" && <Globe className="h-4 w-4 text-blue-600" />}
                      {source.name === "Social Media" && <Twitter className="h-4 w-4 text-blue-600" />}
                      {source.name === "Analyst Reports" && <BarChart3 className="h-4 w-4 text-blue-600" />}
                      {source.name === "Earnings Calls" && <Activity className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div>
                      <div className="font-medium">{source.name}</div>
                      <div className="text-sm text-muted-foreground">{source.count} items</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge className={getSentimentColor(source.sentiment)}>
                        {source.sentiment}
                      </Badge>
                      <span className="text-sm font-medium">{source.score}</span>
                    </div>
                    <div className="text-xs text-green-600">{source.change}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trending Keywords</CardTitle>
            <CardDescription>
              Most discussed topics and their sentiment scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSentimentData.trending.map((keyword) => (
                <div key={keyword.keyword} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{keyword.keyword}</div>
                    <div className="text-sm text-muted-foreground">{keyword.mentions} mentions</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge className={getSentimentColor(keyword.sentiment)}>
                        {keyword.sentiment}
                      </Badge>
                      <span className="text-sm font-medium">{keyword.score}</span>
                    </div>
                    <div className="text-xs text-green-600">{keyword.change}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sentiment Items */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sentiment Items</CardTitle>
          <CardDescription>
            Latest news, social media posts, and market commentary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSentimentData.recent.map((item) => (
              <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {item.source === "Twitter" && <Twitter className="h-4 w-4 text-blue-600" />}
                    {item.source === "Reddit" && <MessageSquare className="h-4 w-4 text-blue-600" />}
                    {item.source === "Reuters" && <Globe className="h-4 w-4 text-blue-600" />}
                    {item.source === "Bloomberg" && <BarChart3 className="h-4 w-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{item.source}</span>
                      <Badge className={getSentimentColor(item.impact)}>
                        {item.impact} Impact
                      </Badge>
                    </div>
                    <div className="text-sm mb-2">
                      {item.title || item.content}
                    </div>
                    <div className="text-xs text-muted-foreground">{item.publishedAt}</div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={getSentimentColor(item.sentiment)}>
                      {getSentimentIcon(item.sentiment)}
                      {item.sentiment}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium">{item.score}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Button variant="outline">
              Load More Items
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Analysis Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis Tools</CardTitle>
          <CardDescription>
            Analyze sentiment for specific stocks, keywords, or topics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Stock Symbol</Label>
              <Input placeholder="e.g., AAPL, MSFT" />
            </div>
            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button className="w-full">
                <Activity className="mr-2 h-4 w-4" />
                Analyze Sentiment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
