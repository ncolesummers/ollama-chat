import { useEffect, useState } from 'react';
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

  return (
    <select
      title="Select a model"
      value={selectedModel}
      onChange={(e) => onModelChange(e.target.value)}
      disabled={loading}
      className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {loading ? (
        <option>Loading models...</option>
      ) : (
        models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))
      )}
    </select>
  );
}
