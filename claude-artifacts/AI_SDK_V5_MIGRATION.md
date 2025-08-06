# AI SDK v5 Migration Design Document

## Overview

This document outlines the complete redesign of our chat component to work with Vercel AI SDK v5. The v5 SDK introduces significant changes including:
- Built-in input state management in `useChat`
- New message structure with `parts` array
- `toUIMessageStreamResponse()` for API responses
- Status management ('ready', 'submitted', 'streaming')

## Key Differences from Our Current Implementation

### Current Issues
1. ❌ We manually manage input state (v5 provides it)
2. ❌ Using `sendMessage` (should use `handleSubmit`)
3. ❌ API returns `toTextStreamResponse()` (should be `toUIMessageStreamResponse()`)
4. ❌ Message rendering expects `content` (v5 uses `parts`)

### V5 Improvements
1. ✅ Built-in input management with `input` and `handleInputChange`
2. ✅ Form-based submission with `handleSubmit`
3. ✅ Proper streaming response format
4. ✅ Support for multi-part messages (text, images, tool calls)

## Component Architecture

### 1. Chat Component Structure

```typescript
// src/components/chat.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { ModelSelector } from './model-selector';

export function Chat() {
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  
  // V5 useChat provides input management
  const { 
    messages, 
    input, 
    handleSubmit, 
    handleInputChange, 
    status,
    stop,
    error
  } = useChat({
    // Default endpoint is /api/chat
    body: {
      // Send model selection with each request
      model: selectedModel,
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ollama Chat</h1>
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>

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

### 2. Message List Component

```typescript
// src/components/message-list.tsx
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
                {/* V5 uses parts array - extract text parts */}
                {message.parts
                  .filter(part => part.type === 'text')
                  .map(part => part.text)
                  .join('')}
              </ReactMarkdown>
            ) : (
              <p className="whitespace-pre-wrap">
                {/* User messages also use parts in v5 */}
                {message.parts
                  .filter(part => part.type === 'text')
                  .map(part => part.text)
                  .join('')}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 3. Chat Input Component

```typescript
// src/components/chat-input.tsx
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
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
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

### 4. API Route Update

```typescript
// src/app/api/chat/route.ts
import { streamText, convertToCoreMessages } from 'ai';
import { getOllamaModel } from '@/lib/ollama/provider';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, model: modelId = 'llama3.2' } = await req.json();

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
```

## Migration Checklist

### Components to Update

- [x] **Chat Component**
  - Remove manual input state management
  - Use built-in `input` and `handleInputChange` from `useChat`
  - Update status checking (use `status` property)
  - Pass model in body configuration

- [x] **Message List**
  - Update to handle `parts` array instead of `content`
  - Support different part types (text, tool-invocation, file)

- [x] **Chat Input**
  - Use provided `handleSubmit` directly
  - Fix form submission for Enter key

- [x] **API Route**
  - Change `toTextStreamResponse()` to `toUIMessageStreamResponse()`
  - Ensure proper message conversion

### Testing Points

1. **Basic Chat Flow**
   - Message sending and receiving
   - Streaming responses
   - Stop generation functionality

2. **Model Selection**
   - Model switching persistence
   - Correct model usage in API

3. **UI/UX**
   - Auto-scroll behavior
   - Loading states
   - Error handling
   - Keyboard shortcuts

4. **Edge Cases**
   - Empty messages
   - Long messages
   - Network interruptions
   - Ollama server disconnection

## Implementation Strategy

### Phase 1: Core Updates
1. Update chat component to use v5 `useChat` API
2. Fix message rendering for parts structure
3. Update API route response method

### Phase 2: Testing
1. Test basic chat functionality
2. Verify streaming works correctly
3. Test model switching

### Phase 3: Polish
1. Add error toast notifications
2. Improve loading states
3. Add message regeneration support

## Benefits of V5

1. **Simpler State Management**: No need for manual input state
2. **Better Type Safety**: Full TypeScript support
3. **Richer Messages**: Support for multi-part messages
4. **Status Tracking**: Clear status states for better UX
5. **Built-in Features**: Stop, regenerate, and error handling

## Potential Issues and Solutions

### Issue 1: Message Parts Compatibility
**Problem**: Ollama responses might not format correctly as parts
**Solution**: Ensure proper text extraction in message rendering

### Issue 2: Model Switching
**Problem**: Model changes might not apply to ongoing conversations
**Solution**: Pass model in body configuration for each request

### Issue 3: Error Handling
**Problem**: Errors might not display properly
**Solution**: Add toast notifications and error boundary

## Conclusion

The migration to AI SDK v5 simplifies our implementation by:
- Removing manual state management
- Providing better TypeScript support
- Offering built-in streaming and status management
- Supporting richer message formats

The updated architecture is cleaner, more maintainable, and aligns with the latest AI SDK best practices.