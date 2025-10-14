"use client";

import { HistoryTrigger } from "@/app/components/history/history-trigger";
import { Logo } from "@/components/icons/yodoo";
import { Button } from "@/components/ui/button";
import { useUserPreferences } from "@/lib/user-preference-store/provider";
import { useUser } from "@/lib/user-store/provider";
import { 
  Columns2, 
  LogInIcon, 
  Table2, 
  Settings, 
  Moon, 
  Sun, 
  Sparkles,
  Crown,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DialogPublish } from "./dialog-publish";
import { HeaderSidebarTrigger } from "./header-sidebar-trigger";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { hasActiveSubscription, getUserSubscription } from "@/lib/user/types";
import { useBreakpoint } from "@/app/hooks/use-breakpoint";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { SettingsContent } from "./settings/settings-content";
import { LanguageTrigger } from "./language/language-trigger";
import { NotificationsPopover } from "./sidebar/nav-notifications";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { PlanBadge, type PlanType } from "@/components/ui/plan-badge";
import { useUsage } from "@/app/hooks/use-usage";
import { useChats } from "@/lib/chat-store/chats/provider";
import { useMessages } from "@/lib/chat-store/messages/provider";
import { clearAllIndexedDbStores } from "@/lib/chat-store/persist";
import { SignOut } from "@phosphor-icons/react";
import { FeedbackTrigger } from "./feedback/feedback-trigger";

// Countries data
const countries = [
  { code: "US", name: "English", flag: "🇺🇸" },
  { code: "GB", name: "English", flag: "🇬🇧" },
  { code: "ES", name: "Español", flag: "🇪🇸" },
  { code: "FR", name: "Français", flag: "🇫🇷" },
  { code: "DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "IT", name: "Italiano", flag: "🇮🇹" },
  { code: "PT", name: "Português", flag: "🇵🇹" },
  { code: "RU", name: "Русский", flag: "🇷🇺" },
  { code: "CN", name: "中文", flag: "🇨🇳" },
  { code: "JP", name: "日本語", flag: "🇯🇵" },
];

// Notifications data
const sampleNotifications = [
  {
    id: "1",
    avatar: "/avatars/01.png",
    fallback: "OM",
    text: "New order received.",
    time: "10m ago",
  },
  {
    id: "2", 
    avatar: "/avatars/02.png",
    fallback: "JL",
    text: "Server upgrade completed.",
    time: "1h ago",
  },
  {
    id: "3",
    avatar: "/avatars/03.png",
    fallback: "HH",
    text: "New user signed up.",
    time: "2h ago",
  },
];

export function Header({ hasSidebar }: { hasSidebar: boolean }) {
  const { user, signOut } = useUser();
  const { preferences, setMultiModelEnabled } = useUserPreferences();
  const isMultiModelEnabled = preferences.multiModelEnabled;
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobile = useBreakpoint(768);
  
  // User menu related hooks
  const { resetChats } = useChats();
  const { resetMessages } = useMessages();
  const { usage, isLoading } = useUsage();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = !!user;

  const handleCompareToggle = () => {
    setMultiModelEnabled(!isMultiModelEnabled);
  };

  const handleCanvasClick = () => {
    router.push("/canvas");
  };

  const hasActiveSub = user ? hasActiveSubscription(user) : false;

  const toggleTheme = () => {
    if (mounted) {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  const handleSignOut = async () => {
    try {
      await resetMessages();
      await resetChats();
      await signOut();
      await clearAllIndexedDbStores();
      setUserMenuOpen(false);
      router.push("/");
    } catch {
      // Sign out failed, but we'll continue
    }
  };

  // Determine user plan based on subscription data
  const getUserPlan = (): PlanType => {
    if (!user) return "Free";
    
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

  // Format usage display based on subscription tier
  const getUsageText = () => {
    if (isLoading) {
      return "Loading...";
    }
    
    if (!usage) {
      return "Usage unavailable";
    }

    if (!user) return "Usage unavailable";

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
  }

  console.log("Rendering Header with user:", user);

  

  return (
    <header className="pointer-events-none relative z-50 h-app-header">
      <div className="relative mx-auto flex h-full max-w-full items-center justify-between bg-transparent px-4 sm:px-6 lg:bg-transparent">
        <div className="flex flex-1 items-center justify-between">
          <div className="-ml-0.5 lg:-ml-2.5 flex flex-1 items-center gap-2">
            <div className="flex flex-1 items-center gap-2">
              {!hasSidebar && (
                <Link
                  className="pointer-events-auto mt-4 inline-flex items-center font-medium text-xl tracking-tight"
                  href="/"
                >
                  <Logo className="mr-1 h-7" />
                </Link>
              )}
              {hasSidebar && <HeaderSidebarTrigger />}
            </div>
          </div>
          <div />
          {isLoggedIn ? (
            <div className="pointer-events-auto mt-2 flex flex-1 items-center justify-end gap-2">
              {!isMultiModelEnabled && <DialogPublish />}
              {!hasSidebar && <HistoryTrigger />}
              
              {/* Canvas Button */}
              <Button 
                size="sm" 
                variant="gradient"
                onClick={handleCanvasClick}
              >
                <Table2 className="size-4" />
                Canvas
              </Button>
              
              {/* Compare Button */}
              <Button 
                size="sm" 
                variant={isMultiModelEnabled ? "default" : "outline"}
                onClick={handleCompareToggle}
              >
                <Columns2 className="size-4" />
                Compare
              </Button>

              {/* Theme Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="h-8 w-8 p-0"
                  >
                    {mounted && theme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Switch to {theme === "dark" ? "light" : "dark"} mode
                </TooltipContent>
              </Tooltip>

              {/* Notifications */}
              {isMobile ? (
                <NotificationsPopover notifications={sampleNotifications} isMobile={true} />
              ) : (
                <NotificationsPopover notifications={sampleNotifications} />
              )}

              {/* Settings - Button with tooltip that opens settings modal */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Settings
                </TooltipContent>
              </Tooltip>

              {/* Try Premium Button */}
              <Button 
                size="sm" 
                variant="default"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
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
               <Crown className="h-4 w-4 mr-1" />
                Try Premium
                <Sparkles className="h-4 w-4 ml-1" />
            </>
          )}
              </Button>

              {/* Language/Country Selector */}
              <LanguageTrigger 
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
              />

              {/* User Profile */}
              <DropdownMenu modal={false} onOpenChange={setUserMenuOpen} open={isUserMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <div className="flex cursor-pointer items-center gap-2 rounded-lg p-1 hover:bg-muted/50 transition-colors">
                    <Avatar className="size-8 bg-background">
                      <AvatarImage src={user?.profile_image || undefined} />
                      <AvatarFallback className="text-sm">{user?.display_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
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
                    setUserMenuOpen(false);
                  }}
                >
                  <DropdownMenuItem className="flex flex-col items-start gap-0 no-underline hover:bg-transparent focus:bg-transparent">
                    <div className="flex w-full items-center gap-2">
                      <span className="truncate font-medium text-sm">{user?.display_name}</span>
                      <PlanBadge plan={getUserPlan()} />
                    </div>
                    <span className="max-w-full truncate text-muted-foreground text-xs">
                      {user?.email}
                    </span>
                    <span className="truncate text-muted-foreground text-xs mt-1">
                      {getUsageText()}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* <SettingsTrigger onOpenChange={handleUserMenuSettingsOpenChange} /> */}
                  <FeedbackTrigger />
                  <DropdownMenuSeparator />
                  
                  {/* Upgrade/Billing Link */}
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => {
                      setUserMenuOpen(false);
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
            </div>
          ) : (
            <div className="pointer-events-auto mt-4 flex flex-1 items-center justify-end gap-2">
              {/* Theme Toggle for logged out users */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="h-8 w-8 p-0"
                  >
                    {mounted && theme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Switch to {theme === "dark" ? "light" : "dark"} mode
                </TooltipContent>
              </Tooltip>

              {/* Language/Country Selector for logged out users */}
              <LanguageTrigger 
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
              />

              <Link href="/auth">
                <Button size="sm" variant="outline">
                  <LogInIcon className="size-4" />
                  Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal/Drawer */}
      {isMobile ? (
        <Drawer open={isSettingsOpen} onOpenChange={setSettingsOpen}>
          <DrawerContent>
            <SettingsContent isDrawer />
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="flex h-[80%] min-h-[480px] w-full flex-col gap-0 p-0 sm:max-w-[768px]">
            <DialogHeader className="border-border border-b px-6 py-5">
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <SettingsContent />
          </DialogContent>
        </Dialog>
      )}
    </header>
  );
}
