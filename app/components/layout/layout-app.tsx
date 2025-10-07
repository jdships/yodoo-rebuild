"use client";

import { Header } from "@/app/components/layout/header";
import { AppSidebar } from "@/app/components/layout/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <Header hasSidebar={true} />
          <main className="@container relative flex-1 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
