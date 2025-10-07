"use client";

import { useBreakpoint } from "@/app/hooks/use-breakpoint";
import { useChats } from "@/lib/chat-store/chats/provider";
import { useMessages } from "@/lib/chat-store/messages/provider";
import { useChatSession } from "@/lib/chat-store/session/provider";
import { cn } from "@/lib/utils";
import { ListMagnifyingGlass } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CommandHistory } from "./command-history";
import { DrawerHistory } from "./drawer-history";

type HistoryTriggerProps = {
  classNameTrigger?: string;
  icon?: React.ReactNode;
  label?: React.ReactNode | string;
};

const MOBILE_BREAKPOINT = 768;

export function HistoryTrigger({
  classNameTrigger,
  icon,
  label,
}: HistoryTriggerProps) {
  const isMobile = useBreakpoint(MOBILE_BREAKPOINT);
  const router = useRouter();
  const { chats, updateTitle, deleteChat } = useChats();
  const { deleteMessages } = useMessages();
  const [isOpen, setIsOpen] = useState(false);
  const { chatId } = useChatSession();

  const handleSaveEdit = async (id: string, newTitle: string) => {
    await updateTitle(id, newTitle);
  };

  const handleConfirmDelete = async (id: string) => {
    if (id === chatId) {
      setIsOpen(false);
    }
    await deleteMessages();
    if (chatId) {
      await deleteChat(id, chatId, () => router.push("/"));
    }
  };

  const defaultTrigger = (
    <button
      aria-label="Search"
      className={cn(
        "pointer-events-auto rounded-full bg-background p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        classNameTrigger
      )}
      data-history-trigger
      onClick={() => setIsOpen(true)}
      tabIndex={isMobile ? -1 : 0}
      type="button"
    >
      {icon || <ListMagnifyingGlass size={24} />}
      {label}
    </button>
  );

  if (isMobile) {
    return (
      <DrawerHistory
        chatHistory={chats}
        isOpen={isOpen}
        onConfirmDelete={handleConfirmDelete}
        onSaveEdit={handleSaveEdit}
        setIsOpen={setIsOpen}
        trigger={defaultTrigger}
      />
    );
  }

  return (
    <>
      {defaultTrigger}
      <CommandHistory
        chatHistory={chats}
        isOpen={isOpen}
        onConfirmDelete={handleConfirmDelete}
        onOpenChange={setIsOpen}
        onSaveEdit={handleSaveEdit}
        setIsOpen={setIsOpen}
        trigger={null}
      />
    </>
  );
}
