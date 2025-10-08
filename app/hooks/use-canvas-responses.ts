"use client";

import { useCallback, useState } from "react";

export type ModelResponse = {
  id: string; // Unique identifier for each response
  modelId: string;
  modelName: string;
  providerIcon: string;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
};

export type UserMessage = {
  id: string;
  content: string;
  timestamp: Date;
};

export type ConversationMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  modelId?: string;
  modelName?: string;
  providerIcon?: string;
  isStreaming?: boolean;
  // Track which models were selected when this message was sent
  selectedModelIds?: string[];
};

export type CanvasState = {
  conversation: ConversationMessage[];
  documentContent: string;
  isFirstResponse: boolean;
};

export function useCanvasResponses() {
  const [state, setState] = useState<CanvasState>({
    conversation: [],
    documentContent: "# Untitled Document\n\nStart writing your document here...",
    isFirstResponse: true,
  });

  const addMessage = useCallback((content: string, selectedModelIds: string[]) => {
    console.log(`Adding user message "${content}" for models: [${selectedModelIds.join(', ')}]`);
    
    const newMessage: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content,
      timestamp: new Date(),
      selectedModelIds,
    };

    setState(prev => ({
      ...prev,
      conversation: [...prev.conversation, newMessage],
    }));
  }, []);

  const addResponse = useCallback((response: Omit<ModelResponse, 'timestamp' | 'id'>) => {
    const newResponse: ConversationMessage = {
      id: `${response.modelId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      modelId: response.modelId,
      modelName: response.modelName,
      providerIcon: response.providerIcon,
      isStreaming: response.isStreaming,
    };

    setState(prev => {
      let updatedDocumentContent = prev.documentContent;
      
      // Only auto-populate the document if this is the very first response ever
      if (prev.isFirstResponse) {
        updatedDocumentContent = response.content;
        console.log(`First response ever - populating editor with: ${response.modelId}`);
      } else {
        console.log(`New model response - adding to conversation: ${response.modelId}`);
      }

      return {
        ...prev,
        conversation: [...prev.conversation, newResponse],
        documentContent: updatedDocumentContent,
        isFirstResponse: false,
      };
    });
  }, []);

  const updateResponse = useCallback((responseId: string, updates: Partial<ConversationMessage>) => {
    setState(prev => ({
      ...prev,
      conversation: prev.conversation.map(message =>
        message.id === responseId
          ? { ...message, ...updates }
          : message
      ),
    }));
  }, []);

  const addToDocument = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      documentContent: prev.documentContent + "\n\n" + content,
    }));
  }, []);

  const replaceDocument = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      documentContent: content,
    }));
  }, []);

  const updateDocument = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      documentContent: content,
    }));
  }, []);

  const clearResponses = useCallback(() => {
    setState(prev => ({
      ...prev,
      conversation: [],
      isFirstResponse: true,
    }));
  }, []);

  const clearDocument = useCallback(() => {
    setState(prev => ({
      ...prev,
      documentContent: "# Untitled Document\n\nStart writing your document here...",
    }));
  }, []);

  return {
    ...state,
    addMessage,
    addResponse,
    updateResponse,
    addToDocument,
    replaceDocument,
    updateDocument,
    clearResponses,
    clearDocument,
  };
}
