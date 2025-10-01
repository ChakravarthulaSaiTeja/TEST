"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, MessageSquare, Globe, Database, CreditCard, Settings, Home } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

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
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 flex flex-col bg-background border-r z-40">
      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
              item.current
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon
              className={cn(
                "mr-3 h-5 w-5 flex-shrink-0",
                item.current
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            <span className="flex-1">{item.name}</span>
            {item.name === "Predictions" && (
              <Badge className="ml-auto bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 text-xs">
                AI
              </Badge>
            )}
            {item.name === "Sentiment" && (
              <Badge className="ml-auto bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs">
                New
              </Badge>
            )}
          </Link>
        ))}
      </nav>

      {/* User Info */}
      <div className="border-t p-4 bg-background">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {session?.user?.name ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase() : "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {session?.user?.name || "Guest User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Free Plan
            </p>
          </div>
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
