"use client";

import { useFileUpload } from "@/app/components/chat/use-file-upload";
import { useChatDraft } from "@/app/hooks/use-chat-draft";
import { Button } from "@/components/ui/button";
import { useChats } from "@/lib/chat-store/chats/provider";
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
import { CanvasConversation } from "./canvas-conversation";
import { CanvasModelSelector } from "./canvas-model-selector";
import { MobileCanvasSheet } from "./mobile-canvas-sheet";

type CanvasChatProps = {
  selectedModelIds: string[];
  onSelectedModelIdsChange: (modelIds: string[]) => void;
  showCanvasButton?: boolean;
  conversation: any[];
  onAddMessage: (content: string, selectedModelIds: string[]) => void;
  onAddResponse: (response: any) => void;
  onAddToDocument: (content: string) => void;
  onReplaceDocument?: (content: string) => void;
  onClearResponses?: () => void;
};

export function CanvasChat({ 
  selectedModelIds, 
  onSelectedModelIdsChange, 
  showCanvasButton = false,
  conversation,
  onAddMessage,
  onAddResponse,
  onAddToDocument,
  onReplaceDocument,
  onClearResponses
}: CanvasChatProps) {
  const { chatId } = useChatSession();
  const { getChatById, updateChatModel } = useChats();
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
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [quotedText, setQuotedText] = useState<{
    text: string;
    messageId: string;
  }>();

  const isAuthenticated = useMemo(() => !!user?.id, [user?.id]);

  // Filter conversation based on active model
  const filteredConversation = useMemo(() => {
    if (activeModelId === null) {
      return conversation;
    }
    
    // For a specific model, only show:
    // 1. User messages that were sent ONLY to that model (not to multiple models)
    // 2. Assistant responses from that specific model
    const filtered = conversation.filter(msg => {
      if (msg.role === 'user') {
        // Only show user messages that were sent ONLY to this model
        const wasSentOnlyToThisModel = msg.selectedModelIds?.length === 1 && msg.selectedModelIds.includes(activeModelId);
        console.log(`User message "${msg.content}" for models [${msg.selectedModelIds?.join(', ')}] - showing for ${activeModelId}: ${wasSentOnlyToThisModel}`);
        return wasSentOnlyToThisModel;
      } else {
        // Only show assistant responses from this model
        const shouldShow = msg.modelId === activeModelId;
        console.log(`Assistant message from ${msg.modelId} - showing for ${activeModelId}: ${shouldShow}`);
        return shouldShow;
      }
    });
    
    console.log(`Filtered conversation for ${activeModelId}:`, filtered);
    return filtered;
  }, [conversation, activeModelId]);

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

  // Canvas mode handlers for multiple models
  const handleSend = useCallback(async () => {
    if (!input.trim() || selectedModelIds.length === 0) return;
    
    // Add user message to history with selected model IDs
    onAddMessage(input, selectedModelIds);
    
    setIsSubmitting(true);
    
    try {
      // Send to all selected models
      const promises = selectedModelIds.map(async (modelId) => {
        const model = models.find((m: any) => m.id === modelId);
        if (!model) return;

        // Simulate API call - replace with actual implementation
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        const timestamp = new Date().toISOString();
        const mockResponse = `This is a mock response from ${model.name} for: "${input}"\n\nResponse generated at: ${timestamp}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`;
        
        console.log(`Adding response for model: ${model.id} (${model.name})`);
        
        onAddResponse({
          modelId: model.id,
          modelName: model.name,
          providerIcon: model.icon,
          content: mockResponse,
        });
      });

      await Promise.all(promises);
      setInput("");
    } catch (error) {
      console.error("Error sending messages:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [input, selectedModelIds, models, onAddResponse]);

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
          {conversation.length > 0 && onClearResponses && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearResponses}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {selectedModels.length > 0 ? (
              selectedModels.map((model: any) => {
                const provider = PROVIDERS.find((p) => p.id === model.icon);
                return (
                  <div
                    key={model.id}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs shadow-sm whitespace-nowrap flex-shrink-0"
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

      {/* Model tabs - only show if there are responses */}
      {conversation.some(msg => msg.role === 'assistant') && (
        <div className="border-b px-4 py-2">
          <div className="flex gap-2 overflow-x-auto">
            {/* Individual model tabs */}
            {selectedModels.map((model: any) => {
              const provider = PROVIDERS.find((p) => p.id === model.icon);
              const hasResponse = conversation.some(msg => msg.modelId === model.id);
              return (
                <div
                  key={model.id}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs cursor-pointer transition-colors ${
                    activeModelId === model.id
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : hasResponse
                      ? 'bg-muted/50 text-muted-foreground hover:bg-muted/70'
                      : 'bg-muted/30 text-muted-foreground/50'
                  }`}
                  onClick={() => hasResponse && setActiveModelId(model.id)}
                >
                  {provider?.icon && <provider.icon className="size-4" />}
                  <span className="font-medium">{model.name}</span>
                  {hasResponse && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversation */}
      <div className="flex-1 overflow-hidden">
        <CanvasConversation
          conversation={filteredConversation}
          onAddToDocument={onAddToDocument}
          onReplaceDocument={onReplaceDocument}
        />
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
