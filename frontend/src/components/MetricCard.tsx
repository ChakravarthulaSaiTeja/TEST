'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  changePercent?: number;
  currency?: 'USD' | 'INR' | 'EUR';
  format?: 'number' | 'currency' | 'percentage';
  icon?: React.ReactNode;
  sparkline?: number[];
  className?: string;
  loading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change = 0,
  changePercent = 0,
  currency = 'USD',
  format = 'currency',
  icon,
  sparkline = [],
  className = '',
  loading = false,
  trend = 'neutral',
  subtitle,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animation when value changes
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 800);
    return () => clearTimeout(timer);
  }, [value]);

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat(
          currency === 'INR' ? 'en-IN' : 'en-US',
          {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        ).format(val);
      
      case 'percentage':
        return `${val.toFixed(2)}%`;
      
      case 'number':
        if (val >= 1e12) return `${(val / 1e12).toFixed(1)}T`;
        if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
        if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
        if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`;
        return val.toString();
      
      default:
        return val.toString();
    }
  };

  const getTrendIcon = () => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-danger';
    return 'text-muted';
  };

  const getTrendBg = () => {
    if (change > 0) return 'bg-success-gradient';
    if (change < 0) return 'bg-danger-gradient';
    return 'bg-glass-surface';
  };

  const getSparklineColor = () => {
    if (change > 0) return '#00E676';
    if (change < 0) return '#FF5252';
    return '#AAB4CF';
  };

  return (
    <div
      className={`glass p-6 transition-all duration-300 cursor-pointer group ${
        isHovered ? 'transform -translate-y-2 shadow-floating' : ''
      } ${isAnimating ? 'animate-pulse-glow' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="p-2 rounded-lg glass-surface">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-muted">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted/70">{subtitle}</p>
            )}
          </div>
        </div>
        
        {/* Sparkline */}
        {sparkline.length > 0 && (
          <div className="h-8 w-16 opacity-60">
            <svg viewBox="0 0 64 32" className="w-full h-full">
              <polyline
                points={sparkline.map((point, index) => 
                  `${index * (64 / (sparkline.length - 1))},${32 - (point * 32)}`
                ).join(' ')}
                fill="none"
                stroke={getSparklineColor()}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-3">
        {loading ? (
          <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
        ) : (
          <div className={`text-2xl font-bold tabular-nums transition-all duration-200 ${
            isAnimating ? 'scale-105' : ''
          }`}>
            {formatValue(value)}
          </div>
        )}
      </div>

      {/* Change Indicator */}
      {!loading && (change !== 0 || changePercent !== 0) && (
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendBg()} ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="tabular-nums">
              {change > 0 ? '+' : ''}{formatValue(change)}
            </span>
            {changePercent !== 0 && (
              <span className="tabular-nums">
                ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center space-x-2 mt-3">
          <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
          <Activity className="h-4 w-4 text-muted animate-pulse" />
        </div>
      )}

      {/* Hover Effect */}
      <div className={`absolute inset-0 rounded-xl bg-primary-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
    </div>
  );
};

export default MetricCard;
