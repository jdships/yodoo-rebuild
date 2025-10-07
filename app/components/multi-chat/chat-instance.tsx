"use client";

import { Loader } from "@/components/prompt-kit/loader";
import { getModelInfo } from "@/lib/models";
import { PROVIDERS } from "@/lib/providers";
import type { Message as MessageType } from "@ai-sdk/react";
import { ArrowDown, ChevronDown, Maximize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "../chat/message";

type ChatInstanceProps = {
  modelId: string;
  messages: MessageType[];
  isLoading?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, newText: string) => void;
  onReload?: () => void;
  expanded?: boolean;
  onExpandToggle?: () => void;
  style?: React.CSSProperties;
};

export function ChatInstance({
  modelId,
  messages,
  isLoading = false,
  onDelete = () => {
    // No default action
  },
  onEdit = () => {
    // No default action
  },
  onReload = () => {
    // No default action
  },
  expanded = false,
  onExpandToggle = () => {
    // No default action
  },
  style,
}: ChatInstanceProps) {
  const model = getModelInfo(modelId);
  const providerIcon = PROVIDERS.find((p) => p.id === model?.baseProviderId);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = 10; // Allow for small rounding errors
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < threshold);
    }
  };

  const scrollToBottom = useCallback(() => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  // Auto-scroll to bottom when new messages arrive and user is at bottom
  useEffect(() => {
    if (isAtBottom && (messages.length > 0 || isLoading)) {
      scrollToBottom();
    }
  }, [messages, isLoading, isAtBottom, scrollToBottom]);

  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded border"
      data-expanded={expanded}
      data-model-id={modelId}
      data-testid={`arena-chat-instance-${modelId}`}
      style={style}
    >
      {/* Header */}
      <div className="flex justify-between border-b bg-background/50 px-4">
        <div className="flex min-w-0 flex-1 items-center">
          <button
            className="flex items-center gap-2 text-left hover:opacity-90"
            type="button"
          >
            <div className="flex cursor-pointer items-center gap-1">
              <div className="flex items-center gap-2">
                {providerIcon?.icon && (
                  <div className="relative h-4 w-4 flex-shrink-0">
                    <providerIcon.icon className="h-4 w-4" />
                  </div>
                )}
                <span className="text-muted-foreground text-xs">
                  {model?.provider}: {model?.name}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </div>
          </button>
        </div>
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-1 py-1">
            <button
              className="inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
              onClick={onExpandToggle}
              type="button"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <div className="relative flex h-full flex-col">
          <div
            className="!overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 flex h-full flex-col items-center gap-4 px-3 lg:px-3"
            onScroll={handleScroll}
            ref={scrollContainerRef}
            style={{
              scrollBehavior: "smooth",
              scrollbarGutter: "stable both-edges",
              scrollPaddingTop:
                "calc(var(--header-height) + min(200px, max(70px, 20svh)))",
            }}
          >
            <div className="flex w-full flex-col gap-4">
              {/* Render all messages in conversation order */}
              {messages.map((message, index) => {
                const isLast = index === messages.length - 1;
                
                return (
                  <div key={message.id} className="mx-auto w-full max-w-3xl pt-4">
                    <Message
                      attachments={message.experimental_attachments}
                      className="bg-transparent p-0 px-0"
                      hasScrollAnchor={false}
                      id={message.id}
                      isLast={isLast}
                      onDelete={message.role === "assistant" ? () => onDelete(message.id) : () => {
                        // No action for user messages
                      }}
                      onEdit={message.role === "assistant" ? (id, newText) => onEdit(id, newText) : () => {
                        // No action for user messages
                      }}
                      onReload={message.role === "assistant" && isLast ? onReload : () => {
                        // No action for non-last messages
                      }}
                      parts={
                        message.parts || [
                          { type: "text", text: message.content },
                        ]
                      }
                      status={
                        message.role === "assistant" && isLast && isLoading 
                          ? "streaming" 
                          : "ready"
                      }
                      variant={message.role}
                    >
                      {message.content}
                    </Message>
                  </div>
                );
              })}

              {/* Loading State for new assistant message */}
              {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
                <div className="mx-auto w-full max-w-3xl">
                  <div className="space-y-2">
                    <div className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                      assistant
                    </div>
                    <Loader />
                  </div>
                </div>
              )}
            </div>

            {/* Spacer for bottom padding */}
            <div className="shrink-0" style={{ minHeight: "20vh" }} />
          </div>

          {/* Scroll to bottom button */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex items-center justify-center pb-4"
            style={{ opacity: isAtBottom ? 0 : 1 }}
          >
            <button
              className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white p-0 font-medium text-gray-600 text-sm shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-gray-700 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
              onClick={scrollToBottom}
              title="Scroll to bottom"
              type="button"
            >
              <ArrowDown className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
