"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, X, Minimize2, Maximize2, GripVertical, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AIChatProps {
  className?: string;
  isResizable?: boolean;
}

export function AIChat({ className = "", isResizable = true }: AIChatProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [isMobile, setIsMobile] = useState(false);
  const [selectedModel, setSelectedModel] = useState("grok-3-mini");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  // Ensure handleInputChange is always defined - useChat should provide it
  // Create a wrapper to ensure it's always a function
  const handleTextareaChange: React.ChangeEventHandler<HTMLTextAreaElement> = 
    handleInputChange 
      ? (e) => handleInputChange(e)
      : (e) => {
          // Fallback: This should not happen as useChat always provides handleInputChange
          // But adding this to prevent React warnings about missing onChange
          console.warn("handleInputChange not available from useChat hook");
        };

  // Available models
  const availableModels = [
    { value: "grok-2-vision-1212", label: "Grok 2 Vision", description: "Multimodal with vision" },
    { value: "grok-3-mini", label: "Grok 3 Mini", description: "Fast and efficient" },
    { value: "grok-2-1212", label: "Grok 2", description: "Advanced reasoning" },
    { value: "grok-1", label: "Grok 1", description: "Original Grok model" },
    { value: "grok-1-vision", label: "Grok 1 Vision", description: "Grok 1 with vision" },
    { value: "gpt-4o", label: "GPT-4o", description: "OpenAI GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini", description: "OpenAI GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo", description: "OpenAI GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", description: "OpenAI GPT-3.5 Turbo" },
  ];

  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    // Clear messages when switching models to avoid confusion
    // setMessages is provided by useChat hook
    try {
      if (setMessages) {
        setMessages([]);
      }
    } catch (err) {
      // If setMessages fails (e.g., read-only), just log and continue
      console.warn("Could not clear messages:", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsMaximized(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize position on mount
  useEffect(() => {
    if (!isMinimized && chatRef.current && !isMobile) {
      const rect = chatRef.current.getBoundingClientRect();
      setPosition({
        x: window.innerWidth - rect.width - 20,
        y: window.innerHeight - rect.height - 20,
      });
    }
  }, [isMinimized, isMobile]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chatRef.current && !isMaximized) {
        const rect = chatRef.current.getBoundingClientRect();
        setPosition(prev => ({
          x: Math.min(prev.x, window.innerWidth - size.width),
          y: Math.min(prev.y, window.innerHeight - size.height),
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size, isMaximized]);

  // Drag functionality
  const handleDragStart = (e: React.MouseEvent) => {
    if (isMaximized || isMobile) return;
    e.preventDefault();
    setIsDragging(true);
    if (chatRef.current) {
      const rect = chatRef.current.getBoundingClientRect();
      dragStartRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;
        
        // Constrain to viewport
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isMaximized, size]);

  // Resize functionality
  const handleResizeStart = (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && !isMaximized) {
        const deltaX = e.clientX - resizeStartRef.current.x;
        const deltaY = e.clientY - resizeStartRef.current.y;
        
        const newWidth = Math.max(300, Math.min(800, resizeStartRef.current.width + deltaX));
        const newHeight = Math.max(300, Math.min(window.innerHeight - 100, resizeStartRef.current.height + deltaY));
        
        setSize({ width: newWidth, height: newHeight });
        
        // Adjust position if resizing would push it out of viewport
        setPosition(prev => ({
          x: Math.min(prev.x, window.innerWidth - newWidth),
          y: Math.min(prev.y, window.innerHeight - newHeight),
        }));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isMaximized]);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full shadow-lg"
          size="lg"
        >
          <Send className="h-5 w-5 mr-2" />
          AI Chatbot
        </Button>
      </div>
    );
  }

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (!isMaximized) {
      // Store current size before maximizing
      resizeStartRef.current.width = size.width;
      resizeStartRef.current.height = size.height;
    }
  };

  return (
    <div
      ref={chatRef}
      className={`fixed z-50 flex flex-col glass overflow-hidden transition-all duration-200 ${
        isDragging ? 'cursor-move' : '' 
      } ${isResizing ? 'cursor-nw-resize' : ''} ${className}`}
      style={
        isMaximized || isMobile
          ? {
              width: isMobile ? '100vw' : '90vw',
              height: isMobile ? '100vh' : '85vh',
              top: isMobile ? '0' : '5vh',
              left: isMobile ? '0' : '5vw',
              right: isMobile ? '0' : undefined,
              bottom: isMobile ? '0' : undefined,
            }
          : {
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${size.width}px`,
              height: `${size.height}px`,
            }
      }
    >
      {/* Header - Draggable */}
      <div 
        className={`flex items-center justify-between p-4 border-b border-white/20 bg-primary-gradient text-white ${
          !isMaximized && !isMobile ? 'cursor-move' : ''
        }`}
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2 flex-1">
          {!isMaximized && !isMobile && (
            <GripVertical className="h-4 w-4 text-white/70 cursor-move" />
          )}
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <h3 className="font-semibold">AI Chatbot</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <Select value={selectedModel} onValueChange={handleModelChange} disabled={isLoading}>
            <SelectTrigger className="w-[140px] h-8 bg-white/10 border-white/20 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Grok Models</div>
              {availableModels.filter(m => m.value.startsWith('grok')).map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  <div className="flex flex-col">
                    <span>{model.label}</span>
                    <span className="text-xs text-muted-foreground">{model.description}</span>
                  </div>
                </SelectItem>
              ))}
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">OpenAI Models</div>
              {availableModels.filter(m => m.value.startsWith('gpt')).map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  <div className="flex flex-col">
                    <span>{model.label}</span>
                    <span className="text-xs text-muted-foreground">{model.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMaximize}
            className="text-white hover:bg-white/20"
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-lg font-semibold mb-2">👋 Hello! I'm your AI Chatbot</p>
            <p className="text-sm">
              Ask me about indices, market analysis, trading strategies, or portfolio management.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary-gradient text-white shadow-sm"
                  : "glass border border-white/20 shadow-sm"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          </div>
        ))}

                 {isLoading && (
                   <div className="flex justify-start">
                     <div className="glass border border-white/20 rounded-lg p-3 shadow-sm">
                       <Loader2 className="h-4 w-4 animate-spin text-primary" />
                     </div>
                   </div>
                 )}

                 {error && (
                   <div className="glass border border-red-500/30 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm bg-red-500/10">
                     Error: {error.message}
                   </div>
                 )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-white/20 bg-transparent"
      >
        <div className="flex gap-2">
          <Textarea
            value={input || ""}
            onChange={handleTextareaChange}
            placeholder="Ask about indices, trading, or market analysis..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const trimmedInput = (input || "").trim();
                if (trimmedInput && !isLoading) {
                  handleSubmit(e as any);
                }
              }
            }}
          />
          <Button
            type="submit"
            disabled={isLoading || !input || !input.trim()}
            className="self-end"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      {/* Resize Handle */}
      {isResizable && !isMaximized && !isMobile && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nw-resize bg-primary/20 hover:bg-primary/40 transition-colors z-10"
          onMouseDown={handleResizeStart}
          style={{
            clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
          }}
        >
          <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-white/50" />
        </div>
      )}
    </div>
  );
}

