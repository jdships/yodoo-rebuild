import { CanvasContainer } from "@/app/components/canvas/canvas-container";
import { LayoutApp } from "@/app/components/layout/layout-app";
import { MessagesProvider } from "@/lib/chat-store/messages/provider";

export const dynamic = "force-dynamic";

export default function CanvasPage() {
  return (
    <MessagesProvider>
      <LayoutApp>
        <CanvasContainer />
      </LayoutApp>
    </MessagesProvider>
  );
}
