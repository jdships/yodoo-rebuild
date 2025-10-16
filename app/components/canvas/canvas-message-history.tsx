"use client";

// import { UserMessage } from "@/app/hooks/use-canvas-responses";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

type UserMessage = {
  id: string;
  content: string;
  role: string;
  created_at?: string;
  timestamp: Date;
};

type CanvasMessageHistoryProps = {
  messages: UserMessage[];
  className?: string;
};

export function CanvasMessageHistory({ 
  messages, 
  className = "" 
}: CanvasMessageHistoryProps) {
  if (messages.length === 0) {
    return null; // Don't render anything when there are no messages
  }

  return (
    <div className={cn("flex h-full flex-col overflow-auto", className)}>
      <div className="space-y-4 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className="flex gap-3"
          >
            {/* User avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            
            {/* Message content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">You</span>
                <span className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm text-foreground whitespace-pre-wrap break-words">
                {message.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
