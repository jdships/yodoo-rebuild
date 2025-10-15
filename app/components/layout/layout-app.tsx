"use client";

import { Header } from "@/app/components/layout/header";
import { AppSidebar } from "@/app/components/layout/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function LayoutApp({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
    
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted && theme === "dark";
  
  return (
    <SidebarProvider>
      <div className="relative flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <Header hasSidebar={true} />
          <main className="@container relative flex-1 overflow-y-auto">
            {/* Background image layer */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 transition-opacity duration-300"
              style={{
                backgroundImage: `url('/${isDark ? 'chatscreen-bg-image-dark.png' : 'chatscreen-bg-image.png'}')`,
                opacity: mounted ? 0.2 : 0
              }}
            />
            {/* Content layer */}
            <div className="relative z-10 h-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
