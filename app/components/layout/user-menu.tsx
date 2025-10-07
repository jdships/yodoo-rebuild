"use client";

import { useUsage } from "@/app/hooks/use-usage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlanBadge, type PlanType } from "@/components/ui/plan-badge";
import { useChats } from "@/lib/chat-store/chats/provider";
import { useMessages } from "@/lib/chat-store/messages/provider";
import { clearAllIndexedDbStores } from "@/lib/chat-store/persist";
import { useUser } from "@/lib/user-store/provider";
import { getUserSubscription, hasActiveSubscription } from "@/lib/user/types";
import { SignOut } from "@phosphor-icons/react";
import { CreditCard, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FeedbackTrigger } from "./feedback/feedback-trigger";
import { SettingsTrigger } from "./settings/settings-trigger";

export function UserMenu() {
  const { user, signOut } = useUser();
  const { resetChats } = useChats();
  const { resetMessages } = useMessages();
  const { usage, isLoading } = useUsage();
  const router = useRouter();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  if (!user) {
    return null;
  }

  const handleSettingsOpenChange = (isOpen: boolean) => {
    setSettingsOpen(isOpen);
    if (!isOpen) {
      setMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await resetMessages();
      await resetChats();
      await signOut();
      await clearAllIndexedDbStores();
      setMenuOpen(false);
      router.push("/");
    } catch {
      // Sign out failed, but we'll continue
    }
  };

  // Determine user plan based on subscription data
  const getUserPlan = (): PlanType => {
    const subscription = getUserSubscription(user);
    
    if (subscription.status === "active") {
      if (subscription.type === "unlimited") {
        return "Unlimited";
      }
      if (subscription.type === "pro") {
        return "Pro";
      }
    }
    
    // Fallback to premium field for backward compatibility
    if (user.premium) {
      return "Pro";
    }
    
    return "Free";
  };

  const hasActiveSub = hasActiveSubscription(user);

  // Format usage display based on subscription tier
  const getUsageText = () => {
    if (isLoading) {
      return "Loading...";
    }
    
    if (!usage) {
      return "Usage unavailable";
    }

    const subscription = getUserSubscription(user);
    
    // For unlimited users, show infinity symbol
    if (subscription.type === "unlimited" && subscription.status === "active") {
      return "Usage: ∞ (Unlimited)";
    }

    // For Pro users, show monthly usage
    if (subscription.type === "pro" && subscription.status === "active") {
      if (usage.monthlyLimit > 0) {
        return `Usage: ${usage.monthlyCount} / ${usage.monthlyLimit}`;
      }
      return `Usage: ${usage.monthlyCount} (Pro)`;
    }

    // For free users, show total usage (no more daily limits)
    if (usage.monthlyLimit > 0) {
      // Show usage with limit
      return `Usage: ${usage.monthlyCount} / ${usage.monthlyLimit}`;
    } else {
      // Fallback - this shouldn't happen but just in case
      return `Usage: ${usage.monthlyCount}`;
    }
  };

  return (
    // fix shadcn/ui / radix bug when dialog into dropdown menu
    <DropdownMenu modal={false} onOpenChange={setMenuOpen} open={isMenuOpen}>
      <DropdownMenuTrigger asChild>
        <div className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
          <Avatar className="size-8 bg-background">
            <AvatarImage src={user?.profile_image || undefined} />
            <AvatarFallback className="text-sm">{user?.display_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col items-start overflow-hidden">
            <div className="flex w-full items-center gap-2">
              <span className="truncate font-medium text-sm">{user?.display_name}</span>
              <PlanBadge plan={getUserPlan()} />
            </div>
            <span className="truncate text-muted-foreground text-xs">
              {getUsageText()}
            </span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56"
        forceMount
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (isSettingsOpen) {
            e.preventDefault();
            return;
          }
          setMenuOpen(false);
        }}
      >
        <DropdownMenuItem className="flex flex-col items-start gap-0 no-underline hover:bg-transparent focus:bg-transparent">
          <span>{user?.display_name}</span>
          <span className="max-w-full truncate text-muted-foreground">
            {user?.email}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SettingsTrigger onOpenChange={handleSettingsOpenChange} />
        <FeedbackTrigger />
        <DropdownMenuSeparator />
        
        {/* Upgrade/Billing Link */}
        <DropdownMenuItem
          className="flex items-center gap-2"
          onClick={() => {
            setMenuOpen(false);
            router.push(hasActiveSub ? "/billing" : "/upgrade");
          }}
        >
          {hasActiveSub ? (
            <>
              <CreditCard className="size-4" />
              <span>Billing</span>
            </>
          ) : (
            <>
              <Crown className="size-4" />
              <span>Upgrade</span>
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2"
          onClick={handleSignOut}
        >
          <SignOut className="size-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
