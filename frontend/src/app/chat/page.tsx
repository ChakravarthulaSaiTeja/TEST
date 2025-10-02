'use client';

import React from 'react';
import ResizableChat from '@/components/ResizableChat';
import '@/app/styles/resizable-chat.css';

const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <ResizableChat />
    </div>
  );
};

export default ChatPage;
