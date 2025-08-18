import type { UIMessage } from 'ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Clock, AlertCircle, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'error';

export interface ExtendedUIMessage extends UIMessage {
  status?: MessageStatus;
}

interface MessageListProps {
  messages: ExtendedUIMessage[];
}

function MessageAvatar({ role }: { role: string }) {
  return (
    <div className={cn(
      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
      role === 'user' 
        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
        : 'bg-gradient-to-br from-purple-500 to-indigo-600'
    )}>
      {role === 'user' ? (
        <User className="w-4 h-4 text-white" />
      ) : (
        <Bot className="w-4 h-4 text-white" />
      )}
    </div>
  );
}

function MessageStatusIcon({ status, role }: { status?: MessageStatus; role: string }) {
  // Only show status for user messages
  if (role !== 'user' || !status) return null;

  const iconConfig = {
    sending: {
      icon: Clock,
      className: 'text-gray-400',
      label: 'Sending message'
    },
    sent: {
      icon: Check,
      className: 'text-gray-400',
      label: 'Message sent'
    },
    delivered: {
      icon: CheckCheck,
      className: 'text-blue-400',
      label: 'Message delivered'
    },
    error: {
      icon: AlertCircle,
      className: 'text-red-400',
      label: 'Failed to send'
    }
  };

  const config = iconConfig[status];
  const IconComponent = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-end mt-1" 
      aria-label={config.label}
    >
      <IconComponent className={cn('h-3 w-3', config.className)} />
    </motion.div>
  );
}

function MessageBubble({ message, index }: { message: ExtendedUIMessage; index: number }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      className={cn(
        'flex gap-3 max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar */}
      <MessageAvatar role={message.role} />
      
      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Message Bubble */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'message-bubble relative',
            isUser 
              ? 'message-bubble-user' 
              : 'message-bubble-assistant'
          )}
        >
          {message.role === 'assistant' ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({inline, children, ...props}) => {
                    if (inline) {
                      return (
                        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                        <code className="text-sm font-mono" {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({children}) => <ul className="mb-2 last:mb-0 ml-4">{children}</ul>,
                  ol: ({children}) => <ol className="mb-2 last:mb-0 ml-4">{children}</ol>,
                  li: ({children}) => <li className="mb-1">{children}</li>,
                }}
              >
                {/* V5 uses parts array - extract text parts */}
                {message.parts
                  ?.filter(part => part.type === 'text')
                  .map(part => part.text)
                  .join('') || ''}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-white">
              <p className="whitespace-pre-wrap leading-relaxed">
                {/* User messages also use parts in v5 */}
                {message.parts
                  ?.filter(part => part.type === 'text')
                  .map(part => part.text)
                  .join('') || ''}
              </p>
            </div>
          )}
        </motion.div>
        
        {/* Status Icon and Timestamp */}
        <div className={cn(
          'flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          {/* Timestamp */}
          <span>
            {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          
          {/* Status Icon */}
          <MessageStatusIcon status={message.status} role={message.role} />
        </div>
      </div>
    </motion.div>
  );
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          index={index}
        />
      ))}
    </div>
  );
}