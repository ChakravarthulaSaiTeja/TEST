"use client";

import Header from "@/components/trading/Header";
import Sidebar from "@/components/trading/Sidebar";
import { AIChat } from "@/components/chat/AIChat";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="glass p-8">
            {children}
          </div>
        </div>
      </main>
      <AIChat />
    </div>
  );
}
