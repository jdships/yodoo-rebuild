"use client";

import { ChatInput } from "@/app/components/chat-input/chat-input";
import { Conversation } from "@/app/components/chat/conversation";
import { useModel } from "@/app/components/chat/use-model";
import { useChatDraft } from "@/app/hooks/use-chat-draft";
import { TextEffect } from "@/components/ui/text-effect";
import { useChats } from "@/lib/chat-store/chats/provider";
import { useMessages } from "@/lib/chat-store/messages/provider";
import { useChatSession } from "@/lib/chat-store/session/provider";
import { SYSTEM_PROMPT_DEFAULT } from "@/lib/config";
import { useUserPreferences } from "@/lib/user-preference-store/provider";
import { useUser } from "@/lib/user-store/provider";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useChatCore } from "./use-chat-core";
import { useChatOperations } from "./use-chat-operations";
import { useFileUpload } from "./use-file-upload";
import Image from "next/image";
import { useTheme } from "next-themes";

const DialogAuth = dynamic(
  () => import("./dialog-auth").then((mod) => mod.DialogAuth),
  { ssr: false }
);

export function Chat() {
  const { chatId } = useChatSession();
  const {
    createNewChat,
    getChatById,
    updateChatModel,
    bumpChat,
    isLoading: isChatsLoading,
  } = useChats();

  const currentChat = useMemo(
    () => (chatId ? getChatById(chatId) : null),
    [chatId, getChatById]
  );

  const { messages: initialMessages, cacheAndAddMessage } = useMessages();
  const { user } = useUser();
  const { preferences } = useUserPreferences();
  const { draftValue, clearDraft } = useChatDraft(chatId);

  // File upload functionality
  const {
    files,
    setFiles,
    handleFileUploads,
    createOptimisticAttachments,
    cleanupOptimisticAttachments,
    handleFileUpload,
    handleFileRemove,
  } = useFileUpload();

  // Model selection
  const { selectedModel, handleModelChange } = useModel({
    currentChat: currentChat || null,
    user,
    updateChatModel,
    chatId,
  });

  // State to pass between hooks
  const [hasDialogAuth, setHasDialogAuth] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const logoVariants = {
    hidden: { opacity: 0, y: 6, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 6 },
  };
  
  const isAuthenticated = useMemo(() => !!user?.id, [user?.id]);
  const systemPrompt = useMemo(
    () => user?.system_prompt || SYSTEM_PROMPT_DEFAULT,
    [user?.system_prompt]
  );

  // New state for quoted text
  const [quotedText, setQuotedText] = useState<{
    text: string;
    messageId: string;
  }>();
  const handleQuotedSelected = useCallback(
    (text: string, messageId: string) => {
      setQuotedText({ text, messageId });
    },
    []
  );

  // Chat operations (utils + handlers) - created first
  const { checkLimitsAndNotify, ensureChatExists, handleDelete, handleEdit } =
    useChatOperations({
      isAuthenticated,
      chatId,
      messages: initialMessages,
      selectedModel,
      systemPrompt,
      createNewChat,
      setHasDialogAuth,
      setMessages: () => {},
      setInput: () => {},
    });

  // Core chat functionality (initialization + state + actions)
  const {
    messages,
    input,
    status,
    stop,
    hasSentFirstMessageRef,
    isSubmitting,
    enableSearch,
    setEnableSearch,
    submit,
    handleSuggestion,
    handleReload,
    handleInputChange,
  } = useChatCore({
    initialMessages,
    draftValue,
    cacheAndAddMessage,
    chatId,
    user,
    files,
    createOptimisticAttachments,
    setFiles,
    checkLimitsAndNotify,
    cleanupOptimisticAttachments,
    ensureChatExists,
    handleFileUploads,
    selectedModel,
    clearDraft,
    bumpChat,
  });

  // Memoize the conversation props to prevent unnecessary rerenders
  const conversationProps = useMemo(
    () => ({
      messages,
      status,
      onDelete: handleDelete,
      onEdit: handleEdit,
      onReload: handleReload,
      onQuote: handleQuotedSelected,
    }),
    [
      messages,
      status,
      handleDelete,
      handleEdit,
      handleReload,
      handleQuotedSelected,
    ]
  );

  // Memoize the chat input props
  const chatInputProps = useMemo(
    () => ({
      value: input,
      onSuggestion: handleSuggestion,
      onValueChange: handleInputChange,
      onSend: submit,
      isSubmitting,
      files,
      onFileUpload: handleFileUpload,
      onFileRemove: handleFileRemove,
      hasSuggestions:
        preferences.promptSuggestions && !chatId && messages.length === 0,
      onSelectModel: handleModelChange,
      selectedModel,
      isUserAuthenticated: isAuthenticated,
      stop,
      status,
      setEnableSearch,
      enableSearch,
      quotedText,
    }),
    [
      input,
      handleSuggestion,
      handleInputChange,
      submit,
      isSubmitting,
      files,
      handleFileUpload,
      handleFileRemove,
      preferences.promptSuggestions,
      chatId,
      messages.length,
      handleModelChange,
      selectedModel,
      isAuthenticated,
      stop,
      status,
      setEnableSearch,
      enableSearch,
      quotedText,
    ]
  );

  // Handle redirect for invalid chatId - only redirect if we're certain the chat doesn't exist
  // and we're not in a transient state during chat creation
  if (
    chatId &&
    !isChatsLoading &&
    !currentChat &&
    !isSubmitting &&
    status === "ready" &&
    messages.length === 0 &&
    !hasSentFirstMessageRef.current // Don't redirect if we've already sent a message in this session
  ) {
    return redirect("/");
  }

  const showOnboarding = !chatId && messages.length === 0;

  return (
    <div
      className={cn(
      "@container/main relative flex h-full flex-col items-center justify-center",
      "px-4"
      )}
    >
      <DialogAuth open={hasDialogAuth} setOpen={setHasDialogAuth} />
      <AnimatePresence initial={false} mode="popLayout">
      {showOnboarding ? (
        <motion.div
        animate={{ opacity: 1 }}
        className="mx-auto max-w-md text-center"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        key="onboarding"
        layout="position"
        layoutId="onboarding"
        transition={{
          layout: {
          duration: 0,
          },
        }}
        >
        {/* Yodoo Logo */}
        <AnimatePresence mode="wait">
          {mounted && (
            <motion.div
              key="yodoo-logo"
              className="mb-8 flex justify-center logo-float"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={logoVariants}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <Image
                src={theme === "dark" ? "/yodoo-logo-dark.png" : "/yodoo-logo-light.png"}
                alt="Yodoo Logo"
                width={120}
                height={40}
                className="h-auto w-auto"
                priority
              />
            </motion.div>
          )}
        </AnimatePresence>
        
     
        <TextEffect
          as="h1"
          className="mb-6 font-medium text-2xl tracking-tight"
          per="char"
          preset="fade"
        >
          {user?.display_name ? (
            <>
              {"Welcome back, "}
              <span
                style={{
                  backgroundImage: 'linear-gradient(109deg, #3B82F6 9.62%, #9747FF 72.12%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {user.display_name}
              </span>
              
            </>
          ) : (
            "Welcome back."
          )}
        </TextEffect>
        
        </motion.div>
      ) : (
        <Conversation key="conversation" {...conversationProps} />
      )}
      </AnimatePresence>

      <motion.div
      className={cn(
        "relative inset-x-0 bottom-0 z-50 mx-auto w-full max-w-2xl"
      )}
      layout="position"
      layoutId="chat-input-container"
      transition={{
        layout: {
        duration: messages.length === 1 ? 0.3 : 0,
        },
      }}
      >
      <ChatInput {...chatInputProps} />
      </motion.div>
    </div>
  );
}
