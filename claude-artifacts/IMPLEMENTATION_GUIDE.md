# Ollama Chat Bot - Implementation Guide

## Quick Start

This guide will walk you through implementing the Ollama chat bot using the forked `ollama-ai-provider` package with Next.js 15 and the Vercel AI SDK.

## Prerequisites

1. **Ollama Installation** (>= 0.5.0)
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Verify installation
   ollama --version
   ```

2. **Pull Required Models**
   ```bash
   # Essential models
   ollama pull llama3.3
   ollama pull mistral
   
   # Optional models
   ollama pull gemma2
   ollama pull qwen2.5
   ollama pull deepseek-r1
   ollama pull phi3
   
   # Vision models (optional)
   ollama pull llava
   ollama pull llama3.2-vision
   ```

3. **Start Ollama Server**
   ```bash
   ollama serve
   # Server runs on http://localhost:11434
   ```

## Step 1: Project Setup

### Initialize Next.js Project

```bash
# Create new Next.js app with TypeScript
npx create-next-app@latest ollama-chat --typescript --tailwind --app --eslint
cd ollama-chat

# Install core dependencies
npm install ai@latest @ai-sdk/react@latest ollama-ai-provider

# Install UI dependencies
npm install react-markdown remark-gfm sonner classnames framer-motion
npm install @radix-ui/react-select @radix-ui/react-tooltip
npm install lucide-react

# Install dev dependencies
npm install -D @types/react @types/node
```

### Environment Configuration

Create `.env.local`:
```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434/api
NEXT_PUBLIC_APP_NAME=Ollama Chat

# Optional: Default model
DEFAULT_MODEL=llama3.3
```

## Step 2: Core Provider Setup

### Create Ollama Provider

```typescript
// lib/ollama/provider.ts
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

// Provider configuration
const ollamaConfig = {
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api',
};

// Create model instances
export const getOllamaModel = (modelId: string) => {
  const model = modelConfig[modelId];
  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }
  
  return ollama(modelId + ':latest', ollamaConfig);
};

// Get available models from Ollama server
export async function getAvailableModels(): Promise<OllamaModel[]> {
  try {
    const response = await fetch(`${ollamaConfig.baseURL}/tags`);
    const data = await response.json();
    
    return data.models
      .map((m: any) => modelConfig[m.name.split(':')[0]])
      .filter(Boolean);
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return Object.values(modelConfig);
  }
}
```

## Step 3: API Implementation

### Chat Streaming Endpoint

```typescript
// app/api/chat/route.ts
import { streamText, convertToCoreMessages } from 'ai';
import { getOllamaModel } from '@/lib/ollama/provider';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, model: modelId = 'llama3.3' } = await req.json();

    const model = getOllamaModel(modelId);
    
    const result = streamText({
      model,
      messages: convertToCoreMessages(messages),
      temperature: 0.7,
      maxTokens: 4096,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

### Models Endpoint

```typescript
// app/api/models/route.ts
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
```

## Step 4: UI Components

### Main Chat Component

```typescript
// components/chat.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { ModelSelector } from './model-selector';
import { toast } from 'sonner';

export function Chat() {
  const [selectedModel, setSelectedModel] = useState('llama3.3');
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    reload,
  } = useChat({
    api: '/api/chat',
    body: {
      model: selectedModel,
    },
    onError: (error) => {
      toast.error('Failed to send message. Please try again.');
      console.error('Chat error:', error);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ollama Chat</h1>
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          onStop={stop}
        />
      </div>
    </div>
  );
}
```

### Message Display Component

```typescript
// components/message-list.tsx
import { Message } from 'ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          <div
            className={cn(
              'max-w-[80%] rounded-lg px-4 py-2',
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800'
            )}
          >
            {message.role === 'assistant' ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose prose-sm dark:prose-invert max-w-none"
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Input Component

```typescript
// components/chat-input.tsx
import { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onStop: () => void;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  onStop,
}: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="flex-1 resize-none rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={1}
        disabled={isLoading}
      />
      {isLoading ? (
        <button
          type="button"
          onClick={onStop}
          className="rounded-lg bg-red-500 p-3 text-white hover:bg-red-600"
        >
          <Square className="h-5 w-5" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-lg bg-blue-500 p-3 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      )}
    </form>
  );
}
```

### Model Selector Component

```typescript
// components/model-selector.tsx
import { useEffect, useState } from 'react';
import { OllamaModel } from '@/lib/ollama/provider';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      const data = await response.json();
      setModels(data.models);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={selectedModel}
      onChange={(e) => onModelChange(e.target.value)}
      disabled={loading}
      className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {loading ? (
        <option>Loading models...</option>
      ) : (
        models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))
      )}
    </select>
  );
}
```

## Step 5: Utility Functions

### Class Name Utility

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Step 6: App Layout

### Root Layout

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ollama Chat',
  description: 'Chat with local LLMs using Ollama',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

### Main Page

```typescript
// app/page.tsx
import { Chat } from '@/components/chat';

export default function Home() {
  return <Chat />;
}
```

## Step 7: Styling

### Global Styles

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}

@layer components {
  .prose pre {
    @apply bg-gray-100 dark:bg-gray-800 rounded-lg p-4;
  }
  
  .prose code {
    @apply bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-400 dark:bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500 dark:bg-gray-500;
}
```

## Step 8: Package Configuration

### Update package.json

```json
{
  "name": "ollama-chat",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@ai-sdk/react": "latest",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tooltip": "^1.0.0",
    "ai": "latest",
    "classnames": "^2.5.1",
    "clsx": "^2.1.0",
    "framer-motion": "^12.0.0",
    "lucide-react": "^0.350.0",
    "next": "15.1.7",
    "ollama-ai-provider": "latest",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "sonner": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "15.1.7",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

## Step 9: Running the Application

### Development Mode

```bash
# Start Ollama server (if not already running)
ollama serve

# In another terminal, start the Next.js dev server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Step 10: Testing & Validation

### Manual Testing Checklist

1. **Basic Chat Flow**
   - [ ] Send a simple message
   - [ ] Receive streaming response
   - [ ] Stop generation mid-stream
   - [ ] Send follow-up messages

2. **Model Switching**
   - [ ] Switch between models
   - [ ] Verify model list loads
   - [ ] Test different model capabilities

3. **Error Handling**
   - [ ] Test with Ollama server down
   - [ ] Test with invalid model
   - [ ] Test network interruptions

4. **UI/UX**
   - [ ] Auto-scroll works
   - [ ] Markdown rendering
   - [ ] Keyboard shortcuts (Enter to send)
   - [ ] Responsive design on mobile

## Advanced Features

### Adding Vision Support

```typescript
// components/image-upload.tsx
import { useState } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (image: string) => void;
}

export function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <label className="cursor-pointer">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <Upload className="h-5 w-5" />
    </label>
  );
}
```

### Adding Conversation History

```typescript
// lib/hooks/use-local-storage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue] as const;
}
```

## Troubleshooting

### Common Issues

1. **Ollama server not responding**
   ```bash
   # Check if Ollama is running
   curl http://localhost:11434/api/tags
   
   # Restart Ollama
   ollama serve
   ```

2. **Model not found**
   ```bash
   # Pull the required model
   ollama pull llama3.3
   
   # List available models
   ollama list
   ```

3. **Streaming not working**
   - Ensure you're using the Edge runtime
   - Check browser console for errors
   - Verify API endpoint is correct

4. **CORS issues**
   - Add proper headers in API routes
   - Check Ollama CORS configuration

## Next Steps

1. **Add Features**
   - Conversation persistence
   - Export chat history
   - Custom system prompts
   - Temperature/parameter controls

2. **Optimize Performance**
   - Implement message virtualization
   - Add response caching
   - Optimize bundle size

3. **Enhance UX**
   - Add typing indicators
   - Implement message reactions
   - Add code syntax highlighting
   - Support file uploads

4. **Deploy**
   - Configure for production
   - Set up monitoring
   - Add analytics
   - Create documentation

## Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [ollama-ai-provider GitHub](https://github.com/platformshape/ollama-ai-provider)