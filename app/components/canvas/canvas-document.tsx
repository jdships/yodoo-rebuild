"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText, MoreHorizontal, Share } from "lucide-react";
import { CanvasEditor } from "./canvas-editor";

type CanvasDocumentProps = {
  showHeader?: boolean;
  documentContent: string;
  onDocumentChange: (content: string) => void;
};

export function CanvasDocument({ 
  showHeader = true, 
  documentContent, 
  onDocumentChange 
}: CanvasDocumentProps) {

  return (
    <div className="flex h-full flex-col">
      {/* Document header - only show if showHeader is true */}
      {showHeader && (
        <div className="border-b border-t bg-background px-4 py-3 h-14">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <span className="font-medium text-sm">Untitled Document</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-8 rounded-full">
                <Share className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8 rounded-full">
                <Download className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8 rounded-full">
                <MoreHorizontal className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Document content */}
      <div className="flex-1 overflow-auto h-full w-full">
        <div className="canvas-editor-container h-full w-full">
          <CanvasEditor
            content={documentContent}
            onChange={onDocumentChange}
          />
        </div>
      </div>
    </div>
  );
}
