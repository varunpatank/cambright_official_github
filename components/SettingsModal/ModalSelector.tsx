//geminiclone/src/components/ui/SettingsModal/ModelSelector.tsx
import { Bot } from "lucide-react";
import { useState } from "react";

interface ModelOption {
  id: string;
  name: string;
}

interface ModelSelectorProps {
  model: string;
  onChange: (modelId: string) => void;
}

const MODEL_OPTIONS: ModelOption[] = [
  { id: "google/gemma-3-4b-it:free", name: "Gemma 3 4B (Free - Recommended)" },
  { id: "google/gemma-3-12b-it:free", name: "Gemma 3 12B (Free)" },
  { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B (Free)" },
  { id: "meta-llama/llama-3.2-3b-instruct:free", name: "Llama 3.2 3B (Free)" },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B (Free)" },
];

export default function ModelSelector({ model, onChange }: ModelSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Bot size={16} className="text-purple-500" />
        <label className="text-sm font-medium">Model</label>
      </div>
      <div className="relative">
        <button
          type="button"
          className="w-full p-2 bg-n-6 border border-n-7 rounded-lg text-left flex justify-between items-center"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span>
            {MODEL_OPTIONS.find((m) => m.id === model)?.name || model}
          </span>
          <span
            className={`transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>

        {dropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-n-7 border border-n-6 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {MODEL_OPTIONS.map((option) => (
              <button
                key={option.id}
                className={`w-full p-2 text-left hover:bg-n-6
                            ${
                              model === option.id
                                ? "bg-n-6 border-l-2 border-purple-500"
                                : ""
                            }`}
                onClick={() => {
                  onChange(option.id);
                  setDropdownOpen(false);
                }}
              >
                {option.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
