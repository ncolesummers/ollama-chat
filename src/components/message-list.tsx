import type { UIMessage } from 'ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: UIMessage[];
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
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {/* V5 uses parts array - extract text parts */}
                  {message.parts
                    ?.filter(part => part.type === 'text')
                    .map(part => part.text)
                    .join('') || ''}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">
                {/* User messages also use parts in v5 */}
                {message.parts
                  ?.filter(part => part.type === 'text')
                  .map(part => part.text)
                  .join('') || ''}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}