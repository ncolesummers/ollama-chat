import { motion } from 'framer-motion';
import { MessageCircle, Lightbulb, Code, Book, Zap, Shield, Cpu, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onPromptSelect: (prompt: string) => void;
}

const examplePrompts = [
  {
    id: 1,
    text: "Explain how React hooks work",
    icon: Code,
    category: "Programming",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    text: "Write a creative story about time travel",
    icon: Book,
    category: "Creative",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    text: "Help me brainstorm ideas for a mobile app",
    icon: Lightbulb,
    category: "Brainstorming",
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: 4,
    text: "Explain quantum computing in simple terms",
    icon: Zap,
    category: "Science",
    color: "from-green-500 to-emerald-500"
  }
];

const features = [
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your conversations stay on your device",
    color: "text-green-500"
  },
  {
    icon: Cpu,
    title: "Runs Locally",
    description: "Powered by Ollama on your machine",
    color: "text-blue-500"
  },
  {
    icon: Sparkles,
    title: "No API Keys",
    description: "No external dependencies required",
    color: "text-purple-500"
  }
];

export function EmptyState({ onPromptSelect }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-5xl mx-auto px-4">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/25">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>
        </motion.div>
        
        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4"
        >
          Welcome to Ollama Chat
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
        >
          Experience the power of AI conversations with complete privacy. 
          Chat with advanced language models running locally on your machine.
        </motion.p>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl"
      >
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 mb-4 ${feature.color}`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Example Prompts */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="w-full max-w-4xl"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Try asking me about:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examplePrompts.map((prompt, index) => {
            const IconComponent = prompt.icon;
            return (
              <motion.button
                key={prompt.id}
                type="button"
                onClick={() => onPromptSelect(prompt.text)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group p-6 text-left bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/70 dark:hover:border-gray-600/70 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                aria-label={`Start conversation with: ${prompt.text}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${prompt.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mb-1">
                      {prompt.text}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {prompt.category}
                    </div>
                  </div>
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Getting Started Hint */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="mt-12 text-center"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
          <span>Click on any prompt above or type your own message below to get started</span>
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            👇
          </motion.span>
        </p>
      </motion.div>
    </div>
  );
}