// Chart Styling Configuration for Fintech Theme
// Compatible with Recharts, Chart.js, and TradingView

// Recharts Configuration
export const rechartsConfig = {
  colors: {
    primary: '#00C8FF',
    secondary: '#00E0A4',
    success: '#00E676',
    danger: '#FF5252',
    muted: '#AAB4CF',
    grid: 'rgba(255, 255, 255, 0.04)',
    background: 'rgba(255, 255, 255, 0.02)'
  },
  
  // Line Chart Configuration
  lineChart: {
    stroke: '#00C8FF',
    strokeWidth: 2,
    dot: {
      fill: '#00C8FF',
      stroke: '#00C8FF',
      strokeWidth: 2,
      r: 4
    },
    gradient: {
      from: 'rgba(0, 200, 255, 0.3)',
      to: 'rgba(0, 200, 255, 0.05)'
    }
  },
  
  // Area Chart Configuration
  areaChart: {
    fill: 'url(#areaGradient)',
    stroke: '#00C8FF',
    strokeWidth: 2
  },
  
  // Bar Chart Configuration
  barChart: {
    fill: '#00C8FF',
    radius: [4, 4, 0, 0]
  },
  
  // Candlestick Configuration
  candlestick: {
    up: {
      fill: '#00E676',
      stroke: '#00E676',
      strokeWidth: 1
    },
    down: {
      fill: '#FF5252',
      stroke: '#FF5252',
      strokeWidth: 1
    }
  },
  
  // Grid Configuration
  grid: {
    stroke: 'rgba(255, 255, 255, 0.04)',
    strokeWidth: 1,
    strokeDasharray: '2 2'
  },
  
  // Axis Configuration
  axis: {
    stroke: '#AAB4CF',
    strokeWidth: 1,
    fontSize: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
    fill: '#AAB4CF'
  },
  
  // Tooltip Configuration
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(2, 6, 23, 0.6)',
    color: '#1e293b',
    fontSize: '14px',
    fontFamily: 'Inter, system-ui, sans-serif'
  }
};

// Chart.js Configuration
export const chartJsConfig = {
  plugins: {
    legend: {
      labels: {
        color: '#AAB4CF',
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1e293b',
      bodyColor: '#475569',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 12,
      displayColors: true,
      font: {
        family: 'Inter, system-ui, sans-serif',
        size: 12
      }
    }
  },
  
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.04)',
        lineWidth: 1
      },
      ticks: {
        color: '#AAB4CF',
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 11
        }
      },
      border: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.04)',
        lineWidth: 1
      },
      ticks: {
        color: '#AAB4CF',
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 11
        }
      },
      border: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    }
  },
  
  elements: {
    line: {
      borderWidth: 2,
      tension: 0.1
    },
    point: {
      radius: 4,
      hoverRadius: 6
    },
    bar: {
      borderRadius: 4
    }
  },
  
  datasets: {
    line: {
      borderColor: '#00C8FF',
      backgroundColor: 'rgba(0, 200, 255, 0.1)',
      pointBackgroundColor: '#00C8FF',
      pointBorderColor: '#00C8FF',
      pointHoverBackgroundColor: '#00E0A4',
      pointHoverBorderColor: '#00E0A4'
    },
    area: {
      borderColor: '#00C8FF',
      backgroundColor: 'rgba(0, 200, 255, 0.2)',
      fill: true
    },
    bar: {
      backgroundColor: '#00C8FF',
      borderColor: '#00C8FF',
      borderWidth: 0
    },
    candlestick: {
      upColor: '#00E676',
      downColor: '#FF5252',
      borderUpColor: '#00E676',
      borderDownColor: '#FF5252'
    }
  }
};

// TradingView Configuration
export const tradingViewConfig = {
  theme: 'dark',
  locale: 'en',
  autosize: true,
  symbol: 'AAPL',
  interval: 'D',
  timezone: 'Etc/UTC',
  
  style: {
    backgroundColor: '#071226',
    textColor: '#AAB4CF',
    gridColor: 'rgba(255, 255, 255, 0.04)',
    crosshairColor: '#00C8FF',
    crosshairLineStyle: 0,
    crosshairLineWidth: 1
  },
  
  layout: {
    backgroundColor: '#071226',
    textColor: '#AAB4CF',
    fontSize: 12,
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  
  grid: {
    vertLines: {
      color: 'rgba(255, 255, 255, 0.04)',
      style: 0,
      visible: true
    },
    horzLines: {
      color: 'rgba(255, 255, 255, 0.04)',
      style: 0,
      visible: true
    }
  },
  
  crosshair: {
    mode: 0,
    vertLine: {
      color: '#00C8FF',
      width: 1,
      style: 0,
      visible: true,
      labelVisible: true,
      labelBackgroundColor: '#00C8FF'
    },
    horzLine: {
      color: '#00C8FF',
      width: 1,
      style: 0,
      visible: true,
      labelVisible: true,
      labelBackgroundColor: '#00C8FF'
    }
  },
  
  priceScale: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textColor: '#AAB4CF',
    fontSize: 11,
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  
  timeScale: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textColor: '#AAB4CF',
    fontSize: 11,
    fontFamily: 'Inter, system-ui, sans-serif'
  }
};

// Custom Chart Components for React
export const ChartContainer = ({ children, className = '' }) => (
  <div className={`glass-surface rounded-xl p-6 ${className}`}>
    {children}
  </div>
);

export const ChartTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-white mb-4 ${className}`}>
    {children}
  </h3>
);

export const ChartLegend = ({ items, className = '' }) => (
  <div className={`flex flex-wrap gap-4 mt-4 ${className}`}>
    {items.map((item, index) => (
      <div key={index} className="flex items-center space-x-2">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: item.color }}
        />
        <span className="text-sm text-muted">{item.label}</span>
      </div>
    ))}
  </div>
);

// Gradient Definitions for SVG - Clean iOS-like Colors
export const ChartGradients = () => (
  <defs>
    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="rgba(88, 86, 214, 0.3)" />
      <stop offset="100%" stopColor="rgba(88, 86, 214, 0.05)" />
    </linearGradient>
    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#5856D6" />
      <stop offset="100%" stopColor="#4846C6" />
    </linearGradient>
    <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#34C759" />
      <stop offset="100%" stopColor="#30D158" />
    </linearGradient>
    <linearGradient id="dangerGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FF3B30" />
      <stop offset="100%" stopColor="#E53935" />
    </linearGradient>
    <linearGradient id="primaryGradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#5856D6" />
      <stop offset="100%" stopColor="#34C759" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#5856D6" />
      <stop offset="100%" stopColor="#34C759" />
    </linearGradient>
  </defs>
);

// Chart Animation Configuration
export const chartAnimations = {
  duration: 1000,
  easing: 'ease-out',
  delay: 100,
  stagger: 50
};

// Responsive Chart Configuration
export const responsiveConfig = {
  mobile: {
    height: 200,
    margin: { top: 20, right: 20, bottom: 20, left: 20 }
  },
  tablet: {
    height: 300,
    margin: { top: 30, right: 30, bottom: 30, left: 30 }
  },
  desktop: {
    height: 400,
    margin: { top: 40, right: 40, bottom: 40, left: 40 }
  }
};

export default {
  rechartsConfig,
  chartJsConfig,
  tradingViewConfig,
  ChartContainer,
  ChartTitle,
  ChartLegend,
  ChartGradients,
  chartAnimations,
  responsiveConfig
};
