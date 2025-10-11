"use client";

import { useCallback, useState } from "react";

export type CanvasState = {
  documentContent: string;
  isFirstResponse: boolean;
};

export function useCanvasResponses() {
  const [state, setState] = useState<CanvasState>({
    documentContent: "# Untitled Document\n\nStart writing your document here...",
    isFirstResponse: true,
  });

  const addToDocument = useCallback((content: string) => {
    setState((prev) => ({
      ...prev,
      documentContent: prev.documentContent + "\n\n" + content,
    }));
  }, []);

  const replaceDocument = useCallback((content: string) => {
    setState((prev) => ({
      ...prev,
      documentContent: content,
    }));
  }, []);

  const updateDocument = useCallback((content: string) => {
    setState((prev) => ({
      ...prev,
      documentContent: content,
    }));
  }, []);

  const clearDocument = useCallback(() => {
    setState((prev) => ({
      ...prev,
      documentContent: "# Untitled Document\n\nStart writing your document here...",
    }));
  }, []);

  const handleFirstResponse = useCallback((content: string) => {
    setState((prev) => {
      if (prev.isFirstResponse) {
        console.log("First response ever - populating editor");
        return {
          ...prev,
          documentContent: content,
          isFirstResponse: false,
        };
      }
      return prev;
    });
  }, []);

  const resetFirstResponse = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isFirstResponse: true,
    }));
  }, []);

  return {
    ...state,
    addToDocument,
    replaceDocument,
    updateDocument,
    clearDocument,
    handleFirstResponse,
    resetFirstResponse,
  };
}
