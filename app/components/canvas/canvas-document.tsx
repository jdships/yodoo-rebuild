"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText, MoreHorizontal, Share } from "lucide-react";
import { useState } from "react";

type CanvasDocumentProps = {
  showHeader?: boolean;
};

export function CanvasDocument({ showHeader = true }: CanvasDocumentProps) {
  const [documentContent, setDocumentContent] = useState("# Untitled Document\n\nStart writing your document here...");

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
      <div className="flex-1 overflow-auto h-full">
        <div className="mx-auto p-8 bg-card h-full">
          <div className="min-h-full rounded-lg border p-8 bg-sidebar">
            <textarea
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              className="min-h-[600px] w-full resize-none border-none bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Start writing your document..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
