"use client";

import { Loader } from "@/components/prompt-kit/loader";
import { Button } from "@/components/ui/button";
import { markdownToHTML } from "@/lib/markdown-to-html";
import { PROVIDERS } from "@/lib/providers";
import type { Message } from "ai/react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { MessageAssistant } from "../chat/message-assistant";

type CanvasConversationProps = {
  conversation: Message[];
  onAddToDocument: (content: string) => void;
  onReplaceDocument?: (content: string) => void;
  isLoading?: boolean;
  className?: string;
};

export function CanvasConversation({ 
  conversation, 
  onAddToDocument,
  onReplaceDocument,
  isLoading = false,
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
      <div className="mx-auto flex w-full max-w-5xl flex-col space-y-4 px-4 py-4 pb-24">
        {conversation.map((message) => {
          const isCopied = copiedStates[message.id];

          // Extract text content from message
          let content = "";
          if (typeof message.content === "string") {
            content = message.content;
          } else if (message.content && Array.isArray(message.content)) {
            content = (message.content as any[])
              .filter((part: any) => part.type === "text")
              .map((part: any) => part.text)
              .join("\n");
          }

          if (message.role === "user") {
            return (
              <div key={message.id} className="flex w-full max-w-3xl flex-col items-end gap-0.5">
                <div className="prose dark:prose-invert relative max-w-[70%] rounded-3xl bg-accent px-5 py-2.5">
                  {content}
                </div>
                <div className="flex gap-0 opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(content, message.id)}
                    className="size-7.5 rounded-full hover:bg-accent/60"
                  >
                    {isCopied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          }

          if (message.role === "assistant") {
            // Get model info from message metadata
            const modelId = (message as any).model;
            const modelName = (message as any).modelName;

            // Find provider icon based on model ID
            let ProviderIcon = null;
            if (modelId) {
              // Extract provider from model ID
              let providerId = "";
              if (modelId.includes("gpt") || modelId.includes("o1")) {
                providerId = "openai";
              } else if (modelId.includes("claude")) {
                providerId = "anthropic";
              } else if (modelId.includes("gemini")) {
                providerId = "google";
              } else if (modelId.includes("deepseek")) {
                providerId = "deepseek";
              } else if (modelId.includes("llama")) {
                providerId = "meta";
              } else if (modelId.includes("mistral")) {
                providerId = "mistral";
              } else if (modelId.includes("grok")) {
                providerId = "xai";
              }
              const provider = PROVIDERS.find((p) => p.id === providerId);
              if (provider) {
                ProviderIcon = provider.icon;
              }
            }

            const timestamp = message.createdAt
              ? new Date(message.createdAt)
              : new Date();

            return (
              <div key={message.id} className="w-full max-w-3xl">
                <MessageAssistant
                  className="w-full"
                  copied={isCopied}
                  copyToClipboard={() => handleCopy(content, message.id)}
                  messageId={message.id}
                  parts={message.parts}
                >
                  {content}
                </MessageAssistant>

                {/* Model info and action buttons */}
                <div className="mt-2 flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                  <div className="flex items-center gap-2">
                    {ProviderIcon && <ProviderIcon className="size-4" />}
                    {modelName && (
                      <span className="text-sm font-medium text-muted-foreground">
                        {modelName}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(content, message.id)}
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
                      onClick={() => onAddToDocument(markdownToHTML(content))}
                      className="h-7 px-2 text-xs"
                    >
                      Add to Document
                    </Button>
                    {onReplaceDocument && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReplaceDocument(markdownToHTML(content))}
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

          return null;
        })}
        
        {/* Show thinking indicator when loading */}
        {isLoading && conversation.length > 0 && conversation[conversation.length - 1].role === "user" && (
          <div className="flex w-full max-w-3xl flex-col items-start gap-2">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
}
