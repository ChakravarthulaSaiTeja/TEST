'use client';

import React, { useState, useRef, useEffect } from 'react';
import { parseEventSource } from 'eventsource-parser';
import { toast } from 'sonner';
import '../styles/chat.css';

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
          'x-user-id': 'demo-user', // In real app, get from auth context
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
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <div className="confirm-header">
          <h3>Confirm Trade</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="confirm-content">
          <div className="trade-summary">
            <h4>{preview.side.toUpperCase()} {preview.qty} shares of {preview.symbol}</h4>
            <div className="trade-details">
              <div className="detail-row">
                <span>Order Type:</span>
                <span>{preview.type.toUpperCase()}</span>
              </div>
              {preview.limitPrice && (
                <div className="detail-row">
                  <span>Limit Price:</span>
                  <span>${preview.limitPrice}</span>
                </div>
              )}
              <div className="detail-row">
                <span>Time in Force:</span>
                <span>{preview.timeInForce.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {preview.rationale_inputs && (
            <div className="trade-rationale">
              <h5>Analysis Rationale:</h5>
              <p>{preview.rationale_inputs}</p>
            </div>
          )}

          <div className="mode-selection">
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

          <div className="risk-warning">
            <label className="risk-checkbox">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              I understand the risks and accept responsibility for this trade
            </label>
          </div>
        </div>

        <div className="confirm-actions">
          <button
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
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

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'analysis' | 'trade'>('analysis');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentPreview, setCurrentPreview] = useState<TradePreview | null>(null);
  const [confirmationToken, setConfirmationToken] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickSymbols = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL'];

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
          userId: 'demo-user', // In real app, get from auth context
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

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <h1>Forecaster AI Trading Assistant</h1>
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'analysis' ? 'active' : ''}`}
              onClick={() => setMode('analysis')}
            >
              Analysis
            </button>
            <button
              className={`mode-btn ${mode === 'trade' ? 'active' : ''}`}
              onClick={() => setMode('trade')}
            >
              Trade
            </button>
          </div>
        </div>
        
        <div className="chat-controls">
          <button className="btn btn-secondary" onClick={handleNewChat}>
            New Chat
          </button>
        </div>
      </div>

      <div className="quick-symbols">
        {quickSymbols.map(symbol => (
          <button
            key={symbol}
            className="symbol-chip"
            onClick={() => handleQuickSymbol(symbol)}
          >
            {symbol}
          </button>
        ))}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h3>Welcome to Forecaster AI</h3>
            <p>I can help you analyze stocks, summarize news, and execute trades.</p>
            <div className="example-prompts">
              <p>Try asking:</p>
              <ul>
                <li>"What's happening with NVDA?"</li>
                <li>"Should I buy AAPL?"</li>
                <li>"Buy 5 shares of TSLA at market"</li>
                <li>"Show me technical analysis for MSFT"</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              {message.content.split('\n').map((line, lineIndex) => (
                <div key={lineIndex}>
                  {line}
                  {lineIndex < message.content.split('\n').length - 1 && <br />}
                </div>
              ))}
            </div>
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="input-container">
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
            className="send-btn"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
      </div>

      {showConfirmDialog && currentPreview && (
        <ConfirmDialog
          preview={currentPreview}
          confirmationToken={confirmationToken}
          onConfirm={handleTradeConfirm}
          onClose={handleConfirmDialogClose}
        />
      )}
    </div>
  );
};

export default ChatPage;
