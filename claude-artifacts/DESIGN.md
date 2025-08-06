# Ollama Chat Bot - System Design Document

## Executive Summary

A modern, real-time chat application leveraging the Ollama Community Provider for local LLM inference. Built with Next.js 15, TypeScript, and the Vercel AI SDK, this system provides a responsive, streaming chat experience with support for multiple Ollama models.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│                 │     │                  │     │              │
│  Browser Client ├────►│  Next.js Server  ├────►│ Ollama Local │
│  (React + AI    │◄────┤  (API Routes +   │◄────┤   Server     │
│   SDK React)    │     │   Streaming)     │     │  (Port 11434)│
│                 │     │                  │     │              │
└─────────────────┘     └──────────────────┘     └──────────────┘
      WebSocket              HTTP/SSE                  HTTP
```

### Technology Stack

```yaml
Frontend:
  Framework: Next.js 15.1.7 (App Router)
  Language: TypeScript 5.x
  UI Library: React 19.0.0
  Styling: Tailwind CSS 3.4.1
  State Management: React Hooks + AI SDK React Hooks
  
Backend:
  Runtime: Node.js (via Next.js)
  API: Next.js API Routes
  AI Integration: Vercel AI SDK + ollama-ai-provider (forked)
  Streaming: Server-Sent Events (SSE)
  
AI/LLM:
  Provider: ollama-ai-provider (platformshape fork)
  Models: llama3.3, mistral, gemma2, qwen2.5, deepseek-r1, phi3, llava (vision)
  Inference: Local Ollama server (>= 0.5.0)
  Protocol: HTTP REST API
  Special Features: Vision support, tool usage, streaming
```

### Directory Structure

```
ollama-chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts         # Streaming chat endpoint
│   ├── layout.tsx               # Root layout with theming
│   ├── page.tsx                 # Main chat interface
│   └── globals.css              # Global styles
│
├── components/
│   ├── chat/
│   │   ├── chat.tsx            # Main chat container
│   │   ├── message-list.tsx    # Message display component
│   │   ├── message.tsx         # Individual message component
│   │   └── input.tsx           # Chat input component
│   ├── ui/
│   │   ├── button.tsx          # Reusable button component
│   │   ├── select.tsx          # Model selector component
│   │   ├── textarea.tsx        # Auto-resizing textarea
│   │   └── icons.tsx           # SVG icon components
│   └── layout/
│       ├── header.tsx          # App header with model selector
│       └── footer.tsx          # Footer with status info
│
├── lib/
│   ├── ollama/
│   │   ├── provider.ts         # Ollama provider configuration
│   │   ├── models.ts           # Model definitions and metadata
│   │   └── client.ts           # Ollama API client wrapper
│   ├── hooks/
│   │   ├── use-chat.ts         # Extended chat hook
│   │   └── use-local-storage.ts # Persist settings
│   └── utils/
│       ├── cn.ts               # Class name utility
│       └── format.ts           # Message formatting helpers
│
├── types/
│   ├── chat.ts                 # Chat-related type definitions
│   └── ollama.ts              # Ollama-specific types
│
└── public/
    └── icons/                  # Static icon assets
```

## Component Design

### Core Components

#### 1. Chat Container Component

```typescript
interface ChatProps {
  initialMessages?: Message[];
  modelId?: string;
  onModelChange?: (modelId: string) => void;
}

interface ChatState {
  messages: Message[];
  input: string;
  isLoading: boolean;
  error: Error | null;
  selectedModel: OllamaModel;
}

// Key responsibilities:
// - Message state management via useChat hook
// - Model selection and switching
// - Error handling and recovery
// - Stream status management
```

#### 2. Message Component

```typescript
interface MessageProps {
  message: Message;
  isStreaming?: boolean;
  onRetry?: () => void;
  onEdit?: (content: string) => void;
}

// Features:
// - Markdown rendering with syntax highlighting
// - Copy to clipboard functionality
// - Edit/retry actions
// - Timestamp display
// - Avatar and role indicators
```

#### 3. Input Component

```typescript
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  maxLength?: number;
}

// Features:
// - Auto-resize based on content
// - Keyboard shortcuts (Enter to send, Shift+Enter for newline)
// - Character counter
// - Loading state with disabled interaction
// - Stop generation button during streaming
```

#### 4. Model Selector Component

```typescript
interface ModelSelectorProps {
  models: OllamaModel[];
  selectedModel: string;
  onChange: (modelId: string) => void;
  isLoading?: boolean;
}

interface OllamaModel {
  id: string;
  name: string;
  description?: string;
  contextLength: number;
  capabilities: string[];
  isAvailable: boolean;
}

// Features:
// - Dynamic model list from Ollama API
// - Model availability checking
// - Grouped by capability (chat, code, reasoning)
// - Quick model switching without losing context
```

### UI Component Library

```typescript
// Shared UI components following shadcn/ui patterns
export const Button: React.FC<ButtonProps>
export const Select: React.FC<SelectProps>
export const Textarea: React.FC<TextareaProps>
export const Card: React.FC<CardProps>
export const Avatar: React.FC<AvatarProps>
export const Tooltip: React.FC<TooltipProps>
export const ScrollArea: React.FC<ScrollAreaProps>
export const Skeleton: React.FC<SkeletonProps>
```

## API Design

### Chat Streaming Endpoint

```typescript
// POST /api/chat
interface ChatRequest {
  messages: Message[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  stream?: boolean;
}

interface ChatResponse {
  // Streaming response using Server-Sent Events
  event: 'message' | 'error' | 'done';
  data: {
    content?: string;
    role?: 'assistant' | 'system';
    error?: string;
    finishReason?: string;
  };
}

// Implementation pattern:
export async function POST(req: Request) {
  const { messages, model, ...options } = await req.json();
  
  const stream = streamText({
    model: ollama(model),
    messages: convertToCoreMessages(messages),
    ...options
  });
  
  return stream.toDataStreamResponse();
}
```

### Model Management Endpoints

```typescript
// GET /api/models
interface ModelsResponse {
  models: OllamaModel[];
  defaultModel: string;
}

// GET /api/models/:id/status
interface ModelStatusResponse {
  isAvailable: boolean;
  isLoaded: boolean;
  memoryUsage?: number;
}

// POST /api/models/:id/load
interface LoadModelResponse {
  success: boolean;
  message?: string;
}
```

## Data Flow

### Message Flow Architecture

```
1. User Input
   ↓
2. Input Component (validation, formatting)
   ↓
3. Chat Hook (sendMessage)
   ↓
4. API Route (/api/chat)
   ↓
5. Ollama Provider (model selection, prompt formatting)
   ↓
6. Ollama Server (inference)
   ↓
7. Streaming Response (SSE)
   ↓
8. Chat Hook (message updates)
   ↓
9. UI Re-render (optimistic updates)
```

### State Management Flow

```typescript
// Client-side state synchronization
const useChat = () => {
  // Core message state
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  
  // Error state
  const [error, setError] = useState<Error | null>(null);
  
  // Optimistic updates
  const addOptimisticMessage = (content: string) => {
    const tempMessage = { id: generateId(), role: 'user', content };
    setMessages(prev => [...prev, tempMessage]);
    return tempMessage.id;
  };
  
  // Stream handling
  const handleStream = async (response: Response) => {
    const reader = response.body?.getReader();
    // ... streaming logic
  };
};
```

## Ollama Integration

### Provider Configuration

```typescript
// lib/ollama/provider.ts
import { ollama } from 'ollama-ai-provider';

// Configuration with the forked provider
const ollamaConfig = {
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api',
  headers: {}, // Optional custom headers
};

// Model instances using the forked provider
export const models = {
  'llama3.3': ollama('llama3.3:latest', ollamaConfig),
  'mistral': ollama('mistral:latest', ollamaConfig),
  'gemma2': ollama('gemma2:latest', ollamaConfig),
  'qwen2.5': ollama('qwen2.5:latest', ollamaConfig),
  'deepseek-r1': ollama('deepseek-r1:latest', ollamaConfig),
  'phi3': ollama('phi3:latest', ollamaConfig),
  // Vision models
  'llava': ollama('llava:latest', ollamaConfig),
  'llama3.2-vision': ollama('llama3.2-vision:latest', ollamaConfig),
};

export const getModel = (modelId: string) => {
  return models[modelId] || models['llama3.3'];
};
```

### Model Capabilities

```typescript
interface ModelCapabilities {
  'llama3.3': {
    contextLength: 128000,
    capabilities: ['chat', 'code', 'reasoning'],
    temperature: { min: 0, max: 1, default: 0.7 },
  },
  'mistral': {
    contextLength: 32000,
    capabilities: ['chat', 'code'],
    temperature: { min: 0, max: 1, default: 0.7 },
  },
  'gemma2': {
    contextLength: 8192,
    capabilities: ['chat', 'creative'],
    temperature: { min: 0, max: 1, default: 0.8 },
  },
  'qwen2.5': {
    contextLength: 32000,
    capabilities: ['chat', 'code', 'math'],
    temperature: { min: 0, max: 1, default: 0.7 },
  },
  'deepseek-r1': {
    contextLength: 64000,
    capabilities: ['reasoning', 'code', 'analysis'],
    temperature: { min: 0, max: 1, default: 0.6 },
  },
  'phi3': {
    contextLength: 128000,
    capabilities: ['chat', 'code', 'lightweight'],
    temperature: { min: 0, max: 1, default: 0.7 },
  },
  'llava': {
    contextLength: 4096,
    capabilities: ['vision', 'chat', 'image-analysis'],
    temperature: { min: 0, max: 1, default: 0.7 },
    supportsImages: true,
  },
  'llama3.2-vision': {
    contextLength: 128000,
    capabilities: ['vision', 'chat', 'reasoning', 'image-analysis'],
    temperature: { min: 0, max: 1, default: 0.7 },
    supportsImages: true,
  },
}
```

### Vision Model Integration

```typescript
// lib/ollama/vision.ts
import { ollama } from 'ollama-ai-provider';

export async function processImageWithVision(
  modelId: string,
  prompt: string,
  imageData: string | Buffer
) {
  const model = ollama(modelId);
  
  const response = await model.generate({
    prompt,
    images: [imageData], // Base64 or Buffer
  });
  
  return response;
}

// Usage in chat endpoint
export async function handleVisionMessage(
  message: string,
  attachments?: { type: string; data: string }[]
) {
  const images = attachments
    ?.filter(a => a.type.startsWith('image/'))
    .map(a => a.data);
    
  if (images?.length > 0) {
    // Use vision model for image analysis
    return processImageWithVision('llava', message, images[0]);
  }
  
  // Regular text processing
  return processTextMessage(message);
}
```

## Key Design Patterns

### 1. Streaming-First Architecture
- Server-Sent Events for real-time responses
- Optimistic UI updates for instant feedback
- Graceful degradation for non-streaming fallback

### 2. Error Resilience
- Automatic retry with exponential backoff
- Graceful error messages with actionable feedback
- Fallback to different models on failure

### 3. Performance Optimization
- Message virtualization for long conversations
- Lazy loading of message history
- Debounced input handling
- Memoized component rendering

### 4. Accessibility
- Full keyboard navigation support
- ARIA labels and roles
- Screen reader announcements for status changes
- High contrast mode support

### 5. Responsive Design
- Mobile-first approach
- Adaptive layouts for different screen sizes
- Touch-optimized interactions
- Progressive enhancement

## Security Considerations

### Input Validation
- Client-side and server-side validation
- XSS prevention through content sanitization
- Message length limits
- Rate limiting per session

### API Security
- CORS configuration for API routes
- Request validation with Zod schemas
- Environment variable management
- Secure headers (CSP, HSTS)

### Data Privacy
- Local-only inference (no external API calls)
- No message persistence by default
- Optional local storage with user consent
- Clear data management controls

## Performance Metrics

### Target Metrics
- Time to First Byte (TTFB): < 200ms
- First Token Latency: < 500ms
- Streaming Token Rate: > 20 tokens/second
- UI Response Time: < 100ms
- Memory Usage: < 100MB client-side

### Optimization Strategies
- Code splitting with dynamic imports
- Tree shaking unused dependencies
- Image optimization with Next.js Image
- Font subsetting and preloading
- CSS purging with Tailwind

## Testing Strategy

### Unit Testing
```typescript
// Component testing with React Testing Library
describe('Chat Component', () => {
  test('sends message on submit', async () => {
    // Test implementation
  });
  
  test('displays streaming responses', async () => {
    // Test implementation
  });
});
```

### Integration Testing
- API route testing with MSW
- Ollama mock server for CI/CD
- End-to-end testing with Playwright

### Performance Testing
- Lighthouse CI for performance monitoring
- Bundle size analysis
- Memory leak detection
- Load testing with k6

## Deployment Architecture

### Development Environment
```yaml
services:
  app:
    command: npm run dev
    environment:
      - OLLAMA_BASE_URL=http://localhost:11434
    ports:
      - 3000:3000
  
  ollama:
    image: ollama/ollama:latest
    ports:
      - 11434:11434
    volumes:
      - ./models:/root/.ollama/models
```

### Production Deployment
- Next.js on Vercel/Netlify (frontend)
- Ollama server on dedicated GPU instance
- Optional: Docker Compose for self-hosting
- CDN for static assets
- WebSocket support for real-time features

## Future Enhancements

### Phase 1 (MVP)
- [x] Basic chat interface
- [x] Ollama integration
- [x] Model selection
- [x] Streaming responses
- [x] Error handling

### Phase 2 (Enhanced Features)
- [ ] Conversation history
- [ ] Message search
- [ ] Export conversations
- [ ] Custom system prompts
- [ ] Temperature controls

### Phase 3 (Advanced)
- [ ] Multi-modal support (images)
- [ ] Voice input/output
- [ ] Collaborative chat rooms
- [ ] Plugin system
- [ ] RAG integration

## Implementation Checklist

### Initial Setup
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Configure Tailwind CSS with custom theme
- [ ] Set up ESLint and Prettier
- [ ] Install AI SDK and Ollama provider
- [ ] Configure environment variables

### Core Development
- [ ] Implement chat API route with streaming
- [ ] Create chat UI components
- [ ] Integrate Ollama provider
- [ ] Add model selection functionality
- [ ] Implement error handling

### Polish & Optimization
- [ ] Add loading states and skeletons
- [ ] Implement keyboard shortcuts
- [ ] Optimize bundle size
- [ ] Add accessibility features
- [ ] Write comprehensive tests

### Deployment
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment
- [ ] Deploy to hosting platform
- [ ] Set up monitoring and analytics
- [ ] Create documentation

## Conclusion

This design provides a robust, scalable foundation for an Ollama-powered chat application. The architecture leverages modern web technologies while maintaining simplicity and performance. The modular component structure and clear separation of concerns ensure maintainability and extensibility as the application grows.