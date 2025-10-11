"use client";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { CanvasDocument } from "./canvas-document";

type MobileCanvasSheetProps = {
  children: React.ReactNode;
  documentContent: string;
  onDocumentChange: (content: string) => void;
};

export function MobileCanvasSheet({ 
  children, 
  documentContent, 
  onDocumentChange 
}: MobileCanvasSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] w-full rounded-t-2xl border-0 p-0"
      >
        <div className="flex h-full flex-col">
          {/* Canvas header */}
          <div className="flex h-14 items-center justify-between border-b bg-background px-4">
            <SheetTitle className="text-base font-medium">
              Canvas Document
            </SheetTitle>
          </div>
          
          {/* Canvas document content */}
          <div className="flex-1 overflow-hidden">
            <CanvasDocument 
              showHeader={false}
              documentContent={documentContent}
              onDocumentChange={onDocumentChange}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
