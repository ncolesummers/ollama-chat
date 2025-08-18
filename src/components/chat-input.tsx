import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Paperclip, Smile } from 'lucide-react';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate the new height based on content
    const scrollHeight = textarea.scrollHeight;
    const lineHeight = 24; // approximate line height in pixels
    const minHeight = lineHeight; // 1 row minimum
    const maxHeight = lineHeight * 8; // 8 rows maximum
    
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  // Auto-resize when input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleInputChangeWithResize = (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    // Adjust height after the input value has been updated
    setTimeout(adjustTextareaHeight, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const canSend = input.trim() && !isLoading;

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Input Container */}
      <motion.div
        className={`
          relative flex items-end gap-3 p-3 rounded-2xl transition-all duration-300
          ${isFocused 
            ? 'bg-white/90 dark:bg-gray-800/90 shadow-lg ring-2 ring-blue-500/30' 
            : 'bg-white/70 dark:bg-gray-800/70 shadow-md hover:shadow-lg'
          }
          backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50
        `}
        animate={{
          scale: isFocused ? 1.02 : 1,
          y: isFocused ? -2 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChangeWithResize}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Type your message..."
            className={`
              w-full resize-none bg-transparent rounded-xl px-4 py-3 pr-12
              text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none transition-all duration-200
              overflow-hidden min-h-[48px] max-h-[192px]
              ${isFocused ? 'placeholder-gray-400 dark:placeholder-gray-500' : ''}
            `}
            rows={1}
            disabled={isLoading}
          />
          
          {/* Character counter for long messages */}
          <AnimatePresence>
            {input.length > 500 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bottom-1 right-1 text-xs text-gray-400 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-full"
              >
                {input.length}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Attachment Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              p-2 rounded-xl transition-all duration-200
              ${isFocused || isHovered
                ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                : 'text-gray-400 dark:text-gray-600'
              }
            `}
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </motion.button>

          {/* Emoji Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              p-2 rounded-xl transition-all duration-200
              ${isFocused || isHovered
                ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                : 'text-gray-400 dark:text-gray-600'
              }
            `}
            title="Add emoji"
          >
            <Smile className="h-5 w-5" />
          </motion.button>

          {/* Send/Stop Button */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.button
                key="stop"
                type="button"
                onClick={onStop}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                title="Stop generation"
              >
                <Square className="h-5 w-5" />
              </motion.button>
            ) : (
              <motion.button
                key="send"
                type="submit"
                disabled={!canSend}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={canSend ? { scale: 1.05 } : {}}
                whileTap={canSend ? { scale: 0.95 } : {}}
                className={`
                  p-3 rounded-xl font-medium transition-all duration-200 shadow-lg
                  ${canSend
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:shadow-xl'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }
                `}
                title={canSend ? "Send message" : "Type a message to send"}
              >
                <Send className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Keyboard Shortcut Hint */}
      <AnimatePresence>
        {isFocused && !input && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-8 left-4 text-xs text-gray-400 dark:text-gray-500"
          >
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Shift + Enter</kbd> for new line
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}