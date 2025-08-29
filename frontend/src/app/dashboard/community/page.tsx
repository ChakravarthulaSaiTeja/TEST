import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, ThumbsUp, Share2, Users, TrendingUp, Star } from "lucide-react";

export default function Community() {
  const mockDiscussions = [
    {
      id: 1,
      title: "What's your take on AAPL earnings this quarter?",
      content: "Apple just reported strong Q4 results. The services revenue growth is impressive. What do you think about the stock going forward?",
      author: {
        name: "Sarah Johnson",
        avatar: "/avatars/01.png",
        reputation: 1250,
        verified: true
      },
      tags: ["AAPL", "Earnings", "Analysis"],
      replies: 23,
      likes: 45,
      views: 1200,
      timeAgo: "2 hours ago",
      trending: true
    },
    {
      id: 2,
      title: "Best dividend stocks for 2024?",
      content: "Looking to build a dividend portfolio. Any recommendations for stable, high-yield stocks?",
      author: {
        name: "Mike Chen",
        avatar: "/avatars/02.png",
        reputation: 890,
        verified: false
      },
      tags: ["Dividends", "Portfolio", "2024"],
      replies: 18,
      likes: 32,
      views: 850,
      timeAgo: "5 hours ago",
      trending: false
    },
    {
      id: 3,
      title: "Technical analysis: S&P 500 support levels",
      content: "The S&P 500 is approaching key support levels. Here's my analysis of potential entry points.",
      author: {
        name: "Alex Rodriguez",
        avatar: "/avatars/03.png",
        reputation: 2100,
        verified: true
      },
      tags: ["Technical Analysis", "S&P 500", "Support"],
      replies: 31,
      likes: 67,
      views: 2100,
      timeAgo: "8 hours ago",
      trending: true
    }
  ];

  const mockTopUsers = [
    {
      name: "Sarah Johnson",
      avatar: "/avatars/01.png",
      reputation: 1250,
      posts: 45,
      verified: true,
      rank: 1
    },
    {
      name: "Alex Rodriguez",
      avatar: "/avatars/03.png",
      reputation: 2100,
      posts: 67,
      verified: true,
      rank: 2
    },
    {
      name: "Mike Chen",
      avatar: "/avatars/02.png",
      reputation: 890,
      posts: 23,
      verified: false,
      rank: 3
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community</h1>
          <p className="text-muted-foreground">
            Connect with fellow traders and share insights
          </p>
        </div>
        <Button>
          <MessageCircle className="mr-2 h-4 w-4" />
          Start Discussion
        </Button>
      </div>

      {/* Community Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,847</div>
            <p className="text-xs text-muted-foreground">
              +234 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Discussions</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +45 today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,678</div>
            <p className="text-xs text-muted-foreground">
              +1,234 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Contributors</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              Verified experts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Discussions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search discussions..."
              className="pl-10"
            />
            <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>

          {/* Discussions */}
          <div className="space-y-4">
            {mockDiscussions.map((discussion) => (
              <Card key={discussion.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={discussion.author.avatar} />
                        <AvatarFallback>{discussion.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{discussion.author.name}</span>
                          {discussion.author.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {discussion.timeAgo} • {discussion.author.reputation} reputation
                        </div>
                      </div>
                    </div>
                    {discussion.trending && (
                      <Badge className="bg-orange-100 text-orange-800">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{discussion.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {discussion.content}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {discussion.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <MessageCircle className="mr-1 h-3 w-3" />
                          {discussion.replies} replies
                        </span>
                        <span className="flex items-center">
                          <ThumbsUp className="mr-1 h-3 w-3" />
                          {discussion.likes} likes
                        </span>
                        <span>{discussion.views} views</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Reply
                      </Button>
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Like
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Contributors */}
          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
              <CardDescription>
                Most active community members this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopUsers.map((user) => (
                  <div key={user.rank} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{user.rank}
                      </span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{user.name}</span>
                        {user.verified && (
                          <Star className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.reputation} reputation • {user.posts} posts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle>Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["Earnings Season", "Federal Reserve", "Tech Stocks", "Dividend Investing", "Technical Analysis"].map((topic) => (
                  <div key={topic} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer">
                    <span className="text-sm">{topic}</span>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
