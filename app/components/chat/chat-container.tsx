"use client";

import { MultiChat } from "@/app/components/multi-chat/multi-chat";
import { useUserPreferences } from "@/lib/user-preference-store/provider";
import { useEffect, useState } from "react";
import { Chat } from "./chat";

function LoadingChatContainer() {
  return (
    <div className="@container/main relative flex h-full w-full flex-col items-center justify-center">
      {/* Loading spinner */}
      <div className="flex items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    </div>
  );
}

export function ChatContainer() {
  const { preferences, isLoading } = useUserPreferences();
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show consistent loading state during hydration to prevent layout shifts
  if (!isClient || isLoading) {
    return <LoadingChatContainer />;
  }

  const multiModelEnabled = preferences.multiModelEnabled;

  if (multiModelEnabled) {
    return <MultiChat />;
  }

  return <Chat />;
}
