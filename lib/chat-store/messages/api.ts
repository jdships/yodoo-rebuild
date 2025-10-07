import { createClient } from "@/lib/supabase/client";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import type { Message as MessageAisdk } from "ai";
import { readFromIndexedDb, writeToIndexedDb } from "../persist";

export async function getMessagesFromDb(
  chatId: string
): Promise<MessageAisdk[]> {
  // fallback to local cache only
  if (!isSupabaseEnabled) {
    const cached = await getCachedMessages(chatId);
    return cached;
  }

  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, content, role, experimental_attachments, created_at, parts, message_group_id, model"
    )
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (!data || error) {
    console.error("Failed to fetch messages:", error);
    return [];
  }

  return data.map((message) => ({
    ...message,
    id: String(message.id),
    content: message.content ?? "",
    createdAt: new Date(message.created_at || ""),
    parts: (message?.parts as MessageAisdk["parts"]) || undefined,
    experimental_attachments: message.experimental_attachments || undefined,
    message_group_id: message.message_group_id,
    model: message.model,
  }));
}

async function insertMessageToDb(chatId: string, message: MessageAisdk) {
  const supabase = createClient();
  if (!supabase) return;

  await supabase.from("messages").insert({
    chat_id: chatId,
    role: message.role,
    content: message.content,
    experimental_attachments: message.experimental_attachments,
    created_at: message.createdAt?.toISOString() || new Date().toISOString(),
    message_group_id: (message as any).message_group_id || null,
    model: (message as any).model || null,
  });
}

async function insertMessagesToDb(chatId: string, messages: MessageAisdk[]) {
  const supabase = createClient();
  if (!supabase) return;

  const payload = messages.map((message) => ({
    chat_id: chatId,
    role: message.role,
    content: message.content,
    experimental_attachments: message.experimental_attachments,
    created_at: message.createdAt?.toISOString() || new Date().toISOString(),
    message_group_id: (message as any).message_group_id || null,
    model: (message as any).model || null,
  }));

  await supabase.from("messages").insert(payload);
}

async function deleteMessagesFromDb(chatId: string) {
  const supabase = createClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("chat_id", chatId);

  if (error) {
    console.error("Failed to clear messages from database:", error);
  }
}

type ChatMessageEntry = {
  id: string;
  messages: MessageAisdk[];
};

export async function getCachedMessages(
  chatId: string
): Promise<MessageAisdk[]> {
  const entry = await readFromIndexedDb<ChatMessageEntry>("messages", chatId);

  if (!entry || Array.isArray(entry)) return [];

  return (entry.messages || []).sort(
    (a, b) => +new Date(a.createdAt || 0) - +new Date(b.createdAt || 0)
  );
}

export async function cacheMessages(
  chatId: string,
  messages: MessageAisdk[]
): Promise<void> {
  await writeToIndexedDb("messages", { id: chatId, messages });
}

export async function addMessage(
  chatId: string,
  message: MessageAisdk
): Promise<void> {
  await insertMessageToDb(chatId, message);
  const current = await getCachedMessages(chatId);
  const updated = [...current, message];

  await writeToIndexedDb("messages", { id: chatId, messages: updated });
}

export async function setMessages(
  chatId: string,
  messages: MessageAisdk[]
): Promise<void> {
  await insertMessagesToDb(chatId, messages);
  await writeToIndexedDb("messages", { id: chatId, messages });
}

export async function clearMessagesCache(chatId: string): Promise<void> {
  await writeToIndexedDb("messages", { id: chatId, messages: [] });
}

export async function clearMessagesForChat(chatId: string): Promise<void> {
  await deleteMessagesFromDb(chatId);
  await clearMessagesCache(chatId);
}
