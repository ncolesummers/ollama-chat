import { streamText, convertToCoreMessages } from 'ai';
import { getOllamaModel } from '@/lib/ollama/provider';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;
    
    // Get model from last message metadata or default
    const lastMessage = messages[messages.length - 1];
    const modelId = lastMessage?.metadata?.model || 'llama3.2';
    
    const model = getOllamaModel(modelId);
    
    const result = streamText({
      model,
      messages: convertToCoreMessages(messages),
      temperature: 0.7,
    });

    // V5 uses toUIMessageStreamResponse for proper message formatting
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}