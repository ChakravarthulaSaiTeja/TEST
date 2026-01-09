'use client';

import React from 'react';
import { AIChat } from '@/components/chat/AIChat';

const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">AI Trading Assistant</h1>
        <div className="h-[600px]">
          <AIChat isResizable={false} className="relative w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
