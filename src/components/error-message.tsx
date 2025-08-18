import { AlertCircle, RefreshCw, Wifi, Server, Zap } from 'lucide-react';

export type ErrorType = 'network' | 'api' | 'model' | 'unknown';

interface ErrorMessageProps {
  error: Error;
  type?: ErrorType;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const errorConfig = {
  network: {
    icon: Wifi,
    title: 'Network Connection Error',
    description: 'Unable to connect to the Ollama server. Please check your connection and try again.',
    suggestions: [
      'Make sure Ollama is running locally',
      'Check if the server is accessible at http://localhost:11434',
      'Verify your network connection'
    ]
  },
  api: {
    icon: Server,
    title: 'API Error',
    description: 'There was an error communicating with the Ollama API.',
    suggestions: [
      'The selected model might not be available',
      'Try refreshing the page',
      'Check Ollama server logs for more details'
    ]
  },
  model: {
    icon: Zap,
    title: 'Model Error',
    description: 'The selected AI model encountered an error.',
    suggestions: [
      'Try switching to a different model',
      'Ensure the model is properly installed',
      'Check if the model supports your request'
    ]
  },
  unknown: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'An unexpected error occurred.',
    suggestions: [
      'Please try again',
      'If the problem persists, check the console for more details'
    ]
  }
};

export function ErrorMessage({ 
  error, 
  type = 'unknown', 
  onRetry, 
  onDismiss 
}: ErrorMessageProps) {
  const config = errorConfig[type];
  const IconComponent = config.icon;

  return (
    <div className="max-w-md mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
      {/* Error Icon and Title */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0">
          <IconComponent className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="font-semibold text-red-800 dark:text-red-200">
          {config.title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-red-700 dark:text-red-300 mb-4 text-sm">
        {config.description}
      </p>

      {/* Error Details */}
      {error.message && (
        <div className="bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4">
          <p className="text-xs font-mono text-red-800 dark:text-red-200 break-words">
            {error.message}
          </p>
        </div>
      )}

      {/* Suggestions */}
      {config.suggestions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            Troubleshooting:
          </h4>
          <ul className="space-y-1">
            {config.suggestions.map((suggestion, index) => (
              <li 
                key={index}
                className="text-xs text-red-700 dark:text-red-300 flex items-start gap-2"
              >
                <span className="text-red-400 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Retry the failed operation"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Dismiss this error message"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

// Helper function to determine error type from error message/properties
export function getErrorType(error: Error): ErrorType {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'network';
  }
  
  if (message.includes('api') || message.includes('http') || message.includes('status')) {
    return 'api';
  }
  
  if (message.includes('model') || message.includes('ollama')) {
    return 'model';
  }
  
  return 'unknown';
}