import { toast } from "@/components/ui/toast";
import type { Message } from "ai/react";
import { useChat } from "ai/react";
import { useMemo } from "react";

type ModelConfig = {
  id: string;
  name: string;
  provider: string;
  icon: string;
};

type ModelChat = {
  model: ModelConfig;
  messages: Message[];
  isLoading: boolean;
  append: (message: Message, options?: any) => void;
  stop: () => void;
};

const MAX_MODELS = 10;

type UseCanvasChatOptions = {
  onMessageFinish?: (modelId: string, content: string) => void;
};

export function useCanvasChat(
  models: ModelConfig[],
  initialMessages: Message[] = [],
  options?: UseCanvasChatOptions
): ModelChat[] {
  console.log("useCanvasChat called with:", {
    models: models.map((m) => m.id),
    initialMessagesCount: initialMessages.length,
    initialMessages: initialMessages.map((m) => ({
      role: m.role,
      model: (m as any).model,
      content: m.content?.slice(0, 50),
    })),
  });

  // Create a fixed number of useChat hooks to avoid conditional hook calls
  const chatHooks = Array.from({ length: MAX_MODELS }, (_, index) => {
    const model = models[index];

    // Filter initial messages for this specific model
    let modelInitialMessages: Message[] = [];

    if (model && initialMessages.length > 0) {
      // Canvas behavior: Each model sees ALL user messages + only its own assistant responses
      // This allows users to compare different model responses to the same prompts
      
      modelInitialMessages = initialMessages.filter((msg) => {
        if (msg.role === "assistant") {
          // Only include assistant messages from this specific model
          return (msg as any).model === model.id;
        }

        if (msg.role === "user") {
          // Include ALL user messages
          return true;
        }

        return false;
      });

      // Deduplicate user messages by message_group_id
      // (In case the same message appears multiple times in initial messages)
      const seenUserMessageGroups = new Set<string>();
      const deduplicatedMessages: Message[] = [];
      
      for (const msg of modelInitialMessages) {
        if (msg.role === "user") {
          const messageGroupId = (msg as any).message_group_id;
          if (messageGroupId && seenUserMessageGroups.has(messageGroupId)) {
            continue; // Skip duplicate
          }
          if (messageGroupId) {
            seenUserMessageGroups.add(messageGroupId);
          }
        }
        deduplicatedMessages.push(msg);
      }
      
      modelInitialMessages = deduplicatedMessages;

      console.log(`Model ${model.id} filtering:`, {
        totalMessages: initialMessages.length,
        filteredMessages: modelInitialMessages.length,
        userMessages: modelInitialMessages.filter((m) => m.role === "user")
          .length,
        assistantMessages: modelInitialMessages.filter(
          (m) => m.role === "assistant"
        ).length,
      });
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useChat({
      api: "/api/chat",
      initialMessages: modelInitialMessages,
      onFinish: (message) => {
        // Call the callback when an assistant message finishes
        if (model && message.role === "assistant" && options?.onMessageFinish) {
          let content = "";
          
          if (typeof message.content === "string") {
            content = message.content;
          } else if (message.content && Array.isArray(message.content)) {
            content = (message.content as any[])
              .filter((part: any) => part.type === "text")
              .map((part: any) => part.text)
              .join("\n");
          }

          if (content) {
            options.onMessageFinish(model.id, content);
          }
        }
      },
      onError: (error) => {
        if (model) {
          console.error(`Error with ${model.name}:`, error);

          // Parse error message for better UX
          let errorMessage = error.message;
          try {
            const parsed = JSON.parse(error.message);
            if (parsed.error) {
              errorMessage = parsed.error;
            }
          } catch {
            // Keep original error message if not JSON
          }

          // Show specific error toast for this model
          toast({
            title: `${model.name} failed`,
            description: errorMessage,
            status: "error",
          });
        }
      },
    });
  });

  // Map only the provided models to their corresponding chat hooks
  const activeChatInstances = useMemo(() => {
    const instances = models.slice(0, MAX_MODELS).map((model, index) => {
      const chatHook = chatHooks[index];

      return {
        model,
        messages: chatHook.messages,
        isLoading: chatHook.isLoading,
        append: (message: Message, options?: any) => {
          return chatHook.append(message, options);
        },
        stop: chatHook.stop,
      };
    });

    return instances;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models, ...chatHooks.flatMap((chat) => [chat.messages, chat.isLoading])]);

  return activeChatInstances;
}



