'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { ModelSelector } from './model-selector';

export function Chat() {
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const [input, setInput] = useState('');
  
  // V5 stable version - manage input state ourselves
  const {
    messages,
    sendMessage,
    status,
    stop,
  } = useChat({
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';
  
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Send message with the model as metadata
    await sendMessage({
      text: input,
      metadata: {
        model: selectedModel,
      },
    });
    
    setInput('');
  };

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