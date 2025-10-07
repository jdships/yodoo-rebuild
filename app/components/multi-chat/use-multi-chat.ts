// todo: fix this
/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "@/components/ui/toast"
import type { Message } from "@ai-sdk/react"
import { useChat } from "@ai-sdk/react"
import { useMemo } from "react"

type ModelConfig = {
  id: string
  name: string
  provider: string
}

type ModelChat = {
  model: ModelConfig
  messages: Message[]
  isLoading: boolean
  append: (message: any, options?: any) => void
  stop: () => void
}

// Maximum number of models we support
const MAX_MODELS = 10

export function useMultiChat(
  models: ModelConfig[], 
  initialMessages: Message[] = []
): ModelChat[] {
  console.log('useMultiChat called with:', { 
    models: models.map(m => m.id), 
    initialMessagesCount: initialMessages.length,
    initialMessages: initialMessages.map(m => ({ role: m.role, model: (m as any).model, content: m.content?.slice(0, 50) }))
  });

  // Create a fixed number of useChat hooks to avoid conditional hook calls
  const chatHooks = Array.from({ length: MAX_MODELS }, (_, index) => {
    const model = models[index]
    
    // Filter initial messages for this specific model
    let modelInitialMessages: Message[] = [];
    
    if (model && initialMessages.length > 0) {
      // Simple and reliable filtering: 
      // 1. Include all assistant messages from this model
      // 2. Include user messages only if there's an assistant response from this model after it
      
      const assistantMessagesFromThisModel = initialMessages.filter(msg => 
        msg.role === "assistant" && (msg as any).model === model.id
      );
      
      const assistantMessageGroupIds = new Set(
        assistantMessagesFromThisModel
          .map(msg => (msg as any).message_group_id)
          .filter(Boolean)
      );
      
      modelInitialMessages = initialMessages.filter(msg => {
        if (msg.role === "assistant") {
          // Include assistant messages only from this model
          return (msg as any).model === model.id;
        }
        
        if (msg.role === "user") {
          // Include user messages only if this model responded to them
          const messageGroupId = (msg as any).message_group_id;
          if (messageGroupId && assistantMessageGroupIds.has(messageGroupId)) {
            return true;
          }
          return false;
        }
        
        return false;
      });
      
      // Deduplicate user messages by message_group_id to prevent the same user message
      // from appearing multiple times when multiple models respond to it
      const seenUserMessageGroups = new Set<string>();
      modelInitialMessages = modelInitialMessages.filter(msg => {
        if (msg.role === "user") {
          const messageGroupId = (msg as any).message_group_id;
          if (messageGroupId) {
            if (seenUserMessageGroups.has(messageGroupId)) {
              return false; // Skip duplicate user message
            }
            seenUserMessageGroups.add(messageGroupId);
          }
        }
        return true;
      });
      
      console.log(`Model ${model.id} filtering:`, {
        totalMessages: initialMessages.length,
        assistantFromThisModel: assistantMessagesFromThisModel.length,
        assistantGroupIds: Array.from(assistantMessageGroupIds),
        filteredMessages: modelInitialMessages.length,
        userMessages: modelInitialMessages.filter(m => m.role === "user").length,
        assistantMessages: modelInitialMessages.filter(m => m.role === "assistant").length
      });
    }
    
    // todo: fix this
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useChat({
      api: "/api/chat",
      initialMessages: modelInitialMessages,
      onError: (error) => {
        if (model) {
          console.error(`Error with ${model.name}:`, error)
          toast({
            title: `Error with ${model.name}`,
            description: error.message,
            status: "error",
          })
        }
      },
    })
  })

  // Map only the provided models to their corresponding chat hooks
  const activeChatInstances = useMemo(() => {
    const instances = models.slice(0, MAX_MODELS).map((model, index) => {
      const chatHook = chatHooks[index]

      return {
        model,
        messages: chatHook.messages,
        isLoading: chatHook.isLoading,
        append: (message: any, options?: any) => {
          return chatHook.append(message, options)
        },
        stop: chatHook.stop,
      }
    })

    return instances
    // todo: fix this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models, ...chatHooks.flatMap((chat) => [chat.messages, chat.isLoading])])

  return activeChatInstances
}
