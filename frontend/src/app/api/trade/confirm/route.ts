import { NextRequest, NextResponse } from 'next/server';
import { getTradePreview, removeTradePreview } from '@/lib/openai';
import { createMCPClient } from '@/lib/mcpClient';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ConfirmRequest {
  confirmationToken: string;
  userAccepts: boolean;
  mode?: 'paper' | 'live';
}

interface OrderLog {
  id: string;
  userId: string;
  symbol: string;
  side: 'buy' | 'sell';
  qty: number;
  type: 'market' | 'limit';
  limitPrice?: number;
  timeInForce: 'day' | 'gtc';
  mode: 'paper' | 'live';
  status: 'confirmed' | 'cancelled' | 'filled' | 'rejected';
  previewParams: any;
  acceptance: boolean;
  timestamp: string;
  rationale: string;
  orderResult?: any;
  error?: string;
}

// Rate limiting: 1 confirmation per 3 seconds per user
const userLastConfirmation = new Map<string, number>();
const CONFIRMATION_COOLDOWN = 3000; // 3 seconds

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmRequest = await request.json();
    const { confirmationToken, userAccepts, mode = 'paper' } = body;

    if (!confirmationToken) {
      return NextResponse.json({ error: 'Confirmation token is required' }, { status: 400 });
    }

    // Get user ID from headers or session (simplified for demo)
    const userId = request.headers.get('x-user-id') || 'demo-user';

    // Rate limiting check
    const lastConfirmation = userLastConfirmation.get(userId);
    if (lastConfirmation && Date.now() - lastConfirmation < CONFIRMATION_COOLDOWN) {
      return NextResponse.json(
        { error: 'Please wait before confirming another trade' },
        { status: 429 }
      );
    }

    // Get trade preview
    const preview = getTradePreview(confirmationToken);
    if (!preview) {
      return NextResponse.json(
        { error: 'Invalid or expired confirmation token' },
        { status: 400 }
      );
    }

    // Verify user owns this preview
    if (preview.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to trade preview' },
        { status: 403 }
      );
    }

    // Check if preview is expired (1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    if (preview.timestamp < oneHourAgo) {
      removeTradePreview(confirmationToken);
      return NextResponse.json(
        { error: 'Trade preview has expired' },
        { status: 400 }
      );
    }

    // Update rate limiting
    userLastConfirmation.set(userId, Date.now());

    // Create order log entry
    const orderLog: OrderLog = {
      id: `order_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      userId,
      symbol: preview.preview.symbol,
      side: preview.preview.side,
      qty: preview.preview.qty,
      type: preview.preview.type,
      limitPrice: preview.preview.limitPrice,
      timeInForce: preview.preview.timeInForce,
      mode,
      status: userAccepts ? 'confirmed' : 'cancelled',
      previewParams: preview.preview,
      acceptance: userAccepts,
      timestamp: new Date().toISOString(),
      rationale: preview.preview.rationale_inputs || 'No rationale provided',
      orderResult: null,
      error: null,
    };

    let result;

    if (userAccepts) {
      try {
        // Execute the trade via MCP
        const mcpClient = createMCPClient();
        
        const orderParams = {
          symbol: preview.preview.symbol,
          side: preview.preview.side,
          qty: preview.preview.qty,
          type: preview.preview.type,
          limitPrice: preview.preview.limitPrice,
          timeInForce: preview.preview.timeInForce,
          mode,
        };

        const orderResult = await mcpClient.placeOrder(orderParams);
        
        orderLog.status = orderResult.status === 'filled' ? 'filled' : 'confirmed';
        orderLog.orderResult = orderResult;

        result = {
          status: orderResult.status,
          order: orderResult,
          message: `Trade ${orderResult.status === 'filled' ? 'executed' : 'submitted'} successfully`,
        };

      } catch (error) {
        console.error('Trade execution error:', error);
        orderLog.status = 'rejected';
        orderLog.error = error instanceof Error ? error.message : 'Unknown error';

        result = {
          status: 'rejected',
          error: error instanceof Error ? error.message : 'Trade execution failed',
          message: 'Trade could not be executed. Please try again.',
        };
      }
    } else {
      result = {
        status: 'cancelled',
        message: 'Trade cancelled by user',
      };
    }

    // Log the trade attempt
    await logTradeAttempt(orderLog);

    // Clean up the preview
    removeTradePreview(confirmationToken);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Trade confirmation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function logTradeAttempt(orderLog: OrderLog): Promise<void> {
  try {
    // Try to log to database first (if backend is available)
    await logToDatabase(orderLog);
  } catch (error) {
    console.error('Database logging failed, using file fallback:', error);
    // Fallback to local JSON file
    await logToFile(orderLog);
  }
}

async function logToDatabase(orderLog: OrderLog): Promise<void> {
  try {
    // Attempt to log to the FastAPI backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    const response = await fetch(`${backendUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: orderLog.userId,
        symbol: orderLog.symbol,
        side: orderLog.side,
        quantity: orderLog.qty,
        order_type: orderLog.type,
        limit_price: orderLog.limitPrice,
        time_in_force: orderLog.timeInForce,
        mode: orderLog.mode,
        status: orderLog.status,
        rationale: orderLog.rationale,
        order_result: orderLog.orderResult,
        error_message: orderLog.error,
        created_at: orderLog.timestamp,
      }),
    });

    if (!response.ok) {
      throw new Error(`Database logging failed: ${response.status}`);
    }
  } catch (error) {
    throw error; // Re-throw to trigger file fallback
  }
}

async function logToFile(orderLog: OrderLog): Promise<void> {
  try {
    const logsDir = join(process.cwd(), 'logs');
    const logFile = join(logsDir, 'orders.json');

    // Ensure logs directory exists
    if (!existsSync(logsDir)) {
      const fs = require('fs');
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Read existing logs
    let logs: OrderLog[] = [];
    if (existsSync(logFile)) {
      try {
        const existingData = readFileSync(logFile, 'utf8');
        logs = JSON.parse(existingData);
      } catch (error) {
        console.error('Error reading existing logs:', error);
        logs = [];
      }
    }

    // Add new log entry
    logs.push(orderLog);

    // Keep only last 1000 entries to prevent file from growing too large
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    // Write back to file
    writeFileSync(logFile, JSON.stringify(logs, null, 2));

  } catch (error) {
    console.error('File logging failed:', error);
    // If even file logging fails, at least log to console
    console.log('Trade attempt:', orderLog);
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
    },
  });
}
