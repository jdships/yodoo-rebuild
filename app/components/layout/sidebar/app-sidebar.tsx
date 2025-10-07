"use client";

import { HistoryTrigger } from "@/app/components/history/history-trigger";
import { groupChatsByDate } from "@/app/components/history/utils";
import { UserMenu } from "@/app/components/layout/user-menu";
import { useBreakpoint } from "@/app/hooks/use-breakpoint";
import { useKeyShortcut } from "@/app/hooks/use-key-shortcut";
import { Logo } from "@/components/icons/yodoo";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useChats } from "@/lib/chat-store/chats/provider";
import { cn } from "@/lib/utils";
import { ChatTeardropText, X } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Newspaper, Pin, Plus, Search, Wrench } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { NotificationsPopover } from "./nav-notifications";
import { SidebarList } from "./sidebar-list";
import { SidebarProject } from "./sidebar-project";

const MOBILE_BREAKPOINT = 768;

function NewChatButton({ onClick }: { onClick: () => void }) {
  return (
    <SidebarMenuItem>
      <Button
        className="mb-2 w-full"
        onClick={onClick}
        size="sm"
        variant="gradient"
      >
        <Plus />
        <span>New Chat</span>
      </Button>
    </SidebarMenuItem>
  );
}

function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton className="group/search" onClick={onClick}>
        <Search className="size-5" />
        <span>Search</span>
        <div className="ml-auto text-muted-foreground text-xs opacity-0 duration-150 group-hover/search:opacity-100">
          ⌘+K
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function ToolsButton({
  onClick,
  isActive,
}: {
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={cn(
          "group/tools",
          isActive && "bg-accent text-accent-foreground"
        )}
        onClick={onClick}
      >
        <Wrench className="size-5" />
        <span>Tools</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NewsButton({
  onClick,
  isActive,
}: {
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={cn(
          "group/news",
          isActive && "bg-accent text-accent-foreground"
        )}
        onClick={onClick}
      >
        <Newspaper className="size-5" />
        <span>News</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

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

function useSidebarState() {
  const isMobile = useBreakpoint(MOBILE_BREAKPOINT);
  const { setOpenMobile } = useSidebar();
  const { chats, pinnedChats, isLoading } = useChats();
  const params = useParams<{ chatId: string }>();
  const currentChatId = params.chatId;
  const router = useRouter();
  const pathname = usePathname();

  const hasChats = chats.length > 0;
  const showEmptyState = !(isLoading || hasChats);
  const groupedChats = useMemo(() => groupChatsByDate(chats, ""), [chats]);
  const isToolsActive = pathname === "/tools";
  const isNewsActive = pathname === "/news";
  return {
    isMobile,
    setOpenMobile,
    chats,
    pinnedChats,
    isLoading,
    currentChatId,
    router,
    hasChats,
    showEmptyState,
    groupedChats,
    isToolsActive,
    isNewsActive,
  };
}

function useSidebarActions() {
  const router = useRouter();

  useKeyShortcut(
    (e: KeyboardEvent) =>
      (e.key === "u" || e.key === "U") && e.metaKey && e.shiftKey,
    () => router.push("/")
  );

  const handleNewChatClick = () => {
    router.push("/");
  };

  const handleSearchClick = () => {
    const historyTrigger = document.querySelector(
      "[data-history-trigger]"
    ) as HTMLElement;
    if (historyTrigger) {
      historyTrigger.click();
    }
  };

  const handleToolsClick = () => {
    router.push("/tools");
  };

  const handleNewsClick = () => {
    router.push("/news");
  };

  return {
    handleNewChatClick,
    handleSearchClick,
    handleToolsClick,
    handleNewsClick,
  };
}

export function AppSidebar() {
  const {
    isMobile,
    setOpenMobile,
    pinnedChats,
    isLoading,
    currentChatId,
    hasChats,
    showEmptyState,
    groupedChats,
    isToolsActive,
    isNewsActive,
  } = useSidebarState();

  const { handleNewChatClick, handleSearchClick, handleToolsClick, handleNewsClick } =
    useSidebarActions();

  return (
    <>
      {/* Hidden history trigger for programmatic access */}
      <div className="hidden">
        <HistoryTrigger classNameTrigger="hidden" data-history-trigger />
      </div>
      <Sidebar variant="inset">
        <SidebarHeader
          className={cn("flex flex-row items-center justify-between md:pt-3.5")}
        >
          <Link className="flex items-center" href="/">
            <Logo className="h-7 pl-2" />
          </Link>

          <motion.div
            animate={{ opacity: 1 }}
            className={cn("flex items-center gap-2")}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <NotificationsPopover notifications={sampleNotifications} />
            {isMobile && (
              <button
                className="inline-flex size-9 items-center justify-center rounded-md bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                onClick={() => setOpenMobile(false)}
                type="button"
              >
                <X size={24} />
              </button>
            )}
          </motion.div>
        </SidebarHeader>
        <SidebarContent className="gap-4 px-2 py-4 pt-2">
          <SidebarMenu className="gap-0.5">
            <NewChatButton onClick={handleNewChatClick} />
            <SearchButton onClick={handleSearchClick} />
            <ToolsButton isActive={isToolsActive} onClick={handleToolsClick} />
            <NewsButton isActive={isNewsActive} onClick={handleNewsClick} />
          </SidebarMenu>
          <SidebarProject />
          {isLoading && <div className="h-full" />}
          {!isLoading && hasChats && (
            <div className="space-y-5">
              {pinnedChats.length > 0 && (
                <div className="space-y-5">
                  <SidebarList
                    currentChatId={currentChatId}
                    icon={<Pin className="size-3" />}
                    items={pinnedChats}
                    key="pinned"
                    title="Pinned"
                  />
                </div>
              )}
              {groupedChats?.map((group) => (
                <SidebarList
                  currentChatId={currentChatId}
                  items={group.chats}
                  key={group.name}
                  title={group.name}
                />
              ))}
            </div>
          )}
          {showEmptyState && (
            <div className="flex h-[calc(100vh-160px)] flex-col items-center justify-center">
              <ChatTeardropText
                className="mb-1 text-muted-foreground opacity-40"
                size={24}
              />
              <div className="text-center text-muted-foreground">
                <p className="mb-1 font-medium text-base">No chats yet</p>
                <p className="text-sm opacity-70">Start a new conversation</p>
              </div>
            </div>
          )}
        </SidebarContent>
        <SidebarFooter className="px-2">
          <UserMenu />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
