"use client";

import { ConversationMessage } from "@/app/hooks/use-canvas-responses";
import { Button } from "@/components/ui/button";
import { PROVIDERS } from "@/lib/providers";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { MessageAssistant } from "../chat/message-assistant";
import { MessageUser } from "../chat/message-user";

type CanvasConversationProps = {
  conversation: ConversationMessage[];
  onAddToDocument: (content: string) => void;
  onReplaceDocument?: (content: string) => void;
  className?: string;
};

export function CanvasConversation({ 
  conversation, 
  onAddToDocument,
  onReplaceDocument,
  className = "" 
}: CanvasConversationProps) {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates(prev => ({ ...prev, [messageId]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [messageId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (conversation.length === 0) {
    return (
      <div className={`flex h-full items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Start a conversation</p>
          <p className="text-muted-foreground text-xs mt-1">
            Your messages will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col overflow-auto ${className}`}>
      <div className="space-y-4 p-4">
        {conversation.map((message) => {
          const isCopied = copiedStates[message.id];
          
          if (message.role === 'user') {
            return (
              <MessageUser
                key={message.id}
                className="w-full"
                copied={isCopied}
                onCopy={() => handleCopy(message.content, message.id)}
              >
                {message.content}
              </MessageUser>
            );
          } else {
            // Assistant message with model info and action buttons
            const provider = PROVIDERS.find((p) => p.id === message.providerIcon);
            
            return (
              <div key={message.id} className="w-full">
                <MessageAssistant
                  className="w-full"
                  copied={isCopied}
                  onCopy={() => handleCopy(message.content, message.id)}
                >
                  {message.content}
                </MessageAssistant>
                
                {/* Model info and action buttons */}
                <div className="mt-2 flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                  <div className="flex items-center gap-2">
                    {provider?.icon && <provider.icon className="size-4" />}
                    <span className="text-sm font-medium text-muted-foreground">
                      {message.modelName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(message.content, message.id)}
                      className="h-7 px-2 text-xs"
                    >
                      {isCopied ? (
                        <Check className="size-3" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      <span className="ml-1">
                        {isCopied ? "Copied!" : "Copy"}
                      </span>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onAddToDocument(message.content)}
                      className="h-7 px-2 text-xs"
                    >
                      Add to Document
                    </Button>
                    {onReplaceDocument && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReplaceDocument(message.content)}
                        className="h-7 px-2 text-xs"
                      >
                        Replace Document
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
