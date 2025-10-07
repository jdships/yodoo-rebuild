import { LayoutApp } from "@/app/components/layout/layout-app";
import { ToolsDirectory } from "@/app/components/tools/tools-directory";
import { MessagesProvider } from "@/lib/chat-store/messages/provider";

export const dynamic = "force-dynamic";

export default function ToolsPage() {
  return (
    <MessagesProvider>
      <LayoutApp>
        <ToolsDirectory />
      </LayoutApp>
    </MessagesProvider>
  );
}
