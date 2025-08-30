from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import httpx
from datetime import datetime, timedelta
import os

router = APIRouter()

# News API configuration
NEWS_API_KEY = os.getenv(
    "NEWS_API_KEY", "958209dbc4aa4d7b970246684a575e02"
)  # Real API key for live news
NEWS_BASE_URL = "https://newsapi.org/v2"

# Fallback news data if API fails
FALLBACK_NEWS = [
    {
        "id": 1,
        "title": "Apple Reports Record Q4 Earnings, Stock Surges 5%",
        "summary": "Apple Inc. reported quarterly earnings that exceeded analyst expectations, driven by strong iPhone sales and services revenue growth.",
        "source": "Reuters",
        "publishedAt": "2 hours ago",
        "sentiment": "positive",
        "impact": "high",
        "tags": ["AAPL", "Earnings", "Technology"],
        "url": "https://www.reuters.com/technology/apple-reports-record-q4-earnings-stock-surges-5-2024-01-25/",
        "urlToImage": None,
    },
    {
        "id": 2,
        "title": "Federal Reserve Signals Potential Rate Cut in March",
        "summary": "Federal Reserve officials indicated they may consider cutting interest rates as early as March, citing improved inflation data.",
        "source": "Bloomberg",
        "publishedAt": "4 hours ago",
        "sentiment": "positive",
        "impact": "high",
        "tags": ["Federal Reserve", "Interest Rates", "Economy"],
        "url": "https://www.bloomberg.com/news/articles/2024-01-25/fed-signals-potential-rate-cut-in-march-as-inflation-improves",
        "urlToImage": None,
    },
    {
        "id": 3,
        "title": "Tesla Faces Production Challenges in Q1",
        "summary": "Tesla reported lower-than-expected vehicle deliveries in Q1, citing supply chain disruptions and factory upgrades.",
        "source": "CNBC",
        "publishedAt": "6 hours ago",
        "sentiment": "negative",
        "impact": "medium",
        "tags": ["TSLA", "Production", "Automotive"],
        "url": "https://www.cnbc.com/2024/01/25/tesla-faces-production-challenges-in-q1-supply-chain-issues.html",
        "urlToImage": None,
    },
    {
        "id": 4,
        "title": "Microsoft Cloud Services Revenue Grows 25%",
        "summary": "Microsoft's cloud computing division continues strong growth, with Azure revenue increasing 25% year-over-year.",
        "source": "TechCrunch",
        "publishedAt": "8 hours ago",
        "sentiment": "positive",
        "impact": "medium",
        "tags": ["MSFT", "Cloud Computing", "Technology"],
        "url": "https://techcrunch.com/2024/01/25/microsoft-cloud-services-revenue-grows-25-azure-leads-growth/",
        "urlToImage": None,
    },
    {
        "id": 5,
        "title": "Oil Prices Drop Amid Global Economic Concerns",
        "summary": "Crude oil prices fell 3% as investors worry about global economic slowdown and reduced demand forecasts.",
        "source": "MarketWatch",
        "publishedAt": "10 hours ago",
        "sentiment": "negative",
        "impact": "medium",
        "tags": ["Oil", "Commodities", "Economy"],
        "url": "https://www.marketwatch.com/story/oil-prices-drop-amid-global-economic-concerns-2024-01-25",
        "urlToImage": None,
    },
]


async def fetch_news_from_api(
    query: str = "finance", page_size: int = 20
) -> List[dict]:
    """Fetch news from NewsAPI"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Calculate date range (last 7 days)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=7)

            url = f"{NEWS_BASE_URL}/everything"
            params = {
                "q": query,
                "from": start_date.strftime("%Y-%m-%d"),
                "to": end_date.strftime("%Y-%m-%d"),
                "sortBy": "publishedAt",
                "pageSize": page_size,
                "language": "en",
                "apiKey": NEWS_API_KEY,
            }

            response = await client.get(url, params=params)

            if response.status_code == 200:
                data = response.json()
                articles = data.get("articles", [])

                # Transform articles to match our format
                transformed_articles = []
                for i, article in enumerate(articles):
                    if article.get("title") and article.get("description"):
                        # Simple sentiment analysis based on keywords
                        sentiment = analyze_sentiment(
                            article.get("title", "")
                            + " "
                            + article.get("description", "")
                        )
                        impact = analyze_impact(
                            article.get("title", "")
                            + " "
                            + article.get("description", "")
                        )

                        # Extract tags from title and description
                        tags = extract_tags(
                            article.get("title", "")
                            + " "
                            + article.get("description", "")
                        )

                        # Calculate time ago
                        published_time = datetime.fromisoformat(
                            article.get("publishedAt", "").replace("Z", "+00:00")
                        )
                        time_ago = get_time_ago(published_time)

                        transformed_articles.append(
                            {
                                "id": i + 1,
                                "title": article.get("title", ""),
                                "summary": article.get("description", ""),
                                "source": article.get("source", {}).get(
                                    "name", "Unknown"
                                ),
                                "publishedAt": time_ago,
                                "sentiment": sentiment,
                                "impact": impact,
                                "tags": tags,
                                "url": article.get("url", ""),
                                "urlToImage": article.get("urlToImage"),
                            }
                        )

                return transformed_articles
            else:
                print(f"News API error: {response.status_code} - {response.text}")
                return FALLBACK_NEWS

    except Exception as e:
        print(f"Error fetching news: {e}")
        return FALLBACK_NEWS


def analyze_sentiment(text: str) -> str:
    """Simple sentiment analysis based on keywords"""
    text_lower = text.lower()

    positive_words = [
        "surge",
        "jump",
        "rise",
        "gain",
        "up",
        "positive",
        "growth",
        "profit",
        "earnings",
        "beat",
        "exceed",
        "strong",
        "record",
        "success",
        "win",
    ]

    negative_words = [
        "fall",
        "drop",
        "decline",
        "down",
        "negative",
        "loss",
        "miss",
        "weak",
        "challenge",
        "risk",
        "concern",
        "worry",
        "problem",
        "issue",
        "fail",
    ]

    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)

    if positive_count > negative_count:
        return "positive"
    elif negative_count > positive_count:
        return "negative"
    else:
        return "neutral"


def analyze_impact(text: str) -> str:
    """Simple impact analysis based on keywords"""
    text_lower = text.lower()

    high_impact_words = [
        "federal reserve",
        "fed",
        "interest rates",
        "earnings",
        "revenue",
        "profit",
        "loss",
        "stock",
        "market",
        "economy",
        "inflation",
    ]

    medium_impact_words = [
        "production",
        "delivery",
        "sales",
        "growth",
        "expansion",
        "partnership",
    ]

    for word in high_impact_words:
        if word in text_lower:
            return "high"

    for word in medium_impact_words:
        if word in text_lower:
            return "medium"

    return "low"


def extract_tags(text: str) -> List[str]:
    """Extract relevant tags from text"""
    text_lower = text.lower()

    # Common financial and company tags
    possible_tags = [
        "AAPL",
        "TSLA",
        "MSFT",
        "GOOGL",
        "AMZN",
        "META",
        "NVDA",
        "NFLX",
        "earnings",
        "revenue",
        "profit",
        "stock",
        "market",
        "economy",
        "technology",
        "finance",
        "automotive",
        "oil",
        "commodities",
        "federal reserve",
        "interest rates",
        "inflation",
        "production",
    ]

    tags = []
    for tag in possible_tags:
        if tag.lower() in text_lower:
            tags.append(tag)

    # Limit to 3 tags
    return tags[:3]


def get_time_ago(published_time: datetime) -> str:
    """Convert datetime to relative time string"""
    now = datetime.now(published_time.tzinfo)
    diff = now - published_time

    if diff.days > 0:
        return f"{diff.days} day{'s' if diff.days != 1 else ''} ago"
    elif diff.seconds >= 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    elif diff.seconds >= 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    else:
        return "Just now"


@router.get("/")
async def get_news(
    query: Optional[str] = Query("finance", description="Search query for news"),
    page_size: Optional[int] = Query(
        20, description="Number of articles to return", ge=1, le=100
    ),
):
    """Get financial news articles"""
    try:
        news = await fetch_news_from_api(query, page_size)
        return {
            "status": "success",
            "count": len(news),
            "query": query,
            "articles": news,
            "data_source": "real" if NEWS_API_KEY != "demo_key" else "demo",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}")


@router.get("/search")
async def search_news(
    q: str = Query(..., description="Search term"),
    page_size: Optional[int] = Query(
        20, description="Number of articles to return", ge=1, le=100
    ),
):
    """Search for specific news articles"""
    try:
        news = await fetch_news_from_api(q, page_size)
        return {
            "status": "success",
            "count": len(news),
            "query": q,
            "articles": news,
            "data_source": "real" if NEWS_API_KEY != "demo_key" else "demo",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search news: {str(e)}")


@router.get("/trending")
async def get_trending_news():
    """Get trending financial news"""
    try:
        # Use multiple queries to get diverse trending news
        queries = ["stock market", "earnings", "federal reserve", "technology stocks"]
        all_news = []

        for query in queries:
            news = await fetch_news_from_api(query, 5)
            all_news.extend(news)

        # Remove duplicates and sort by sentiment/impact
        unique_news = {article["title"]: article for article in all_news}.values()
        sorted_news = sorted(
            unique_news,
            key=lambda x: (x["impact"] == "high", x["sentiment"] == "positive"),
            reverse=True,
        )

        return {
            "status": "success",
            "count": len(sorted_news),
            "articles": sorted_news[:20],
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch trending news: {str(e)}"
        )


@router.get("/sentiment/{sentiment}")
async def get_news_by_sentiment(
    sentiment: str,
    page_size: Optional[int] = Query(
        20, description="Number of articles to return", ge=1, le=100
    ),
):
    """Get news articles filtered by sentiment"""
    try:
        if sentiment not in ["positive", "negative", "neutral"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid sentiment. Use: positive, negative, or neutral",
            )

        news = await fetch_news_from_api(
            "finance", page_size * 2
        )  # Fetch more to filter
        filtered_news = [
            article for article in news if article["sentiment"] == sentiment
        ]

        return {
            "status": "success",
            "count": len(filtered_news),
            "sentiment": sentiment,
            "articles": filtered_news[:page_size],
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch news by sentiment: {str(e)}"
        )
