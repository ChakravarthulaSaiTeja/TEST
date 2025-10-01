import { NextRequest, NextResponse } from 'next/server';
import { createMCPClient } from '@/lib/mcpClient';

export async function GET(request: NextRequest) {
  try {
    const mcpClient = createMCPClient();
    const balance = await mcpClient.getBalance();

    return NextResponse.json({
      balance,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Balance API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch balance',
        balance: {
          cash: 100000,
          buyingPower: 100000,
          totalValue: 100000,
          currency: 'USD',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
