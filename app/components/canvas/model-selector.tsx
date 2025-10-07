"use client";

import { Button } from "@/components/ui/button";

type Model = {
  id: string;
  name: string;
  company: string;
};

type ModelSelectorProps = {
  availableModels: Model[];
  onSelectModel: (modelId: string) => void;
  onClose: () => void;
};

export function ModelSelector({ availableModels, onSelectModel, onClose }: ModelSelectorProps) {
  if (availableModels.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/50 p-4 text-center">
        <p className="text-muted-foreground text-sm">All available models are already selected</p>
        <Button variant="ghost" size="sm" onClick={onClose} className="mt-2">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium text-sm">Select a model to add</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {availableModels.map((model) => (
          <Button
            key={model.id}
            variant="outline"
            size="sm"
            className="flex flex-col items-start gap-1 p-3 h-auto"
            onClick={() => onSelectModel(model.id)}
          >
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <span className="font-medium text-xs">{model.company}</span>
            </div>
            <span className="text-xs text-muted-foreground">{model.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
