import { getAvailableModels } from '@/lib/ollama/provider';

export async function GET() {
  try {
    const models = await getAvailableModels();
    return Response.json({ models });
  } catch (error) {
    console.error('Models API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}