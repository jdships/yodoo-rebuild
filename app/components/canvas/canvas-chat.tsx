"use client";

import { Conversation } from "@/app/components/chat/conversation";
import { useFileUpload } from "@/app/components/chat/use-file-upload";
import { useChatDraft } from "@/app/hooks/use-chat-draft";
import { Button } from "@/components/ui/button";
import { useChats } from "@/lib/chat-store/chats/provider";
import { useMessages } from "@/lib/chat-store/messages/provider";
import { useChatSession } from "@/lib/chat-store/session/provider";
import { FREE_MAX_MODELS, PRO_MAX_MODELS, UNLIMITED_MAX_MODELS } from "@/lib/config";
import { useModel } from "@/lib/model-store/provider";
import { PROVIDERS } from "@/lib/providers";
import { useUserPreferences } from "@/lib/user-preference-store/provider";
import { useUser } from "@/lib/user-store/provider";
import { hasActiveSubscription, isUnlimitedUser } from "@/lib/user/types";
import { ArrowUp, Stop } from "@phosphor-icons/react";
import { FileText } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { CanvasModelSelector } from "./canvas-model-selector";
import { MobileCanvasSheet } from "./mobile-canvas-sheet";

type CanvasChatProps = {
  selectedModelIds: string[];
  onSelectedModelIdsChange: (modelIds: string[]) => void;
  showCanvasButton?: boolean;
};

export function CanvasChat({ selectedModelIds, onSelectedModelIdsChange, showCanvasButton = false }: CanvasChatProps) {
  const { chatId } = useChatSession();
  const { getChatById, updateChatModel } = useChats();
  const { messages: initialMessages } = useMessages();
  const { user } = useUser();
  const { preferences } = useUserPreferences();
  const { draftValue } = useChatDraft(chatId);
  const { models } = useModel();

  const currentChat = useMemo(
    () => (chatId ? getChatById(chatId) : null),
    [chatId, getChatById]
  );

  const selectedModels = useMemo(
    () => models.filter((model: any) => selectedModelIds.includes(model.id)),
    [models, selectedModelIds]
  );

  // File upload functionality
  const {
    files,
    handleFileUpload,
    handleFileRemove,
  } = useFileUpload();


  // Basic state for canvas mode
  const [input, setInput] = useState(draftValue || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const [quotedText, setQuotedText] = useState<{
    text: string;
    messageId: string;
  }>();

  const isAuthenticated = useMemo(() => !!user?.id, [user?.id]);

  // Determine max models based on subscription
  const maxModels = useMemo(() => {
    if (!user) return FREE_MAX_MODELS;
    
    if (isUnlimitedUser(user)) {
      return UNLIMITED_MAX_MODELS; // 10 models
    }
    
    if (hasActiveSubscription(user)) {
      return PRO_MAX_MODELS; // 4 models
    }
    
    return FREE_MAX_MODELS; // 2 models
  }, [user]);

  // Simplified handlers for canvas mode
  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    setIsSubmitting(true);
    // TODO: Implement actual send logic for canvas
    console.log("Sending message:", input);
    setTimeout(() => {
      setInput("");
      setIsSubmitting(false);
    }, 1000);
  }, [input]);

  const handleSuggestion = useCallback((suggestion: string) => {
    setInput(suggestion);
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  const stop = useCallback(() => {
    setIsSubmitting(false);
  }, []);

  const handleDelete = useCallback((id: string) => {
    console.log("Delete message:", id);
  }, []);

  const handleEdit = useCallback((id: string, newText: string) => {
    console.log("Edit message:", id, newText);
  }, []);

  const handleReload = useCallback(() => {
    console.log("Reload chat");
  }, []);

  const handleQuotedSelected = useCallback((text: string, messageId: string) => {
    setQuotedText({ text, messageId });
  }, []);

  return (
    <div className="flex h-full flex-col min-h-screen">
      {/* Canvas Mode header */}
      <div className="flex h-14 items-center justify-between border-b border-t px-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Canvas Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {selectedModels.length > 0 ? (
              selectedModels.map((model: any) => {
                const provider = PROVIDERS.find((p) => p.id === model.icon);
                return (
                  <div
                    key={model.id}
                    className="flex items-center gap-1.5 rounded-md bg-background/80 border border-border/50 px-2 py-1 text-xs shadow-sm whitespace-nowrap flex-shrink-0"
                  >
                    {provider?.icon && <provider.icon className="size-3.5" />}
                    <span className="font-medium text-foreground hidden sm:inline">{model.name}</span>
                  </div>
                );
              })
            ) : (
              <span className="text-muted-foreground text-xs">No models selected</span>
            )}
          </div>
          
          {/* Mobile canvas button */}
          {showCanvasButton && (
            <MobileCanvasSheet>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <FileText className="size-4" />
              </Button>
            </MobileCanvasSheet>
          )}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-hidden">
        {initialMessages.length > 0 ? (
          <Conversation
            messages={initialMessages}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onReload={handleReload}
            onQuote={handleQuotedSelected}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Start a conversation</p>
              <p className="text-muted-foreground text-xs mt-1">
                Your messages will appear here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chat input */}
      <div className="sticky bottom-0 border-t bg-background px-4 py-4 pt-6 pb-6">
        <div className="relative rounded-lg border bg-popover">
          <textarea
            className="min-h-[44px] w-full resize-none border-0 bg-transparent px-3 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0"
            placeholder="Message canvas models..."
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && selectedModelIds.length > 0) {
                  handleSend();
                }
              }
            }}
          />
          <div className="flex w-full items-center justify-between gap-2 px-3 pb-3">
            <div className="flex gap-2">
              <CanvasModelSelector
                selectedModelIds={selectedModelIds}
                setSelectedModelIds={onSelectedModelIdsChange}
                maxModels={maxModels}
                isUserAuthenticated={isAuthenticated}
              />
            </div>
            <Button
              size="sm"
              className="size-9 rounded-full transition-all duration-300 ease-out"
              disabled={
                !input.trim() ||
                isSubmitting ||
                selectedModelIds.length === 0
              }
              type="button"
              onClick={handleSend}
            >
              {isSubmitting ? (
                <Stop className="size-4" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
