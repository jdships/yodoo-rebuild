"use client";

import { useFileUpload } from "@/app/components/chat/use-file-upload";
import { useChatDraft } from "@/app/hooks/use-chat-draft";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useChats } from "@/lib/chat-store/chats/provider";
import { useMessages } from "@/lib/chat-store/messages/provider";
import { useChatSession } from "@/lib/chat-store/session/provider";
import {
  FREE_MAX_MODELS,
  PRO_MAX_MODELS,
  SYSTEM_PROMPT_DEFAULT,
  UNLIMITED_MAX_MODELS,
} from "@/lib/config";
import { markdownToHTML } from "@/lib/markdown-to-html";
import { useModel } from "@/lib/model-store/provider";
import { PROVIDERS } from "@/lib/providers";
import { useUserPreferences } from "@/lib/user-preference-store/provider";
import { useUser } from "@/lib/user-store/provider";
import { hasActiveSubscription, isUnlimitedUser } from "@/lib/user/types";
import { ArrowUp, Stop } from "@phosphor-icons/react";
import { FileText } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CanvasConversation } from "./canvas-conversation";
import { CanvasModelSelector } from "./canvas-model-selector";
import { MobileCanvasSheet } from "./mobile-canvas-sheet";
import { useCanvasChat } from "./use-canvas-chat";

type CanvasChatProps = {
  selectedModelIds: string[];
  onSelectedModelIdsChange: (modelIds: string[]) => void;
  showCanvasButton?: boolean;
  onAddToDocument: (content: string) => void;
  onReplaceDocument?: (content: string) => void;
  onFirstResponse: (content: string) => void;
  documentContent?: string;
  onDocumentChange?: (content: string) => void;
};

export function CanvasChat({
  selectedModelIds,
  onSelectedModelIdsChange,
  showCanvasButton = false,
  onAddToDocument,
  onReplaceDocument,
  onFirstResponse,
  documentContent = "",
  onDocumentChange = () => {},
}: CanvasChatProps) {
  const { chatId } = useChatSession();
  const { createNewChat, getChatById, bumpChat } = useChats();
  const { messages: persistedMessages, cacheAndAddMessage } = useMessages();
  const { user } = useUser();
  const { preferences } = useUserPreferences();
  const { draftValue } = useChatDraft(chatId);
  const { models } = useModel();

  const currentChat = useMemo(
    () => (chatId ? getChatById(chatId) : null),
    [chatId, getChatById]
  );

  const selectedModels = useMemo(
    () =>
      models
        .filter((model: any) => selectedModelIds.includes(model.id))
        .map((model: any) => ({
          id: model.id,
          name: model.name,
          provider: model.provider,
          icon: model.icon,
        })),
    [models, selectedModelIds]
  );

  // File upload functionality
  const {
    files,
    setFiles,
    handleFileUpload,
    handleFileRemove,
  } = useFileUpload();

  // Canvas-specific state
  const [input, setInput] = useState(draftValue || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Default to first selected model (no "All Models" view)
  const [activeModelId, setActiveModelId] = useState<string | null>(
    selectedModelIds[0] || null
  );
  const [canvasChatId, setCanvasChatId] = useState<string | null>(null);

  // Update active model when selection changes
  useEffect(() => {
    if (selectedModelIds.length > 0 && !selectedModelIds.includes(activeModelId || "")) {
      setActiveModelId(selectedModelIds[0]);
    }
  }, [selectedModelIds, activeModelId]);

  const isAuthenticated = useMemo(() => !!user?.id, [user?.id]);
  const systemPrompt = useMemo(
    () => user?.system_prompt || SYSTEM_PROMPT_DEFAULT,
    [user?.system_prompt]
  );

  // Track if we've sent the first response to the document
  // If there are already messages (loaded from persistence), don't auto-populate
  const hasExistingMessages = useMemo(
    () =>
      persistedMessages.some(
        (msg) => msg.role === "assistant" && (msg as any).model
      ),
    [persistedMessages]
  );
  const [hasPopulatedDocument, setHasPopulatedDocument] =
    useState(hasExistingMessages);

  // Handle when a model finishes responding
  const handleMessageFinish = useCallback(
    (modelId: string, content: string) => {
      // Only populate document with the very first response from the first selected model
      // This ensures consistent behavior when multiple models are selected
      const firstModelId = selectedModels[0]?.id;
      
      if (!hasPopulatedDocument && content && modelId === firstModelId) {
        console.log(
          `First response received from ${modelId}, populating document`
        );
        // Convert markdown to HTML for Tiptap editor
        onFirstResponse(markdownToHTML(content));
        setHasPopulatedDocument(true);
      }
    },
    [hasPopulatedDocument, onFirstResponse, selectedModels]
  );

  // Initialize canvas chat hooks for all selected models
  const modelChats = useCanvasChat(selectedModels, persistedMessages, {
    onMessageFinish: handleMessageFinish,
  });

  // Get conversation for the active model
  // Each model tab shows: ALL user messages + only that model's assistant responses
  const filteredConversation = useMemo(() => {
    if (!activeModelId) return [];

    // Find the model chat for this model
    const modelChat = modelChats.find((chat) => chat.model.id === activeModelId);
    if (!modelChat) return [];

    // Return messages from this specific model's chat hook
    // The hook already filters to show all user messages and only this model's responses
    return modelChat.messages;
  }, [activeModelId, modelChats]);

  // Determine max models based on subscription
  const maxModels = useMemo(() => {
    if (!user) return FREE_MAX_MODELS;

    if (isUnlimitedUser(user)) {
      return UNLIMITED_MAX_MODELS;
    }

    if (hasActiveSubscription(user)) {
      return PRO_MAX_MODELS;
    }

    return FREE_MAX_MODELS;
  }, [user]);

  // Handle sending messages to all selected models
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    
    if (selectedModelIds.length === 0) {
      toast({
        title: "No models selected",
        description: "Please select at least one model to chat with.",
        status: "error",
      });
      return;
    }

    setIsSubmitting(true);

    const messageToSend = input;
    setInput("");
    setFiles([]);

    try {
      // All users must be authenticated
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use Yodoo.",
          status: "error",
        });
        return;
      }

      const uid = user.id;
      const messageGroupId = crypto.randomUUID();

      let chatIdToUse = canvasChatId || chatId;
      if (!chatIdToUse) {
        const createdChat = await createNewChat(
          uid,
          messageToSend,
          selectedModelIds[0],
          !!user?.id
        );
        if (!createdChat) {
          throw new Error("Failed to create chat");
        }
        chatIdToUse = createdChat.id;
        setCanvasChatId(chatIdToUse);
        window.history.pushState(null, "", `/canvas?chat=${chatIdToUse}`);
      }

      const selectedChats = modelChats.filter((chat) =>
        selectedModelIds.includes(chat.model.id)
      );

      // Send to all models, but don't let one failure stop the others
      const results = await Promise.allSettled(
        selectedChats.map(async (chat) => {
          const options = {
            body: {
              chatId: chatIdToUse,
              userId: uid,
              model: chat.model.id,
              isAuthenticated: !!user?.id,
              systemPrompt,
              enableSearch: false,
              message_group_id: messageGroupId,
            },
          };

          return chat.append(
            { id: crypto.randomUUID(), role: "user", content: messageToSend },
            options
          );
        })
      );

      // Check if all requests failed
      const allFailed = results.every((result) => result.status === "rejected");
      if (allFailed) {
        throw new Error("All model requests failed. Please check your API keys and try again.");
      }

      if (persistedMessages.length > 0) {
        bumpChat(chatIdToUse);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    input,
    selectedModelIds,
    user,
    modelChats,
    systemPrompt,
    canvasChatId,
    chatId,
    createNewChat,
    persistedMessages.length,
    bumpChat,
    setFiles,
  ]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  const handleStop = useCallback(() => {
    modelChats.forEach((chat) => {
      if (chat.isLoading && selectedModelIds.includes(chat.model.id)) {
        chat.stop();
      }
    });
  }, [modelChats, selectedModelIds]);

  const anyLoading = useMemo(
    () =>
      modelChats.some(
        (chat) => chat.isLoading && selectedModelIds.includes(chat.model.id)
      ),
    [modelChats, selectedModelIds]
  );

  const handleClearConversation = useCallback(() => {
    // Clear chat ID to start fresh
    setCanvasChatId(null);
    setHasPopulatedDocument(false);
    window.history.pushState(null, "", "/canvas");
  }, []);

  return (
    <div className="flex h-full flex-col min-h-screen">
      {/* Canvas Mode header */}
      <div className="flex h-14 items-center justify-between border-b border-t px-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Canvas Mode</span>
          {filteredConversation.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearConversation}
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
            <MobileCanvasSheet
              documentContent={documentContent}
              onDocumentChange={onDocumentChange}
            >
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

      {/* Model tabs - always show when models are selected */}
      {selectedModels.length > 0 && (
        <div className="border-b px-4 py-2">
          <div className="flex gap-2 overflow-x-auto">
            {/* Individual model tabs */}
            {selectedModels.map((model) => {
              const provider = PROVIDERS.find((p) => p.id === model.icon);
              const modelChat = modelChats.find((c) => c.model.id === model.id);
              const hasMessages = modelChat && modelChat.messages.length > 0;
              
              return (
                <div
                  key={model.id}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs cursor-pointer transition-colors ${
                    activeModelId === model.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted/70"
                  }`}
                  onClick={() => setActiveModelId(model.id)}
                >
                  {provider?.icon && <provider.icon className="size-4" />}
                  <span className="font-medium">{model.name}</span>
                  {modelChat?.isLoading && (
                    <div className="size-2 animate-pulse rounded-full bg-primary" />
                  )}
                  {hasMessages && !modelChat?.isLoading && (
                    <div className="size-2 rounded-full bg-green-500" />
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
          isLoading={anyLoading}
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
                !input.trim() || isSubmitting || selectedModelIds.length === 0
              }
              type="button"
              onClick={anyLoading ? handleStop : handleSend}
            >
              {anyLoading ? (
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
