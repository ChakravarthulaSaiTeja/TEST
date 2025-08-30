"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, TrendingUp, TrendingDown, Globe, Loader2, RefreshCw, Filter } from "lucide-react";

interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  sentiment: "positive" | "negative" | "neutral";
  impact: "high" | "medium" | "low";
  tags: string[];
  url?: string;
  urlToImage?: string | null;
}

interface NewsResponse {
  status: string;
  count: number;
  query?: string;
  sentiment?: string;
  articles: NewsArticle[];
}

export default function News() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all");
  const [selectedImpact, setSelectedImpact] = useState<string>("all");
  const [currentView, setCurrentView] = useState<"general" | "trending" | "search">("general");
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async (endpoint: string, params?: Record<string, string>) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = params ? new URLSearchParams(params).toString() : "";
      const url = `http://localhost:8000/api/v1/news/${endpoint}${queryParams ? `?${queryParams}` : ""}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`);
      }
      
      const data: NewsResponse = await response.json();
      setNews(data.articles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      console.error('News fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews("");
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setCurrentView("search");
      fetchNews("search", { q: searchQuery.trim() });
    }
  };

  const handleSentimentFilter = (sentiment: string) => {
    if (sentiment === "all") {
      fetchNews("");
    } else {
      setCurrentView("search");
      fetchNews(`sentiment/${sentiment}`);
    }
    setSelectedSentiment(sentiment);
  };

  const handleImpactFilter = (impact: string) => {
    setSelectedImpact(impact);
  };

  const getFilteredNews = () => {
    let filtered = news;
    
    if (selectedImpact !== "all") {
      filtered = filtered.filter(article => article.impact === selectedImpact);
    }
    
    return filtered;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleRefresh = () => {
    if (currentView === "trending") {
      fetchNews("trending");
    } else if (currentView === "search" && searchQuery.trim()) {
      fetchNews("search", { q: searchQuery.trim() });
    } else {
      fetchNews("");
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
        <div className="flex items-center space-x-2">
          <Button
            variant={currentView === "trending" ? "default" : "outline"}
            onClick={() => {
              setCurrentView("trending");
              fetchNews("trending");
            }}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Trending
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search news..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={!searchQuery.trim() || loading}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters:</span>
          </div>
          
          <Select value={selectedSentiment} onValueChange={handleSentimentFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedImpact} onValueChange={handleImpactFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Impact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Impact</SelectItem>
              <SelectItem value="high">High Impact</SelectItem>
              <SelectItem value="medium">Medium Impact</SelectItem>
              <SelectItem value="low">Low Impact</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Real Data Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Globe className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">Live News Mode</h3>
            <p className="text-sm text-green-700 mt-1">
              🎉 Now showing real-time financial news from NewsAPI! All articles have working links to original sources.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => fetchNews("")}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading news...</span>
          </div>
        </div>
      )}

      {/* News Grid */}
      {!loading && !error && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {getFilteredNews().length} of {news.length} articles
              {currentView === "search" && searchQuery && ` for "${searchQuery}"`}
              {currentView === "trending" && " (Trending)"}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getFilteredNews().map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="space-y-2">
                    <CardTitle className="text-lg leading-tight">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {article.summary}
                    </CardDescription>
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
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => article.url && window.open(article.url, '_blank')}
                        disabled={!article.url}
                      >
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

          {/* No Results */}
          {getFilteredNews().length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No news articles found matching your filters.</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => {
                  setSelectedSentiment("all");
                  setSelectedImpact("all");
                  fetchNews("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
