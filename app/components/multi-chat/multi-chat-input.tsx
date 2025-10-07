"use client"

import { useUsage } from "@/app/hooks/use-usage"
import { MultiModelSelector } from "@/components/common/multi-model-selector/base"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input"
import { Button } from "@/components/ui/button"
import { FREE_MAX_MODELS, PRO_MAX_MODELS, UNLIMITED_MAX_MODELS } from "@/lib/config"
import { useUser } from "@/lib/user-store/provider"
import { getUserSubscription, hasActiveSubscription, isUnlimitedUser } from "@/lib/user/types"
import { ArrowUp, Stop } from "@phosphor-icons/react"
import { Crown, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useCallback, useMemo } from "react"

type MultiChatInputProps = {
  value: string
  onValueChange: (value: string) => void
  onSend: () => void
  isSubmitting?: boolean
  files: File[]
  onFileUpload: (files: File[]) => void
  onFileRemove: (file: File) => void
  selectedModelIds: string[]
  onSelectedModelIdsChange: (modelIds: string[]) => void
  isUserAuthenticated: boolean
  stop: () => void
  status?: "submitted" | "streaming" | "ready" | "error"
  anyLoading?: boolean
}

export function MultiChatInput({
  value,
  onValueChange,
  onSend,
  isSubmitting,
  selectedModelIds,
  onSelectedModelIdsChange,
  stop,
  status,
  anyLoading,
}: MultiChatInputProps) {
  const { user } = useUser();
  const { usage, isLoading: usageLoading } = useUsage();
  const router = useRouter();
  
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
  
  // Determine max models based on subscription
  const maxModels = useMemo(() => {
    if (!user) return FREE_MAX_MODELS;
    
    const subscription = getUserSubscription(user);
    
    if (isUnlimitedUser(user)) {
      return UNLIMITED_MAX_MODELS; // 10 models
    }
    
    if (hasActiveSubscription(user)) {
      return PRO_MAX_MODELS; // 4 models
    }
    
    return FREE_MAX_MODELS; // 2 models
  }, [user]);

  const isOnlyWhitespace = (text: string) => !/[^\s]/.test(text)

  const handleSend = useCallback(() => {
    if (isSubmitting || anyLoading) {
      return
    }

    if (status === "streaming") {
      stop()
      return
    }

    onSend()
  }, [isSubmitting, anyLoading, onSend, status, stop])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isSubmitting || anyLoading) {
        e.preventDefault()
        return
      }

      if (e.key === "Enter" && status === "streaming") {
        e.preventDefault()
        return
      }

      if (e.key === "Enter" && !e.shiftKey) {
        if (isOnlyWhitespace(value)) {
          return
        }

        e.preventDefault()
        onSend()
      }
    },
    [isSubmitting, anyLoading, onSend, status, value]
  )

  return (
    <div className="relative flex w-full flex-col gap-4">
      <div className="relative order-2 px-2 pb-3 sm:pb-4 md:order-1">
        <PromptInput
          className="bg-popover relative z-10 p-0 pt-1 shadow-xs backdrop-blur-xl"
          maxHeight={200}
          value={value}
          onValueChange={onValueChange}
        >
          <PromptInputTextarea
            placeholder="Ask all selected models..."
            onKeyDown={handleKeyDown}
            className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
          />
          <PromptInputActions className="mt-5 w-full justify-between px-3 pb-3">
            <div className="flex gap-2">
              <MultiModelSelector
                selectedModelIds={selectedModelIds}
                setSelectedModelIds={onSelectedModelIdsChange}
                maxModels={maxModels}
              />
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
                size="sm"
                className="size-9 rounded-full transition-all duration-300 ease-out"
                disabled={
                  usageLoading || // Disabled while loading usage data
                  (!isOverLimit && ( // Normal send button disabled conditions, but not when showing upgrade button
                    !value ||
                    isSubmitting ||
                    anyLoading ||
                    isOnlyWhitespace(value) ||
                    selectedModelIds.length === 0
                  ))
                }
                type="button"
                onClick={isOverLimit ? handleUpgradeClick : handleSend}
                aria-label={
                  usageLoading
                    ? "Loading..."
                    : isOverLimit 
                      ? "Upgrade to continue messaging" 
                      : status === "streaming" 
                        ? "Stop" 
                        : "Send message"
                }
              >
                {usageLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isOverLimit ? (
                  <Crown className="size-4" />
                ) : status === "streaming" || anyLoading ? (
                  <Stop className="size-4" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  )
}
