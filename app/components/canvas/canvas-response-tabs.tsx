"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROVIDERS } from "@/lib/providers";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

type ModelResponse = {
  id: string;
  modelId: string;
  modelName: string;
  providerIcon: string;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
};

type CanvasResponseTabsProps = {
  responses: ModelResponse[];
  onCopyToDocument: (content: string) => void;
  onReplaceDocument?: (content: string) => void;
  className?: string;
};

export function CanvasResponseTabs({ 
  responses, 
  onCopyToDocument, 
  onReplaceDocument,
  className = "" 
}: CanvasResponseTabsProps) {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<string>("");

  // Set active tab to first response when responses change
  useEffect(() => {
    if (responses.length > 0 && !activeTab) {
      setActiveTab(responses[0].id);
    }
  }, [responses, activeTab]);

  const handleCopy = async (content: string, responseId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates(prev => ({ ...prev, [responseId]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [responseId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCopyToDocument = (content: string) => {
    onCopyToDocument(content);
  };

  const handleReplaceDocument = (content: string) => {
    if (onReplaceDocument) {
      onReplaceDocument(content);
    }
  };

  if (responses.length === 0) {
    return null; // Don't render anything when there are no responses
  }

  return (
    <div className={`flex h-full flex-col ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 h-auto p-1 rounded-none">
          {responses.map((response) => {
            const provider = PROVIDERS.find((p) => p.id === response.providerIcon);
            const isCopied = copiedStates[response.id];
            
            return (
              <TabsTrigger
                key={response.id}
                value={response.id}
                className="flex items-center gap-2 px-3 py-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                {provider?.icon && <provider.icon className="size-3.5" />}
                <span className="truncate">{response.modelName}</span>
                {response.isStreaming && (
                  <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {responses.map((response) => {
          const isCopied = copiedStates[response.id];
          
          return (
            <TabsContent
              key={response.id}
              value={response.id}
              className="flex-1 overflow-hidden mt-0"
            >
              <div className="flex h-full flex-col">
                {/* Response header with copy buttons */}
                <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {response.modelName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {response.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(response.content, response.id)}
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
                    <div className="flex gap-1">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleCopyToDocument(response.content)}
                        className="h-7 px-2 text-xs"
                      >
                        Add to Document
                      </Button>
                      {onReplaceDocument && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReplaceDocument(response.content)}
                          className="h-7 px-2 text-xs"
                        >
                          Replace Document
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Response content */}
                <div className="flex-1 overflow-auto p-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {response.content}
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
