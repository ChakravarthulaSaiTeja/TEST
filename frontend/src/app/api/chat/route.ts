import { gateway } from "@ai-sdk/gateway";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export const runtime = "edge";

// Available models
const OPENAI_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"];
// All available Grok models
const XAI_MODELS = [
  "grok-2-vision-1212",  // Grok 2 Vision
  "grok-3-mini",         // Grok 3 Mini
  "grok-2-1212",         // Grok 2
  "grok-1",              // Grok 1
  "grok-1-vision",       // Grok 1 Vision
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model = "gpt-4o-mini" } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Determine which provider to use based on model
    const isOpenAI = OPENAI_MODELS.includes(model);
    const isXAI = XAI_MODELS.includes(model);

    let aiModel;

    if (isOpenAI) {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return NextResponse.json(
          { error: "OPENAI_API_KEY is not configured" },
          { status: 500 }
        );
      }
      // OpenAI SDK reads API key from OPENAI_API_KEY env var automatically
      aiModel = openai(model);
    } else if (isXAI) {
      const gatewayApiKey = process.env.AI_GATEWAY_API_KEY;
      if (!gatewayApiKey) {
        return NextResponse.json(
          { error: "AI_GATEWAY_API_KEY is not configured" },
          { status: 500 }
        );
      }
      // Gateway reads API key from AI_GATEWAY_API_KEY env var automatically
      aiModel = gateway.languageModel(`xai/${model}`);
    } else {
      // Default to OpenAI if model not recognized
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return NextResponse.json(
          { error: "OPENAI_API_KEY is not configured and model is not recognized" },
          { status: 500 }
        );
      }
      aiModel = openai("gpt-4o-mini");
    }

    const result = streamText({
      model: aiModel,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: typeof msg.content === "string" ? msg.content : msg.content || "",
      })),
      system: `You are a helpful AI trading assistant for a financial trading platform. You can help users with:
- Stock analysis and predictions
- Market insights and trends  
- Portfolio management advice
- Trading strategies
- Market data interpretation
- Technical analysis
- Risk assessment

Be concise, helpful, and provide actionable insights. When discussing stocks, use real data when available.`,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat request" },
      { status: 500 }
    );
  }
}

