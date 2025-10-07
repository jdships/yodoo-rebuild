import type { Chat } from "@/lib/chat-store/types";
import type { ReactNode } from "react";
import { SidebarItem } from "./sidebar-item";

type SidebarListProps = {
  title: string;
  icon?: ReactNode;
  items: Chat[];
  currentChatId: string;
};

export function SidebarList({
  title,
  icon,
  items,
  currentChatId,
}: SidebarListProps) {
  return (
    <div>
      <h3 className="flex items-center gap-1 overflow-hidden text-ellipsis break-all px-2 pt-3 pb-2 font-semibold text-muted-foreground text-xs">
        {icon && <span>{icon}</span>}
        {title}
      </h3>
      <div className="space-y-0.5">
        {items.map((chat) => (
          <SidebarItem
            chat={chat}
            currentChatId={currentChatId}
            key={chat.id}
          />
        ))}
      </div>
    </div>
  );
}
