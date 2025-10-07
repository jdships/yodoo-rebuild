"use client";

import { HistoryTrigger } from "@/app/components/history/history-trigger";
import { ThemeSwitcher } from "@/components/common/theme-switch";
import { Logo } from "@/components/icons/yodoo";
import { Button } from "@/components/ui/button";
import { useUserPreferences } from "@/lib/user-preference-store/provider";
import { useUser } from "@/lib/user-store/provider";
import { Columns2, LogInIcon, Table2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DialogPublish } from "./dialog-publish";
import { HeaderSidebarTrigger } from "./header-sidebar-trigger";

export function Header({ hasSidebar }: { hasSidebar: boolean }) {
  const { user } = useUser();
  const { preferences, setMultiModelEnabled } = useUserPreferences();
  const isMultiModelEnabled = preferences.multiModelEnabled;
  const router = useRouter();

  const isLoggedIn = !!user;

  const handleCompareToggle = () => {
    setMultiModelEnabled(!isMultiModelEnabled);
  };

  const handleCanvasClick = () => {
    router.push("/canvas");
  };

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
                      <Button 
                size="sm" 
                variant="gradient"
                onClick={handleCanvasClick}
              >
                <Table2 className="size-4" />
                Canvas
              </Button>
              <Button 
                size="sm" 
                variant={isMultiModelEnabled ? "default" : "outline"}
                onClick={handleCompareToggle}

              >
                <Columns2 className="size-4" />
                Compare
              </Button>
              <ThemeSwitcher />
            </div>
          ) : (
            <div className="pointer-events-auto mt-4 flex flex-1 items-center justify-end gap-2">
              <Link href="/auth">
                <Button size="sm" variant="outline">
                  <LogInIcon className="size-4" />
                  Login
                </Button>
              </Link>
              <ThemeSwitcher />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
