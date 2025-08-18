import { useEffect, useState, Fragment } from 'react';
import { motion } from 'framer-motion';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon, CheckIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { OllamaModel } from '@/lib/ollama/provider';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      const data = await response.json();
      setModels(data.models);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedModelData = models.find(model => model.id === selectedModel);

  return (
    <Listbox value={selectedModel} onChange={onModelChange} disabled={loading}>
      <div className="relative">
        <Listbox.Button
          className={`
            relative w-full min-w-[180px] cursor-default rounded-xl
            bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm
            py-2.5 pl-3 pr-10 text-left shadow-md
            border border-gray-200/50 dark:border-gray-700/50
            transition-all duration-200
            hover:bg-white/90 dark:hover:bg-gray-800/90
            hover:shadow-lg hover:border-gray-300/70 dark:hover:border-gray-600/70
            focus:outline-none focus:ring-2 focus:ring-blue-500/30
            focus:border-blue-500 disabled:opacity-50
          `}
        >
          <span className="flex items-center gap-2">
            <CpuChipIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">
              {loading ? 'Loading...' : selectedModelData?.name || selectedModel}
            </span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon
              className="h-4 w-4 text-gray-400 transition-transform duration-200 ui-open:rotate-180"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={`
              absolute right-0 mt-2 max-h-60 w-full min-w-[220px] overflow-auto
              rounded-xl bg-white dark:bg-gray-800 shadow-xl
              border border-gray-200/50 dark:border-gray-700/50
              backdrop-blur-xl z-50
              ring-1 ring-black/5 dark:ring-white/10
              focus:outline-none text-sm
            `}
          >
            <div className="p-1">
              {loading ? (
                <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  Loading models...
                </div>
              ) : models.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  No models available
                </div>
              ) : (
                models.map((model) => (
                  <Listbox.Option
                    key={model.id}
                    value={model.id}
                    className={({ active }) =>
                      `relative cursor-default select-none rounded-lg px-3 py-2.5 transition-colors duration-150 ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                          : 'text-gray-900 dark:text-gray-100'
                      }`
                    }
                  >
                    {({ selected, active }) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex-shrink-0">
                          <div className={`
                            w-2 h-2 rounded-full transition-colors duration-200
                            ${selected 
                              ? 'bg-blue-500' 
                              : active 
                                ? 'bg-blue-300' 
                                : 'bg-gray-300 dark:bg-gray-600'
                            }
                          `} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className={`
                            block truncate font-medium
                            ${selected ? 'text-blue-900 dark:text-blue-100' : ''}
                          `}>
                            {model.name}
                          </div>
                          
                          {model.id !== model.name && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {model.id}
                            </div>
                          )}
                        </div>

                        {selected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="flex-shrink-0"
                          >
                            <CheckIcon 
                              className="h-4 w-4 text-blue-600 dark:text-blue-400" 
                              aria-hidden="true" 
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </Listbox.Option>
                ))
              )}
            </div>
            
            {/* Model count footer */}
            {!loading && models.length > 0 && (
              <div className="border-t border-gray-200/50 dark:border-gray-700/50 px-3 py-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {models.length} model{models.length !== 1 ? 's' : ''} available
                </div>
              </div>
            )}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}