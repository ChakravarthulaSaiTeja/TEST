import { NextRequest, NextResponse } from 'next/server';

interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  price: number;
  priceFormatted: string;
  marketCap: number;
  volume: number;
  peRatio: number;
  changePercent: number;
  previousClose: number;
  change: number;
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim().toLowerCase();
    
    if (!trimmedQuery) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    // Search for the stock using yfinance-like approach
    const stockData = await searchStockData(trimmedQuery);
    
    if (!stockData) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(stockData);
  } catch (error) {
    console.error('Stock search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function searchStockData(query: string): Promise<StockSearchResult | null> {
  try {
    // Common stock mappings for better search
    const stockMappings: { [key: string]: string } = {
      // Indian stocks
      'tcs': 'TCS.NS',
      'tata consultancy': 'TCS.NS',
      'reliance': 'RELIANCE.NS',
      'reliance industries': 'RELIANCE.NS',
      'infosys': 'INFY.NS',
      'infy': 'INFY.NS',
      'wipro': 'WIPRO.NS',
      'hdfc': 'HDFCBANK.NS',
      'hdfc bank': 'HDFCBANK.NS',
      'icici': 'ICICIBANK.NS',
      'icici bank': 'ICICIBANK.NS',
      'sbi': 'SBIN.NS',
      'state bank': 'SBIN.NS',
      'bajaj finance': 'BAJFINANCE.NS',
      'tata motors': 'TATAMOTORS.NS',
      'mahindra': 'M&M.NS',
      'itc': 'ITC.NS',
      'hindalco': 'HINDALCO.NS',
      'coal india': 'COALINDIA.NS',
      'bharti airtel': 'BHARTIARTL.NS',
      'asian paints': 'ASIANPAINT.NS',
      'maruti': 'MARUTI.NS',
      'hero motocorp': 'HEROMOTOCO.NS',
      'bajaj auto': 'BAJAJ-AUTO.NS',
      'ultratech cement': 'ULTRACEMCO.NS',
      'nestle': 'NESTLEIND.NS',
      'hul': 'HINDUNILVR.NS',
      'hindustan unilever': 'HINDUNILVR.NS',
      'cipla': 'CIPLA.NS',
      'sun pharma': 'SUNPHARMA.NS',
      'dr reddy': 'DRREDDY.NS',
      'divis': 'DIVISLAB.NS',
      'cadila': 'CADILAHC.NS',
      'lupin': 'LUPIN.NS',
      'axis bank': 'AXISBANK.NS',
      'kotak bank': 'KOTAKBANK.NS',
      'yes bank': 'YESBANK.NS',
      'pnb': 'PNB.NS',
      'union bank': 'UNIONBANK.NS',
      'canara bank': 'CANBK.NS',
      'bank of baroda': 'BANKBARODA.NS',
      
      // US stocks
      'apple': 'AAPL',
      'microsoft': 'MSFT',
      'google': 'GOOGL',
      'alphabet': 'GOOGL',
      'amazon': 'AMZN',
      'tesla': 'TSLA',
      'meta': 'META',
      'facebook': 'META',
      'netflix': 'NFLX',
      'nvidia': 'NVDA',
      'uber': 'UBER',
      'lyft': 'LYFT',
      'spotify': 'SPOT',
      'zoom': 'ZM',
      'shopify': 'SHOP',
      'paypal': 'PYPL',
      'square': 'SQ',
      'twitter': 'TWTR',
      'snap': 'SNAP',
      'salesforce': 'CRM',
      'oracle': 'ORCL',
      'intel': 'INTC',
      'cisco': 'CSCO',
      'ibm': 'IBM',
      'adobe': 'ADBE',
      'nike': 'NKE',
      'coca cola': 'KO',
      'pepsi': 'PEP',
      'walmart': 'WMT',
      'target': 'TGT',
      'home depot': 'HD',
      'lowes': 'LOW',
      'disney': 'DIS',
      'comcast': 'CMCSA',
      'verizon': 'VZ',
      'at&t': 'T',
      'att': 'T',
      'jp morgan': 'JPM',
      'bank of america': 'BAC',
      'wells fargo': 'WFC',
      'goldman sachs': 'GS',
      'morgan stanley': 'MS',
      'visa': 'V',
      'mastercard': 'MA',
      'american express': 'AXP',
      'berkshire hathaway': 'BRK-B',
      'johnson & johnson': 'JNJ',
      'pfizer': 'PFE',
      'moderna': 'MRNA',
      'boeing': 'BA',
      'general electric': 'GE',
      'ford': 'F',
      'general motors': 'GM',
      'chevron': 'CVX',
      'exxon': 'XOM',
      'shell': 'SHEL',
      'bp': 'BP',
      'procter & gamble': 'PG',
      'unilever': 'UL',
      'caterpillar': 'CAT',
      'deere': 'DE',
      '3m': 'MMM',
      'honeywell': 'HON',
      'lockheed martin': 'LMT',
      'raytheon': 'RTX',
      'northrop grumman': 'NOC',
      'general dynamics': 'GD',
      'l3harris': 'LHX',
      'booz allen': 'BAH',
      'leidos': 'LDOS',
      'caci': 'CACI',
      'manTech': 'MANT',
      'palantir': 'PLTR',
      'crowdstrike': 'CRWD',
      'zscaler': 'ZS',
      'okta': 'OKTA',
      'splunk': 'SPLK',
      'datadog': 'DDOG',
      'mongodb': 'MDB',
      'elastic': 'ESTC',
      'atlassian': 'TEAM',
      'servicenow': 'NOW',
      'workday': 'WDAY',
      'salesforce': 'CRM',
      'hubspot': 'HUBS',
      'zendesk': 'ZEN',
      'twilio': 'TWLO',
      'sendgrid': 'SEND',
      'mailchimp': 'MAIL',
      'stripe': 'STRIPE',
      'square': 'SQ',
      'paypal': 'PYPL',
      'visa': 'V',
      'mastercard': 'MA',
      'american express': 'AXP',
      'discover': 'DFS',
      'capital one': 'COF',
      'synchrony': 'SYF',
      'ally': 'ALLY',
      'citizens': 'CFG',
      'regions': 'RF',
      'comerica': 'CMA',
      'keycorp': 'KEY',
      'huntington': 'HBAN',
      'fifth third': 'FITB',
      'm&t bank': 'MTB',
      'pnc': 'PNC',
      'truist': 'TFC',
      'us bancorp': 'USB',
      'citigroup': 'C',
      'citibank': 'C',
      'hsbc': 'HSBC',
      'barclays': 'BCS',
      'deutsche bank': 'DB',
      'credit suisse': 'CS',
      'ubs': 'UBS',
      'bnp paribas': 'BNPQY',
      'societe generale': 'SCGLY',
      'ing': 'ING',
      'rabobank': 'RABO',
      'lloyds': 'LYG',
      'rbs': 'RBS',
      'standard chartered': 'SCBFF',
      'dbs': 'DBSDY',
      'ocbc': 'OVCHY',
      'uob': 'UOVEY',
      'mufg': 'MUFG',
      'mizuho': 'MFG',
      'sumitomo mitsui': 'SMFG',
      'nomura': 'NMR',
      'daiwa': 'DSEEY',
      'korea exchange bank': 'KEB',
      'shinhan': 'SHI',
      'kb financial': 'KB',
      'hana': 'HNFGF',
      'woori': 'WF',
      'industrial bank': 'IBK',
      'kookmin': 'KB',
      'hyundai': 'HYMTF',
      'samsung': 'SSNLF',
      'lg': 'LPLIY',
      'sk': 'SKM',
      'posco': 'PKX',
      'naver': 'NHNCF',
      'kakao': 'KAKAO',
      'coupang': 'CPNG',
      'baidu': 'BIDU',
      'alibaba': 'BABA',
      'tencent': 'TCEHY',
      'jd': 'JD',
      'pinduoduo': 'PDD',
      'meituan': 'MPNGF',
      'bilibili': 'BILI',
      'netease': 'NTES',
      'didi': 'DIDI',
      'xiaomi': 'XIACY',
      'huawei': 'HUAWEI',
      'oppo': 'OPPO',
      'vivo': 'VIVO',
      'oneplus': 'ONEPLUS',
      'realme': 'REALME',
      'iqoo': 'IQOO',
      'honor': 'HONOR',
      'motorola': 'MOTOROLA',
      'lenovo': 'LNVGY',
      'asus': 'ASUS',
      'acer': 'ACER',
      'msi': 'MSI',
      'gigabyte': 'GIGABYTE',
      'evga': 'EVGA',
      'corsair': 'CORSAIR',
      'razer': 'RAZER',
      'logitech': 'LOGI',
      'steelseries': 'STEELSERIES',
      'hyperx': 'HYPERX',
      'roccat': 'ROCCAT',
      'mad catz': 'MAD CATZ',
      'alienware': 'ALIENWARE',
      'origin pc': 'ORIGIN PC',
      'falcon northwest': 'FALCON NORTHWEST',
      'maingear': 'MAINGEAR',
      'ibuypower': 'IBUYPOWER',
      'cyberpowerpc': 'CYBERPOWERPC',
      'digital storm': 'DIGITAL STORM',
      'velocity micro': 'VELOCITY MICRO',
      'puget systems': 'PUGET SYSTEMS',
      'system76': 'SYSTEM76',
      'sager': 'SAGER',
      'clevo': 'CLEVO',
      'eurocom': 'EUROCOM',
      'xotic pc': 'XOTIC PC',
      'prostar': 'PROSTAR',
      'eluktronics': 'ELUKTRONICS',
      'sager': 'SAGER',
      'clevo': 'CLEVO',
      'eurocom': 'EUROCOM',
      'xotic pc': 'XOTIC PC',
      'prostar': 'PROSTAR',
      'eluktronics': 'ELUKTRONICS',
      'sager': 'SAGER',
      'clevo': 'CLEVO',
      'eurocom': 'EUROCOM',
      'xotic pc': 'XOTIC PC',
      'prostar': 'PROSTAR',
      'eluktronics': 'ELUKTRONICS',
    };

    // Try to find exact match first
    let symbol = stockMappings[query];
    
    // If no exact match, try partial matching
    if (!symbol) {
      for (const [key, value] of Object.entries(stockMappings)) {
        if (key.includes(query) || query.includes(key)) {
          symbol = value;
          break;
        }
      }
    }

    // If still no match, try direct symbol lookup
    if (!symbol) {
      // Check if it's already a valid symbol format
      const upperQuery = query.toUpperCase();
      if (/^[A-Z]{1,5}(\.[A-Z]{2})?$/.test(upperQuery)) {
        symbol = upperQuery;
      } else {
        // Try to construct symbol from query
        symbol = upperQuery.replace(/\s+/g, '');
        if (symbol.length > 5) {
          symbol = symbol.substring(0, 5);
        }
      }
    }

    if (!symbol) {
      return null;
    }

    // Fetch stock data using yfinance approach
    const stockData = await fetchStockData(symbol);
    
    if (!stockData) {
      return null;
    }

    // Determine currency based on exchange
    const isIndianStock = symbol.includes('.NS') || symbol.includes('.BO');
    const currency = isIndianStock ? 'INR' : 'USD';
    const exchange = isIndianStock ? 'NSE' : 'NYSE';

    // Format price based on currency
    const priceFormatted = formatCurrency(stockData.price, currency);

    return {
      symbol: symbol,
      name: stockData.name || symbol,
      exchange: exchange,
      currency: currency,
      price: stockData.price,
      priceFormatted: priceFormatted,
      marketCap: stockData.marketCap || 0,
      volume: stockData.volume || 0,
      peRatio: stockData.peRatio || 0,
      changePercent: stockData.changePercent || 0,
      previousClose: stockData.previousClose || stockData.price,
      change: stockData.change || 0,
    };
  } catch (error) {
    console.error('Error in searchStockData:', error);
    return null;
  }
}

async function fetchStockData(symbol: string) {
  try {
    // Call the backend StockDataService for real-time data
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/stocks/${symbol}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Backend API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    // Transform backend data to frontend format
    return {
      name: data.name,
      price: data.current_price,
      previousClose: data.current_price - data.change,
      change: data.change,
      changePercent: data.change_percent,
      volume: data.volume,
      marketCap: data.market_cap,
      peRatio: data.pe_ratio,
    };
  } catch (error) {
    console.error('Error fetching stock data from backend:', error);
    // Fallback to mock data if backend is unavailable
    const mockData = generateMockStockData(symbol);
    return mockData;
  }
}

function generateMockStockData(symbol: string) {
  const isIndianStock = symbol.includes('.NS') || symbol.includes('.BO');
  const basePrice = isIndianStock ? 
    Math.random() * 5000 + 100 : // Indian stocks: 100-5100
    Math.random() * 500 + 10;    // US stocks: 10-510

  const changePercent = (Math.random() - 0.5) * 10; // -5% to +5%
  const change = basePrice * (changePercent / 100);
  const previousClose = basePrice - change;

  return {
    name: getCompanyName(symbol),
    price: basePrice,
    previousClose: previousClose,
    change: change,
    changePercent: changePercent,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    marketCap: Math.floor(basePrice * (Math.random() * 1000000000 + 1000000000)),
    peRatio: Math.random() * 50 + 5,
  };
}

function getCompanyName(symbol: string): string {
  const companyNames: { [key: string]: string } = {
    'TCS.NS': 'Tata Consultancy Services Ltd',
    'RELIANCE.NS': 'Reliance Industries Ltd',
    'INFY.NS': 'Infosys Ltd',
    'WIPRO.NS': 'Wipro Ltd',
    'HDFCBANK.NS': 'HDFC Bank Ltd',
    'ICICIBANK.NS': 'ICICI Bank Ltd',
    'SBIN.NS': 'State Bank of India',
    'BAJFINANCE.NS': 'Bajaj Finance Ltd',
    'TATAMOTORS.NS': 'Tata Motors Ltd',
    'M&M.NS': 'Mahindra & Mahindra Ltd',
    'ITC.NS': 'ITC Ltd',
    'HINDALCO.NS': 'Hindalco Industries Ltd',
    'COALINDIA.NS': 'Coal India Ltd',
    'BHARTIARTL.NS': 'Bharti Airtel Ltd',
    'ASIANPAINT.NS': 'Asian Paints Ltd',
    'MARUTI.NS': 'Maruti Suzuki India Ltd',
    'HEROMOTOCO.NS': 'Hero MotoCorp Ltd',
    'BAJAJ-AUTO.NS': 'Bajaj Auto Ltd',
    'ULTRACEMCO.NS': 'UltraTech Cement Ltd',
    'NESTLEIND.NS': 'Nestle India Ltd',
    'HINDUNILVR.NS': 'Hindustan Unilever Ltd',
    'CIPLA.NS': 'Cipla Ltd',
    'SUNPHARMA.NS': 'Sun Pharmaceutical Industries Ltd',
    'DRREDDY.NS': 'Dr. Reddy\'s Laboratories Ltd',
    'DIVISLAB.NS': 'Divi\'s Laboratories Ltd',
    'CADILAHC.NS': 'Cadila Healthcare Ltd',
    'LUPIN.NS': 'Lupin Ltd',
    'AXISBANK.NS': 'Axis Bank Ltd',
    'KOTAKBANK.NS': 'Kotak Mahindra Bank Ltd',
    'YESBANK.NS': 'Yes Bank Ltd',
    'PNB.NS': 'Punjab National Bank',
    'UNIONBANK.NS': 'Union Bank of India',
    'CANBK.NS': 'Canara Bank',
    'BANKBARODA.NS': 'Bank of Baroda',
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'META': 'Meta Platforms Inc.',
    'NFLX': 'Netflix Inc.',
    'NVDA': 'NVIDIA Corporation',
    'UBER': 'Uber Technologies Inc.',
    'LYFT': 'Lyft Inc.',
    'SPOT': 'Spotify Technology S.A.',
    'ZM': 'Zoom Video Communications Inc.',
    'SHOP': 'Shopify Inc.',
    'PYPL': 'PayPal Holdings Inc.',
    'SQ': 'Block Inc.',
    'TWTR': 'Twitter Inc.',
    'SNAP': 'Snap Inc.',
  };

  return companyNames[symbol] || `${symbol} Corporation`;
}

function formatCurrency(value: number, currency: string): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
