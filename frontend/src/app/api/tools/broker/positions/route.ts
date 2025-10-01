import { NextRequest, NextResponse } from 'next/server';
import { createMCPClient } from '@/lib/mcpClient';

export async function GET(request: NextRequest) {
  try {
    const mcpClient = createMCPClient();
    const positions = await mcpClient.getPositions();

    return NextResponse.json({
      positions,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Positions API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch positions',
        positions: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
