import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatsProvider } from "@/lib/chat-store/chats/provider";
import { ChatSessionProvider } from "@/lib/chat-store/session/provider";
import { ModelProvider } from "@/lib/model-store/provider";
import { TanstackQueryProvider } from "@/lib/tanstack-query/tanstack-query-provider";
import { UserPreferencesProvider } from "@/lib/user-preference-store/provider";
import { UserProvider } from "@/lib/user-store/provider";
import { getUserProfile } from "@/lib/user/api";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LayoutClient } from "./layout-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yodoo - Multi-Model AI Chat Platform",
  description:
    "The ultimate multi-model AI chat platform. Compare responses from GPT-4, Claude, Gemini, and more side-by-side. Integrated tools, collaborative canvas, and team features for professionals.",
  keywords: [
    "AI chat",
    "multi-model AI",
    "GPT-4",
    "Claude",
    "Gemini",
    "AI comparison",
    "AI tools",
    "productivity",
    "team collaboration",
  ],
  authors: [{ name: "Yodoo Team" }],
  creator: "Yodoo",
  publisher: "Yodoo",
  openGraph: {
    title: "Yodoo - Multi-Model AI Chat Platform",
    description:
      "Compare AI models side-by-side, access integrated tools, and collaborate with your team - all in one platform.",
    url: "https://yodoo.ai",
    siteName: "Yodoo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yodoo - Multi-Model AI Chat Platform",
    description:
      "Compare AI models side-by-side, access integrated tools, and collaborate with your team - all in one platform.",
    creator: "@yodoo_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === "development";
  const isOfficialDeployment = process.env.YODOO_OFFICIAL === "true";
  const userProfile = await getUserProfile();

  return (
    <html lang="en" suppressHydrationWarning>
      {isOfficialDeployment ? (
        <Script
          defer
          src="https://assets.onedollarstats.com/stonks.js"
          {...(isDev ? { "data-debug": "yodoo.ai" } : {})}
        />
      ) : null}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TanstackQueryProvider>
          <LayoutClient />
          <UserProvider initialUser={userProfile}>
            <ModelProvider>
              <ChatsProvider userId={userProfile?.id}>
                <ChatSessionProvider>
                  <UserPreferencesProvider
                    initialPreferences={userProfile?.preferences}
                    userId={userProfile?.id}
                  >
                    <TooltipProvider
                      delayDuration={200}
                      skipDelayDuration={500}
                    >
                      <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        disableTransitionOnChange
                        enableSystem
                      >
                        <SidebarProvider defaultOpen>
                          <Toaster position="top-center" />
                          {children}
                        </SidebarProvider>
                      </ThemeProvider>
                    </TooltipProvider>
                  </UserPreferencesProvider>
                </ChatSessionProvider>
              </ChatsProvider>
            </ModelProvider>
          </UserProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
