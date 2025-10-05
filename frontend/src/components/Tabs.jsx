'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onTabChange,
  className = '',
  variant = 'default',
  size = 'md',
  fullWidth = false
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-sm px-4 py-3',
    lg: 'text-base px-6 py-4'
  };

  const updateIndicator = () => {
    const activeIndex = items.findIndex(item => item.id === activeTab);
    const activeTabRef = tabRefs.current[activeIndex];
    
    if (activeTabRef) {
      const { offsetLeft, offsetWidth } = activeTabRef;
      setIndicatorStyle({
        width: offsetWidth,
        left: offsetLeft
      });
    }
  };

  useEffect(() => {
    updateIndicator();
  }, [activeTab, items]);

  useEffect(() => {
    const handleResize = () => updateIndicator();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getTabClasses = (item: TabItem, isActive: boolean) => {
    const baseClasses = 'relative flex items-center space-x-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg';
    
    if (variant === 'pills') {
      return `${baseClasses} ${sizeClasses[size]} ${
        isActive 
          ? 'bg-primary-gradient text-white shadow-glow' 
          : 'text-muted hover:text-white hover:bg-white/10'
      }`;
    }
    
    if (variant === 'underline') {
      return `${baseClasses} ${sizeClasses[size]} ${
        isActive 
          ? 'text-primary border-b-2 border-primary' 
          : 'text-muted hover:text-white border-b-2 border-transparent hover:border-white/20'
      }`;
    }
    
    // Default variant
    return `${baseClasses} ${sizeClasses[size]} ${
      isActive 
        ? 'text-primary' 
        : 'text-muted hover:text-white'
    }`;
  };

  const getContainerClasses = () => {
    const baseClasses = 'flex space-x-1';
    
    if (variant === 'underline') {
      return `${baseClasses} border-b border-white/10`;
    }
    
    if (fullWidth) {
      return `${baseClasses} w-full`;
    }
    
    return baseClasses;
  };

  return (
    <div className={`relative ${className}`}>
      <div className={getContainerClasses()}>
        {items.map((item, index) => {
          const isActive = item.id === activeTab;
          const isDisabled = item.disabled;
          
          return (
            <button
              key={item.id}
              ref={(el) => (tabRefs.current[index] = el)}
              onClick={() => !isDisabled && onTabChange(item.id)}
              disabled={isDisabled}
              className={getTabClasses(item, isActive)}
            >
              {item.icon && (
                <span className={`transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-muted'
                }`}>
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
              
              {/* Active indicator for pills */}
              {variant === 'pills' && isActive && (
                <div className="absolute inset-0 rounded-lg bg-primary-gradient opacity-20 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Animated indicator for default and underline variants */}
      {(variant === 'default' || variant === 'underline') && (
        <div
          className={`absolute bottom-0 bg-primary-gradient transition-all duration-300 ease-out ${
            variant === 'underline' ? 'h-0.5' : 'h-1'
          } rounded-full shadow-glow`}
          style={{
            width: `${indicatorStyle.width}px`,
            left: `${indicatorStyle.left}px`,
            transform: variant === 'underline' ? 'translateY(1px)' : 'translateY(-4px)'
          }}
        />
      )}
    </div>
  );
};

// Tab Panel Component
interface TabPanelProps {
  children: React.ReactNode;
  activeTab: string;
  tabId: string;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  activeTab,
  tabId,
  className = ''
}) => {
  if (activeTab !== tabId) return null;
  
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  );
};

// Tab Group Component
interface TabGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const TabGroup: React.FC<TabGroupProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {children}
    </div>
  );
};

export default Tabs;
