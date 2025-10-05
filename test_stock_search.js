// Test script for the stock search API
const testStockSearch = async () => {
  const testCases = [
    'Apple',
    'TCS',
    'AAPL',
    'Tesla',
    'Reliance',
    'Microsoft',
    'Infosys',
    'GOOGL',
    'InvalidCompany'
  ];

  console.log('🧪 Testing Stock Search API...\n');

  for (const query of testCases) {
    try {
      console.log(`Testing: "${query}"`);
      
      const response = await fetch('http://localhost:3000/api/searchStocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Found: ${data.name} (${data.symbol})`);
        console.log(`   Price: ${data.priceFormatted}`);
        console.log(`   Exchange: ${data.exchange}`);
        console.log(`   Currency: ${data.currency}`);
        console.log(`   Change: ${data.changePercent.toFixed(2)}%`);
      } else {
        const error = await response.json();
        console.log(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }
    console.log('---');
  }
};

// Run the test
testStockSearch().catch(console.error);
