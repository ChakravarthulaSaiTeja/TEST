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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-16">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/20 hover:shadow-3xl transition-all duration-300">
            {children}
          </div>
        </div>
      </main>
      <ResizableChat />
    </div>
  );
}
