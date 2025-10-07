"use client";

import { useUsage } from "@/app/hooks/use-usage";
import { ModelSelector } from "@/components/common/model-selector/base";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input";
import { Button } from "@/components/ui/button";
import { getModelInfo } from "@/lib/models";
import {
  extractSlashCommand,
  getPromptForCategory,
  getSuggestionCategoryFromCommand,
  isSlashCommand
} from "@/lib/slash-commands";
import type { ToolConfig } from "@/lib/tools/types";
import { ArrowUpIcon, StopIcon } from "@phosphor-icons/react";
import { Crown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PromptSystem } from "../suggestions/prompt-system";
import { ButtonFileUpload } from "./button-file-upload";
import { ButtonSearch } from "./button-search";
import { FileList } from "./file-list";
import { ToolsContainer } from "./tools-container";

type ChatInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSend: () => void;
  isSubmitting?: boolean;
  hasMessages?: boolean;
  files: File[];
  onFileUpload: (files: File[]) => void;
  onFileRemove: (file: File) => void;
  onSuggestion: (suggestion: string) => void;
  hasSuggestions?: boolean;
  onSelectModel: (model: string) => void;
  selectedModel: string;
  isUserAuthenticated: boolean;
  stop: () => void;
  status?: "submitted" | "streaming" | "ready" | "error";
  setEnableSearch: (enabled: boolean) => void;
  enableSearch: boolean;
  quotedText?: { text: string; messageId: string } | null;
  showTools?: boolean;
  compact?: boolean;
};

export function ChatInput({
  value,
  onValueChange,
  onSend,
  isSubmitting,
  files,
  onFileUpload,
  onFileRemove,
  onSuggestion,
  hasSuggestions,
  onSelectModel,
  selectedModel,
  isUserAuthenticated,
  stop,
  status,
  setEnableSearch,
  enableSearch,
  quotedText,
  showTools = true,
  compact = false,
}: ChatInputProps) {
  const { usage, isLoading: usageLoading } = useUsage();
  const router = useRouter();
  const [selectedTools, setSelectedTools] = useState<ToolConfig[]>([]);
  const [slashCommandActive, setSlashCommandActive] = useState<string | null>(null);
  
  // Check if user has exceeded their usage limits
  const isOverLimit = useMemo(() => {
    if (!usage) return false;
    
    // Unlimited users never hit limits
    if (usage.subscriptionType === "unlimited") return false;
    
    // For Pro users, check monthly limit
    if (usage.subscriptionType === "pro") {
      return usage.monthlyLimit > 0 && usage.monthlyCount >= usage.monthlyLimit;
    }
    
    // For free users, check their total limit
    return usage.monthlyLimit > 0 && usage.monthlyCount >= usage.monthlyLimit;
  }, [usage]);

  const handleUpgradeClick = useCallback(() => {
    router.push("/upgrade");
  }, [router]);

  const handleToolSelect = useCallback((tool: ToolConfig) => {
    setSelectedTools(prev => {
      const isSelected = prev.some(t => t.id === tool.id);
      if (isSelected) {
        // Remove tool
        return prev.filter(t => t.id !== tool.id);
      } else {
        // Add tool
        return [...prev, tool];
      }
    });
  }, []);

  // Handle value changes and detect slash commands
  const handleValueChange = useCallback((newValue: string) => {
    onValueChange(newValue);
    
    // Check if this is a slash command
    if (isSlashCommand(newValue)) {
      const command = extractSlashCommand(newValue);
      if (command) {
        const category = getSuggestionCategoryFromCommand(command);
        if (category) {
          setSlashCommandActive(category);
          // Set the prompt text for the category
          const promptText = getPromptForCategory(category);
          if (promptText) {
            onValueChange(promptText);
          }
        }
      }
    } else {
      // Clear slash command state if not a slash command
      if (slashCommandActive) {
        setSlashCommandActive(null);
      }
    }
  }, [onValueChange, slashCommandActive]);
  const selectModelConfig = getModelInfo(selectedModel);
  const hasSearchSupport = Boolean(selectModelConfig?.webSearch);
  const isOnlyWhitespace = (text: string) => !/[^\s]/.test(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    if (status === "streaming") {
      stop();
      return;
    }

    onSend();
  }, [isSubmitting, onSend, status, stop]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isSubmitting) {
        e.preventDefault();
        return;
      }

      if (e.key === "Enter" && status === "streaming") {
        e.preventDefault();
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        if (isOnlyWhitespace(value)) {
          return;
        }

        e.preventDefault();
        onSend();
      }
    },
    [isSubmitting, onSend, status, value]
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const hasImageContent = Array.from(items).some((item) =>
        item.type.startsWith("image/")
      );

      if (!isUserAuthenticated && hasImageContent) {
        e.preventDefault();
        return;
      }

      if (isUserAuthenticated && hasImageContent) {
        const imageFiles: File[] = [];

        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              const newFile = new File(
                [file],
                `pasted-image-${Date.now()}.${file.type.split("/")[1]}`,
                { type: file.type }
              );
              imageFiles.push(newFile);
            }
          }
        }

        if (imageFiles.length > 0) {
          onFileUpload(imageFiles);
        }
      }
      // Text pasting will work by default for everyone
    },
    [isUserAuthenticated, onFileUpload]
  );

  useEffect(() => {
    if (quotedText) {
      const quoted = quotedText.text
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
      onValueChange(value ? `${value}\n\n${quoted}\n\n` : `${quoted}\n\n`);

      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotedText, onValueChange]);

  useMemo(() => {
    if (!hasSearchSupport && enableSearch) {
      setEnableSearch?.(false);
    }
  }, [hasSearchSupport, enableSearch, setEnableSearch]);

  return (
    <div className="relative flex w-full flex-col gap-4">
      {(hasSuggestions || slashCommandActive) && (
        <PromptSystem
          onSuggestion={onSuggestion}
          onValueChange={handleValueChange}
          value={value}
          activeCategory={slashCommandActive}
        />
      )}
      <div
        className={`relative order-2 px-2 md:order-1 ${compact ? 'pb-1' : 'pb-3 sm:pb-4'}`}
        onClick={() => textareaRef.current?.focus()}
      >
        <PromptInput
          className="relative z-10 bg-popover p-0 pt-1 shadow-xs backdrop-blur-xl"
          maxHeight={200}
          onValueChange={handleValueChange}
          value={value}
        >
          <FileList files={files} onFileRemove={onFileRemove} />
          <PromptInputTextarea
            className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Ask Yodoo"
            ref={textareaRef}
          />
          <PromptInputActions className="mt-3 w-full justify-between p-2">
            <div className="flex gap-2">
              <ButtonFileUpload
                isUserAuthenticated={isUserAuthenticated}
                model={selectedModel}
                onFileUpload={onFileUpload}
              />
              <ModelSelector
                className="rounded-full"
                isUserAuthenticated={isUserAuthenticated}
                selectedModelId={selectedModel}
                setSelectedModelId={onSelectModel}
              />
              {hasSearchSupport ? (
                <ButtonSearch
                  isAuthenticated={isUserAuthenticated}
                  isSelected={enableSearch}
                  onToggle={setEnableSearch}
                />
              ) : null}
            </div>
            <PromptInputAction
              tooltip={
                usageLoading
                  ? "Loading..."
                  : isOverLimit 
                    ? "Upgrade to continue messaging" 
                    : status === "streaming" 
                      ? "Stop" 
                      : "Send"
              }
            >
              <Button
                aria-label={
                  usageLoading
                    ? "Loading..."
                    : isOverLimit 
                      ? "Upgrade to continue messaging" 
                      : status === "streaming" 
                        ? "Stop" 
                        : "Send message"
                }
                className="size-9 rounded-full transition-all duration-300 ease-out"
                disabled={
                  usageLoading || // Disabled while loading usage data
                  (!isOverLimit && (!value || isSubmitting || isOnlyWhitespace(value))) // Normal send button disabled conditions, but not when showing upgrade button
                }
                onClick={isOverLimit ? handleUpgradeClick : handleSend}
                size="sm"
                type="button"
                variant={isOverLimit ? "default" : "gradient"}
              >
                {usageLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isOverLimit ? (
                  <Crown className="size-4" />
                ) : status === "streaming" ? (
                  <StopIcon className="size-4" />
                ) : (
                  <ArrowUpIcon className="size-4" />
                )}
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
        
        {/* Tools Container - attached to input like Genspark */}
        {showTools && (
          <div className="mx-3 mb-3 rounded-b-lg border-r border-l border-b border-t-none bg-sidebar p-1 backdrop-blur-sm">
            <ToolsContainer
              onToolSelect={handleToolSelect}
              selectedTools={selectedTools}
            />
          </div>
        )}
      </div>
    </div>
  );
}
