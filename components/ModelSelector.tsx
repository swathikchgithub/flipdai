"use client";

import { FLIPDAI_MODELS, ModelConfig } from "@/config/flipdai-constants";

interface ModelSelectorProps {
  selectedModel: string;
  onSelect: (model: string) => void;
}

const PROVIDER_ORDER = ["Anthropic", "OpenAI", "Groq", "Google", "OpenRouter"];

function groupByProvider(models: ModelConfig[]) {
  return PROVIDER_ORDER.reduce((acc, provider) => {
    const group = models.filter((m) => m.provider === provider);
    if (group.length) acc[provider] = group;
    return acc;
  }, {} as Record<string, ModelConfig[]>);
}

export default function ModelSelector({ selectedModel, onSelect }: ModelSelectorProps) {
  const grouped = groupByProvider(FLIPDAI_MODELS);

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([provider, models]) => (
        <div key={provider}>
          {/* Provider label */}
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#6a6a8a] mb-2 px-1">
            {provider}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {models.map((m) => {
              const isSelected = selectedModel === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => onSelect(m.value)}
                  data-testid={`model-${m.value}`}
                  className="relative flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-150 active:scale-95 cursor-pointer"
                  style={{
                    border: isSelected ? `1.5px solid ${m.color}` : "1.5px solid rgba(255,255,255,0.1)",
                    background: isSelected
                      ? `linear-gradient(135deg, ${m.color}22, ${m.color}0a)`
                      : "rgba(255,255,255,0.04)",
                    boxShadow: isSelected ? `0 0 16px ${m.color}28` : "none",
                  }}
                >
                  {/* Badge */}
                  <span className="text-xl leading-none flex-shrink-0">{m.badge}</span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-semibold leading-tight"
                      style={{ color: isSelected ? m.color : "#e8e8f0" }}
                    >
                      {m.label}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "#6a6a8a" }}>
                      {m.desc}
                    </div>
                  </div>

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: m.color, color: "#fff" }}
                    >
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
