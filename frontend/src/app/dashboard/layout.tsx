"use client";

import Header from "@/components/trading/Header";
import Sidebar from "@/components/trading/Sidebar";
import ResizableChat from "@/components/ResizableChat";
import "@/app/styles/resizable-chat.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="gradient-card rounded-2xl p-8 shadow-lg border-0">
            {children}
          </div>
        </div>
      </main>
      <ResizableChat />
    </div>
  );
}
