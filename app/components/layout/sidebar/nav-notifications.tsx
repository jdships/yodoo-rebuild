"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellIcon } from "lucide-react";

type Notification = {
  id: string;
  avatar: string;
  fallback: string;
  text: string;
  time: string;
};

type NotificationsPopoverProps = {
  notifications: Notification[];
  isMobile?: boolean;
  showCount?: boolean;
  count?: number;
};

export function NotificationsPopover({
  notifications,
  isMobile = false,
  showCount = true,
  count,
}: NotificationsPopoverProps) {
  const displayCount = typeof count === "number" ? count : notifications.length;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open notifications"
          className="rounded-full relative"
          size="icon"
          variant="ghost"
        >
          <BellIcon className="h-4 w-4" />
          {showCount && displayCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white">
              {displayCount > 99 ? "99+" : displayCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className={`my-10 w-80 ${isMobile ? 'mt-4' : ''}`} 
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "end" : "start"}
      >
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map(({ id, avatar, fallback, text, time }) => (
          <DropdownMenuItem className="flex items-start gap-3" key={id}>
            <Avatar className="size-8">
              <AvatarImage alt="Avatar" src={avatar} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{text}</span>
              <span className="text-muted-foreground text-xs">{time}</span>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-muted-foreground text-sm hover:text-primary">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
