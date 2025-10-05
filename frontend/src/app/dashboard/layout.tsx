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
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <ResizableChat />
    </div>
  );
}
