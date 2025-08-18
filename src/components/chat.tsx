'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';

// Hook to handle client-side rendering for animations
function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
}
import { MessageList, ExtendedUIMessage } from './message-list';
import { ChatInput } from './chat-input';
import { ModelSelector } from './model-selector';
import { EmptyState } from './empty-state';
import { ErrorMessage, getErrorType } from './error-message';
import { TypingIndicator } from './typing-indicator';

export function Chat() {
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const [input, setInput] = useState('');
  const [chatError, setChatError] = useState<Error | null>(null);
  const isClient = useIsClient();
  
  // V5 stable version - manage input state ourselves
  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
  } = useChat({
    onError: (error) => {
      console.error('Chat error:', error);
      setChatError(error);
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';
  
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Clear any previous errors
    setChatError(null);
    
    try {
      // Send message with the model as metadata
      await sendMessage({
        text: input,
        metadata: {
          model: selectedModel,
        },
      });
      
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
      setChatError(error instanceof Error ? error : new Error('Failed to send message'));
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
    // Focus the textarea after setting the prompt
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      textarea?.focus();
    }, 0);
  };

  const handleRetry = () => {
    setChatError(null);
    // Retry the last message if there was one
    if (input.trim()) {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const handleErrorDismiss = () => {
    setChatError(null);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Convert messages to extended format with status
  const extendedMessages: ExtendedUIMessage[] = messages.map((message, index) => ({
    ...message,
    status: message.role === 'user' 
      ? (index === messages.length - 1 && isLoading ? 'sending' : 'delivered')
      : undefined
  }));

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Glassmorphism Header */}
      <motion.header 
        initial={isClient ? { opacity: 0, y: -20 } : false}
        animate={isClient ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="glass border-b border-white/20 dark:border-gray-700/50 p-4 flex items-center justify-between sticky top-0 z-10"
      >
        <motion.div
          initial={isClient ? { opacity: 0, x: -20 } : false}
          animate={isClient ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Ollama Chat
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              AI conversations made simple
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={isClient ? { opacity: 0, x: 20 } : false}
          animate={isClient ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </motion.div>
      </motion.header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={isClient ? { opacity: 0, scale: 0.95 } : false}
                animate={isClient ? { opacity: 1, scale: 1 } : {}}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <EmptyState onPromptSelect={handlePromptSelect} />
              </motion.div>
            ) : (
              <motion.div
                key="messages"
                initial={isClient ? { opacity: 0 } : false}
                animate={isClient ? { opacity: 1 } : {}}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <MessageList messages={extendedMessages} />
                
                {/* Typing Indicator */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-start"
                    >
                      <TypingIndicator />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Error Message */}
                <AnimatePresence>
                  {(chatError || error) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ErrorMessage
                        error={chatError || error!}
                        type={getErrorType(chatError || error!)}
                        onRetry={handleRetry}
                        onDismiss={handleErrorDismiss}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Area */}
      <motion.div 
        initial={isClient ? { opacity: 0, y: 20 } : false}
        animate={isClient ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass border-t border-white/20 dark:border-gray-700/50 p-4 backdrop-blur-xl"
      >
        <div className="max-w-4xl mx-auto">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            onStop={stop}
          />
        </div>
      </motion.div>
      </div>
    </LazyMotion>
  );
}