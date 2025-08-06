import { ollama } from 'ollama-ai-provider';

export interface OllamaModel {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  capabilities: string[];
  supportsImages?: boolean;
}

// Model configuration
export const modelConfig: Record<string, OllamaModel> = {
  'llama3.2': {
    id: 'llama3.2',
    name: 'Llama 3.2',
    description: 'Efficient Llama model',
    contextLength: 128000,
    capabilities: ['chat', 'code'],
  },
  'llama3.3': {
    id: 'llama3.3',
    name: 'Llama 3.3',
    description: 'Latest Llama model with 128K context',
    contextLength: 128000,
    capabilities: ['chat', 'code', 'reasoning'],
  },
  'mistral': {
    id: 'mistral',
    name: 'Mistral',
    description: 'Efficient 7B model',
    contextLength: 32000,
    capabilities: ['chat', 'code'],
  },
  'gemma2': {
    id: 'gemma2',
    name: 'Gemma 2',
    description: 'Google\'s efficient model',
    contextLength: 8192,
    capabilities: ['chat', 'creative'],
  },
  'qwen2.5': {
    id: 'qwen2.5',
    name: 'Qwen 2.5',
    description: 'Alibaba\'s versatile model',
    contextLength: 32000,
    capabilities: ['chat', 'code', 'math'],
  },
  'deepseek-r1': {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    description: 'Reasoning-focused model',
    contextLength: 64000,
    capabilities: ['reasoning', 'code', 'analysis'],
  },
  'phi3': {
    id: 'phi3',
    name: 'Phi 3',
    description: 'Microsoft\'s lightweight model',
    contextLength: 128000,
    capabilities: ['chat', 'code', 'lightweight'],
  },
  'llava': {
    id: 'llava',
    name: 'LLaVA',
    description: 'Vision-language model',
    contextLength: 4096,
    capabilities: ['vision', 'chat', 'image-analysis'],
    supportsImages: true,
  },
};

// Create model instances
export const getOllamaModel = (modelId: string) => {
  const model = modelConfig[modelId];
  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }
  
  // ollama function takes model name and optional settings
  return ollama(modelId + ':latest');
};

// Get available models from Ollama server
export async function getAvailableModels(): Promise<OllamaModel[]> {
  try {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api';
    const response = await fetch(`${baseUrl}/tags`);
    const data = await response.json();
    
    // Map Ollama models to our model config
    interface OllamaApiModel {
      name: string;
      modified_at: string;
      size: number;
    }
    
    const availableModels = (data.models as OllamaApiModel[])
      .map((m) => {
        const modelName = m.name.split(':')[0];
        return modelConfig[modelName];
      })
      .filter(Boolean);
    
    // If no matching models found, return a default set
    if (availableModels.length === 0) {
      return [modelConfig['llama3.2'] || modelConfig['llama3.3']].filter(Boolean);
    }
    
    return availableModels;
  } catch (error) {
    console.error('Failed to fetch models:', error);
    // Return a default model if available
    return [modelConfig['llama3.3']].filter(Boolean);
  }
}