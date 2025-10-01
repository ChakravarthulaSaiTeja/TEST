"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Check, X, Search, Settings } from "lucide-react";

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const notifications = [
    {
      id: 1,
      type: "alert",
      title: "Price Alert: AAPL",
      message: "Apple Inc. has reached your target price of $150.00",
      time: "2 minutes ago",
      read: false,
      priority: "high"
    },
    {
      id: 2,
      type: "prediction",
      title: "New AI Prediction Available",
      message: "Our AI model has generated new predictions for TSLA",
      time: "15 minutes ago",
      read: false,
      priority: "medium"
    },
    {
      id: 3,
      type: "news",
      title: "Market Update",
      message: "Federal Reserve announces new policy changes affecting tech stocks",
      time: "1 hour ago",
      read: true,
      priority: "high"
    },
    {
      id: 4,
      type: "portfolio",
      title: "Portfolio Performance",
      message: "Your portfolio has gained 2.3% this week",
      time: "2 hours ago",
      read: true,
      priority: "low"
    },
    {
      id: 5,
      type: "sentiment",
      title: "Sentiment Alert",
      message: "Negative sentiment detected for NVDA - consider reviewing position",
      time: "3 hours ago",
      read: false,
      priority: "medium"
    },
    {
      id: 6,
      type: "system",
      title: "System Maintenance",
      message: "Scheduled maintenance completed successfully",
      time: "5 hours ago",
      read: true,
      priority: "low"
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return "🚨";
      case "prediction":
        return "🤖";
      case "news":
        return "📰";
      case "portfolio":
        return "📊";
      case "sentiment":
        return "💭";
      case "system":
        return "⚙️";
      default:
        return "🔔";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === "all" || notification.type === filter;
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const markAsRead = (id: number) => {
    // In a real app, this would update the backend
    console.log(`Marking notification ${id} as read`);
  };

  const deleteNotification = (id: number) => {
    // In a real app, this would update the backend
    console.log(`Deleting notification ${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your alerts, predictions, and market news
          </p>
        </div>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Notification Settings
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="alert">Price Alerts</SelectItem>
                <SelectItem value="prediction">AI Predictions</SelectItem>
                <SelectItem value="news">Market News</SelectItem>
                <SelectItem value="portfolio">Portfolio Updates</SelectItem>
                <SelectItem value="sentiment">Sentiment Alerts</SelectItem>
                <SelectItem value="system">System Messages</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "No notifications match your search." : "You're all caught up!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card key={notification.id} className={notification.read ? "opacity-75" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          <Badge variant="secondary">
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline">
          Mark All as Read
        </Button>
        <Button variant="outline">
          Clear All
        </Button>
      </div>
    </div>
  );
}
