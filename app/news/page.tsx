import { LayoutApp } from "@/app/components/layout/layout-app";
import { MessagesProvider } from "@/lib/chat-store/messages/provider";
import NewsDirectory from "../components/news/news-directory";

export const dynamic = "force-dynamic";

export default function ToolsPage() {
  return (
    <MessagesProvider>
      <LayoutApp>
        <NewsDirectory />
      </LayoutApp>
    </MessagesProvider>
  );
}
