import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="message-bubble message-bubble-assistant flex items-center gap-2 min-h-[3rem]">
      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      
      <div className="flex flex-col gap-1">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          AI is thinking...
        </div>
        
        <div className="typing-indicator">
          <motion.div
            className="typing-dot bg-gray-400"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: 0
            }}
          />
          <motion.div
            className="typing-dot bg-gray-400"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: 0.2
            }}
          />
          <motion.div
            className="typing-dot bg-gray-400"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: 0.4
            }}
          />
        </div>
      </div>
    </div>
  );
}