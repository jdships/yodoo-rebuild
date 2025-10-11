"use client";

import { useCanvasResponses } from "@/app/hooks/use-canvas-responses";
import { useIsMobile } from "@/app/hooks/use-mobile";
import { useState } from "react";
import { CanvasChat } from "./canvas-chat";
import { CanvasDocument } from "./canvas-document";

export function CanvasLayout() {
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const isMobile = useIsMobile();
  const canvasState = useCanvasResponses();

  const handleSelectedModelIdsChange = (modelIds: string[]) => {
    setSelectedModelIds(modelIds);
  };

  // Mobile layout: Full page chat with canvas sheet
  if (isMobile) {
    return (
      <div className="flex h-screen w-full flex-col">
        {/* Chat section - full width on mobile */}
        <div className="flex w-full flex-1 flex-col bg-background">
          <CanvasChat
            selectedModelIds={selectedModelIds}
            onSelectedModelIdsChange={handleSelectedModelIdsChange}
            showCanvasButton={true}
            onAddToDocument={canvasState.addToDocument}
            onReplaceDocument={canvasState.replaceDocument}
            onFirstResponse={canvasState.handleFirstResponse}
            documentContent={canvasState.documentContent}
            onDocumentChange={canvasState.updateDocument}
          />
        </div>
      </div>
    );
  }

  // Desktop layout: Side-by-side
  return (
    <div className="flex h-full w-full flex-col">
      {/* Main canvas layout: side-by-side on desktop */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat section - 2/5 width on desktop */}
        <div className="flex w-2/5 flex-col border-r bg-background">
          <CanvasChat
            selectedModelIds={selectedModelIds}
            onSelectedModelIdsChange={handleSelectedModelIdsChange}
            showCanvasButton={false}
            onAddToDocument={canvasState.addToDocument}
            onReplaceDocument={canvasState.replaceDocument}
            onFirstResponse={canvasState.handleFirstResponse}
          />
        </div>

        {/* Document section - 3/5 width on desktop */}
        <div className="flex w-3/5 flex-col bg-background">
          <CanvasDocument
            documentContent={canvasState.documentContent}
            onDocumentChange={canvasState.updateDocument}
          />
        </div>
      </div>
    </div>
  );
}
