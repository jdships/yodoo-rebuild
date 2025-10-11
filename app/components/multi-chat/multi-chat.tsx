"use client";

import { MultiModelConversation } from "@/app/components/multi-chat/multi-conversation";
import { toast } from "@/components/ui/toast";
import { useChats } from "@/lib/chat-store/chats/provider";
import { useMessages } from "@/lib/chat-store/messages/provider";
import { useChatSession } from "@/lib/chat-store/session/provider";
import { SYSTEM_PROMPT_DEFAULT } from "@/lib/config";
import { useModel } from "@/lib/model-store/provider";
import { useUser } from "@/lib/user-store/provider";
import type { Message as MessageType } from "ai/react";
import { useCallback, useMemo, useState } from "react";
import { MultiChatInput } from "./multi-chat-input";
import { useMultiChat } from "./use-multi-chat";

type ChatInstanceData = {
  modelId: string;
  messages: MessageType[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onReload: () => void;
};

export function MultiChat() {
  const [prompt, setPrompt] = useState("");
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [multiChatId, setMultiChatId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useUser();
  const { models } = useModel();
  const { chatId } = useChatSession();
  const { messages: persistedMessages, isLoading: messagesLoading } =
    useMessages();
  const { createNewChat } = useChats();

  console.log('MultiChat render:', {
    chatId,
    persistedMessagesCount: persistedMessages.length,
    messagesLoading,
    selectedModelIds
  });

  const availableModels = useMemo(
    () =>
      models.map((model) => ({
        id: model.id,
        name: model.name,
        provider: model.provider,
      })),
    [models]
  );

  const modelsFromPersisted = useMemo(
    () =>
      persistedMessages
        .filter((msg) => (msg as any).model)
        .map((msg) => (msg as any).model),
    [persistedMessages]
  );

  const modelsFromLastGroup = useMemo(() => {
    const userMessages = persistedMessages.filter((msg) => msg.role === "user");
    if (userMessages.length === 0) return [];

    const lastUserMessage = userMessages[userMessages.length - 1];
    const lastUserIndex = persistedMessages.indexOf(lastUserMessage);

    const modelsInLastGroup: string[] = [];
    for (let i = lastUserIndex + 1; i < persistedMessages.length; i++) {
      const msg = persistedMessages[i];
      if (msg.role === "user") break;
      if (msg.role === "assistant" && (msg as any).model) {
        modelsInLastGroup.push((msg as any).model);
      }
    }
    return modelsInLastGroup;
  }, [persistedMessages]);

  const allModelsToMaintain = useMemo(() => {
    const combined = [
      ...new Set([...selectedModelIds, ...modelsFromPersisted]),
    ];
    return availableModels.filter((model) => combined.includes(model.id));
  }, [availableModels, selectedModelIds, modelsFromPersisted]);

  if (selectedModelIds.length === 0 && modelsFromLastGroup.length > 0) {
    setSelectedModelIds(modelsFromLastGroup);
  }

  // Don't initialize useMultiChat until messages are loaded (or confirmed empty)
  const modelChats = useMultiChat(allModelsToMaintain, messagesLoading ? [] : persistedMessages);
  const systemPrompt = useMemo(
    () => user?.system_prompt || SYSTEM_PROMPT_DEFAULT,
    [user?.system_prompt]
  );
  const isAuthenticated = useMemo(() => !!user?.id, [user?.id]);

  const createChatInstances = useCallback(() => {
    const instances: ChatInstanceData[] = [];

    // Create instances for all selected models
    for (const modelId of selectedModelIds) {
      let messages: MessageType[] = [];
      let isLoading = false;

      // Find the model chat hook for this model
      const modelChat = modelChats.find((chat) => chat.model.id === modelId);
      
      if (modelChat) {
        isLoading = modelChat.isLoading;
        
        // Get all messages from the chat hook
        const allMessages = modelChat.messages || [];
        
        // Get all messages from the chat hook - filtering is done at the hook level
        messages = allMessages;
      }

      instances.push({
        modelId,
        messages,
        isLoading,
        onDelete: (id: string) => {
          // Handle delete
        },
        onEdit: (id: string, newText: string) => {
          // Handle edit
        },
        onReload: () => {
          // Handle reload for this model
        },
      });
    }

    return instances;
  }, [selectedModelIds, modelChats, persistedMessages]);

  const chatInstances = useMemo(
    () => createChatInstances(),
    [createChatInstances]
  );

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) return;

    if (selectedModelIds.length === 0) {
      toast({
        title: "No models selected",
        description: "Please select at least one model to chat with.",
        status: "error",
      });
      return;
    }

    setIsSubmitting(true);

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

      let chatIdToUse = multiChatId || chatId;
      if (!chatIdToUse) {
        const createdChat = await createNewChat(
          uid,
          prompt,
          selectedModelIds[0],
          !!user?.id
        );
        if (!createdChat) {
          throw new Error("Failed to create chat");
        }
        chatIdToUse = createdChat.id;
        setMultiChatId(chatIdToUse);
        window.history.pushState(null, "", `/c/${chatIdToUse}`);
      }

      const selectedChats = modelChats.filter((chat) =>
        selectedModelIds.includes(chat.model.id)
      );

      await Promise.all(
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

          chat.append({ role: "user", content: prompt }, options);
        })
      );

      setPrompt("");
      setFiles([]);
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    prompt,
    selectedModelIds,
    user,
    modelChats,
    systemPrompt,
    multiChatId,
    chatId,
    createNewChat,
  ]);

  const handleFileUpload = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileRemove = useCallback((fileToRemove: File) => {
    setFiles((prev) => prev.filter((file) => file !== fileToRemove));
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

  const conversationProps = useMemo(() => ({ chatInstances }), [chatInstances]);

  const inputProps = useMemo(
    () => ({
      value: prompt,
      onValueChange: setPrompt,
      onSend: handleSubmit,
      isSubmitting,
      files,
      onFileUpload: handleFileUpload,
      onFileRemove: handleFileRemove,
      selectedModelIds,
      onSelectedModelIdsChange: setSelectedModelIds,
      isUserAuthenticated: isAuthenticated,
      stop: handleStop,
      status: anyLoading ? ("streaming" as const) : ("ready" as const),
      anyLoading,
    }),
    [
      prompt,
      handleSubmit,
      isSubmitting,
      files,
      handleFileUpload,
      handleFileRemove,
      selectedModelIds,
      isAuthenticated,
      handleStop,
      anyLoading,
    ]
  );

  const showOnboarding = chatInstances.length === 0 && !messagesLoading;

  if (showOnboarding) {
    // Initial state: centered input like single chat
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mx-auto max-w-[50rem] text-center">
            <h1 className="mb-6 font-medium text-3xl tracking-tight">
              What's on your mind?
            </h1>
          </div>
          <div className="mx-auto w-full max-w-3xl px-4">
            <MultiChatInput {...inputProps} />
          </div>
        </div>
      </div>
    );
  }

  // Active conversation: input at bottom
  return (
    <div className="flex h-full flex-col">
      {/* Main content area - subtract input area height */}
      <main
        className="hide-scrollbar overflow-auto"
        style={{ height: "calc(100vh - 230px)" }}
      >
        <MultiModelConversation {...conversationProps} />
      </main>

      {/* Input area - fixed height at bottom */}
      <div className="mx-auto flex w-full flex-col gap-2 p-4 pb-2 md:max-w-3xl">
        <MultiChatInput {...inputProps} />
      </div>
    </div>
  );
}
