'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Minus, Maximize2, X, MessageCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface TradePreview {
  symbol: string;
  side: 'buy' | 'sell';
  qty: number;
  type: 'market' | 'limit';
  limitPrice?: number;
  timeInForce: 'day' | 'gtc';
  rationale_inputs?: string;
}

interface ConfirmDialogProps {
  preview: TradePreview;
  confirmationToken: string;
  onConfirm: (accepted: boolean, mode: 'paper' | 'live') => void;
  onClose: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  preview,
  confirmationToken,
  onConfirm,
  onClose,
}) => {
  const [accepted, setAccepted] = useState(false);
  const [mode, setMode] = useState<'paper' | 'live'>('paper');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!accepted) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/trade/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user',
        },
        body: JSON.stringify({
          confirmationToken,
          userAccepts: true,
          mode,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Trade executed successfully!');
        onConfirm(true, mode);
      } else {
        toast.error(result.error || 'Trade execution failed');
        onConfirm(false, mode);
      }
    } catch (error) {
      console.error('Trade confirmation error:', error);
      toast.error('Failed to execute trade. Please try again.');
      onConfirm(false, mode);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    try {
      await fetch('/api/trade/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user',
        },
        body: JSON.stringify({
          confirmationToken,
          userAccepts: false,
        }),
      });
    } catch (error) {
      console.error('Trade cancellation error:', error);
    }
    onConfirm(false, mode);
  };

  return (
    <div className="resizable-chat-confirm-overlay">
      <div className="resizable-chat-confirm-dialog">
        <div className="resizable-chat-confirm-header">
          <h3>Confirm Trade</h3>
          <button className="resizable-chat-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="resizable-chat-confirm-content">
          <div className="resizable-chat-trade-summary">
            <h4>{preview.side.toUpperCase()} {preview.qty} shares of {preview.symbol}</h4>
            <div className="resizable-chat-trade-details">
              <div className="resizable-chat-detail-row">
                <span>Order Type:</span>
                <span>{preview.type.toUpperCase()}</span>
              </div>
              {preview.limitPrice && (
                <div className="resizable-chat-detail-row">
                  <span>Limit Price:</span>
                  <span>${preview.limitPrice}</span>
                </div>
              )}
              <div className="resizable-chat-detail-row">
                <span>Time in Force:</span>
                <span>{preview.timeInForce.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {preview.rationale_inputs && (
            <div className="resizable-chat-trade-rationale">
              <h5>Analysis Rationale:</h5>
              <p>{preview.rationale_inputs}</p>
            </div>
          )}

          <div className="resizable-chat-mode-selection">
            <label>
              <input
                type="radio"
                name="mode"
                value="paper"
                checked={mode === 'paper'}
                onChange={(e) => setMode(e.target.value as 'paper' | 'live')}
              />
              Paper Trading (Simulated)
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="live"
                checked={mode === 'live'}
                onChange={(e) => setMode(e.target.value as 'paper' | 'live')}
              />
              Live Trading (Real Money)
            </label>
          </div>

          <div className="resizable-chat-risk-warning">
            <label className="resizable-chat-risk-checkbox">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              I understand the risks and accept responsibility for this trade
            </label>
          </div>
        </div>

        <div className="resizable-chat-confirm-actions">
          <button
            className="resizable-chat-btn resizable-chat-btn-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="resizable-chat-btn resizable-chat-btn-primary"
            onClick={handleConfirm}
            disabled={!accepted || isSubmitting}
          >
            {isSubmitting ? 'Executing...' : 'Confirm Trade'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ResizableChatProps {
  className?: string;
}

const ResizableChat: React.FC<ResizableChatProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'analysis' | 'trade'>('analysis');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentPreview, setCurrentPreview] = useState<TradePreview | null>(null);
  const [confirmationToken, setConfirmationToken] = useState<string>('');
  
  // Chat window state
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 400, height: 600 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickSymbols = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL'];

  const handleExamplePrompt = (prompt: string) => {
    setInput(prompt);
    // Focus the input field
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mode,
          userId: 'demo-user',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let assistantMessage = '';
      const assistantMessageObj: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessageObj]);

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsLoading(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.content) {
                assistantMessage += parsed.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    ...newMessages[newMessages.length - 1],
                    content: assistantMessage,
                  };
                  return newMessages;
                });
              }

              if (parsed.requiresConfirmation && parsed.previewOrder) {
                setCurrentPreview(parsed.previewOrder);
                setConfirmationToken(parsed.confirmationToken);
                setShowConfirmDialog(true);
              }
            } catch (error) {
              console.error('Error parsing SSE data:', error);
            }
          }
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          content: 'Sorry, I encountered an error. Please try again.',
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickSymbol = (symbol: string) => {
    setInput(`What's happening with ${symbol}?`);
  };

  const handleNewChat = () => {
    setMessages([]);
    setShowConfirmDialog(false);
    setCurrentPreview(null);
    setConfirmationToken('');
  };

  const handleConfirmDialogClose = () => {
    setShowConfirmDialog(false);
    setCurrentPreview(null);
    setConfirmationToken('');
  };

  const handleTradeConfirm = (accepted: boolean, tradeMode: 'paper' | 'live') => {
    setShowConfirmDialog(false);
    setCurrentPreview(null);
    setConfirmationToken('');
    
    if (accepted) {
      toast.success(`Trade executed in ${tradeMode} mode!`);
    } else {
      toast.info('Trade cancelled');
    }
  };

  // Window controls
  const handleMinimize = () => {
    setIsMinimized(true);
    setIsMaximized(false);
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      setSize({ width: 400, height: 600 });
    } else {
      setIsMaximized(true);
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 40 });
      setPosition({ x: 20, y: 20 });
    }
  };

  const handleClose = () => {
    setIsMinimized(true);
  };

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('resizable-chat-header')) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        setPosition({
          x: e.clientX - dragStartRef.current.x,
          y: e.clientY - dragStartRef.current.y,
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
  }, [isDragging, isMaximized]);

  // Resize functionality
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  useEffect(() => {
    const handleResizeMouseMove = (e: MouseEvent) => {
      if (isResizing && !isMaximized) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        
        setSize(prev => ({
          width: Math.max(300, prev.width + deltaX),
          height: Math.max(200, prev.height + deltaY),
        }));
        
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
        };
      }
    };

    const handleResizeMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, [isResizing, isMaximized]);

  if (isMinimized) {
    return (
      <div className={`resizable-chat-minimized ${className}`}>
        <button
          className="resizable-chat-minimized-btn"
          onClick={() => setIsMinimized(false)}
          title="Open Chat"
        >
          <MessageCircle size={24} />
          <span>AI Assistant</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        ref={chatRef}
        className={`resizable-chat-container ${className} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          zIndex: 1000,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="resizable-chat-header">
          <div className="resizable-chat-title">
            <MessageCircle size={16} />
            <span>Forecaster AI Assistant</span>
            <div className="resizable-chat-mode-toggle">
              <button
                className={`resizable-chat-mode-btn ${mode === 'analysis' ? 'active' : ''}`}
                onClick={() => setMode('analysis')}
              >
                Analysis
              </button>
              <button
                className={`resizable-chat-mode-btn ${mode === 'trade' ? 'active' : ''}`}
                onClick={() => setMode('trade')}
              >
                Trade
              </button>
            </div>
          </div>
          
          <div className="resizable-chat-controls">
            <button className="resizable-chat-btn resizable-chat-btn-secondary" onClick={handleNewChat}>
              New Chat
            </button>
            <button className="resizable-chat-window-btn" onClick={handleMinimize} title="Minimize">
              <Minus size={14} />
            </button>
            <button className="resizable-chat-window-btn" onClick={handleMaximize} title="Maximize">
              <Maximize2 size={14} />
            </button>
            <button className="resizable-chat-window-btn" onClick={handleClose} title="Close">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Quick Symbols */}
        <div className="resizable-chat-quick-symbols">
          {quickSymbols.map(symbol => (
            <button
              key={symbol}
              className="resizable-chat-symbol-chip"
              onClick={() => handleQuickSymbol(symbol)}
            >
              {symbol}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="resizable-chat-messages">
          {messages.length === 0 && (
            <div className="resizable-chat-welcome-message">
              <h3>Welcome to Forecaster AI</h3>
              <p>I can help you analyze stocks, summarize news, and execute trades.</p>
              <div className="resizable-chat-example-prompts">
                <p>Try asking:</p>
              <ul>
                <li onClick={() => handleExamplePrompt("What's happening with NVDA?")}>
                  &ldquo;What&apos;s happening with NVDA?&rdquo;
                </li>
                <li onClick={() => handleExamplePrompt("Should I buy AAPL?")}>
                  &ldquo;Should I buy AAPL?&rdquo;
                </li>
                <li onClick={() => handleExamplePrompt("Buy 5 shares of TSLA at market")}>
                  &ldquo;Buy 5 shares of TSLA at market&rdquo;
                </li>
                <li onClick={() => handleExamplePrompt("Show me technical analysis for MSFT")}>
                  &ldquo;Show me technical analysis for MSFT&rdquo;
                </li>
              </ul>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`resizable-chat-message ${message.role}`}>
              <div className="resizable-chat-message-content">
                {message.content.split('\n').map((line, lineIndex) => (
                  <div key={lineIndex}>
                    {line}
                    {lineIndex < message.content.split('\n').length - 1 && <br />}
                  </div>
                ))}
              </div>
              <div className="resizable-chat-message-timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="resizable-chat-message assistant">
              <div className="resizable-chat-message-content">
                <div className="resizable-chat-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="resizable-chat-input">
          <div className="resizable-chat-input-container">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask me about stocks, news, or ${mode === 'trade' ? 'place trades' : 'analysis'}...`}
              disabled={isLoading}
            />
            <button
              className="resizable-chat-send-btn"
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </div>

        {/* Resize handle */}
        <div
          className="resizable-chat-resize-handle"
          onMouseDown={handleResizeMouseDown}
        />
      </div>

      {showConfirmDialog && currentPreview && (
        <ConfirmDialog
          preview={currentPreview}
          confirmationToken={confirmationToken}
          onConfirm={handleTradeConfirm}
          onClose={handleConfirmDialogClose}
        />
      )}
    </>
  );
};

export default ResizableChat;
