"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, MessageSquare, Globe, Database, CreditCard, Settings, Home } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: pathname === "/dashboard",
    },
    {
      name: "Analysis",
      href: "/dashboard/analysis",
      icon: BarChart3,
      current: pathname === "/dashboard/analysis",
    },
    {
      name: "Predictions",
      href: "/dashboard/predictions",
      icon: TrendingUp,
      current: pathname === "/dashboard/predictions",
    },
    {
      name: "Sentiment",
      href: "/dashboard/sentiment",
      icon: MessageSquare,
      current: pathname === "/dashboard/sentiment",
    },
    {
      name: "Portfolio",
      href: "/dashboard/portfolio",
      icon: BarChart3,
      current: pathname === "/dashboard/portfolio",
    },
    {
      name: "News",
      href: "/dashboard/news",
      icon: Globe,
      current: pathname === "/dashboard/news",
    },
    {
      name: "Community",
      href: "/dashboard/community",
      icon: MessageSquare,
      current: pathname === "/dashboard/community",
    },
    {
      name: "Data",
      href: "/dashboard/data",
      icon: Database,
      current: pathname === "/dashboard/data",
    },
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: CreditCard,
      current: pathname === "/dashboard/billing",
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      current: pathname === "/dashboard/settings",
    },
  ];

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 flex flex-col bg-gradient-to-b from-background to-card/30 border-r border-border/50 z-40 backdrop-blur-sm">
      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300",
              item.current
                ? "bg-primary text-white shadow-glow font-semibold"
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary hover:shadow-sm"
            )}
          >
            <item.icon
              className={cn(
                "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                item.current
                  ? "text-white"
                  : "text-muted-foreground group-hover:text-primary"
              )}
            />
            <span className="flex-1">{item.name}</span>
            {item.name === "Predictions" && (
              <Badge className="ml-auto gradient-secondary text-white text-xs border-0">
                AI
              </Badge>
            )}
            {item.name === "Sentiment" && (
              <Badge className="ml-auto gradient-accent text-white text-xs border-0">
                New
              </Badge>
            )}
          </Link>
        ))}
      </nav>

      {/* User Info */}
      <div className="border-t border-border/50 p-4 bg-gradient-to-r from-card/50 to-background/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-sm font-semibold text-white">
              DU
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gradient truncate">
              Demo User
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Premium Plan
            </p>
          </div>
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 transition-colors">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
