"use client";

import { cn } from "@/lib/utils";
import type { Message as MessageType } from "@ai-sdk/react";
import { useState } from "react";
import { ChatInstance } from "./chat-instance";

type ChatInstanceData = {
  modelId: string;
  messages: MessageType[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onReload: () => void;
};

type MultiModelConversationProps = {
  chatInstances: ChatInstanceData[];
};

const SINGLE_MODEL_COUNT = 1;
const TWO_MODEL_COUNT = 2;
const THREE_MODEL_COUNT = 3;
const FOUR_MODEL_COUNT = 4;

function getGridClasses(instanceCount: number): string {
  switch (instanceCount) {
    case SINGLE_MODEL_COUNT:
      return "grid-cols-1";
    case TWO_MODEL_COUNT:
      return "grid-cols-1 md:grid-cols-2";
    case THREE_MODEL_COUNT:
      return "grid-cols-1 md:grid-cols-3";
    case FOUR_MODEL_COUNT:
      return "grid-cols-1 md:grid-cols-2 md:grid-rows-2";
    default:
      // For 5+ models, use 3 columns and let it wrap
      return "grid-cols-1 md:grid-cols-3";
  }
}

export function MultiModelConversation({
  chatInstances,
}: MultiModelConversationProps) {
  const [expandedInstance, setExpandedInstance] = useState<string | null>(null);

  const handleExpandToggle = (modelId: string) => {
    setExpandedInstance(expandedInstance === modelId ? null : modelId);
  };

  const gridClasses = getGridClasses(chatInstances.length);

  if (chatInstances.length === 0) {
    return null;
  }

  return (
    <div className="relative h-full w-full px-4 pt-4 sm:px-6">
      <div
        className="relative w-full"
        data-expanded={expandedInstance !== null}
        data-layout={chatInstances.length}
        data-testid="arena-grid-container"
        style={{ height: "calc(100% - 1rem)" }}
      >
        <div
          className={cn(
            "grid h-full gap-6",
            expandedInstance ? "grid-cols-1" : gridClasses
          )}
        >
          {chatInstances.map((instance) => (
            <ChatInstance
              expanded={expandedInstance === instance.modelId}
              isLoading={instance.isLoading}
              key={instance.modelId}
              messages={instance.messages}
              modelId={instance.modelId}
              onDelete={instance.onDelete}
              onEdit={instance.onEdit}
              onExpandToggle={() => handleExpandToggle(instance.modelId)}
              onReload={instance.onReload}
              style={{
                display:
                  expandedInstance && expandedInstance !== instance.modelId
                    ? "none"
                    : "flex",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
