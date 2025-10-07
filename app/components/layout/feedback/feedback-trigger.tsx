"use client";

import { useBreakpoint } from "@/app/hooks/use-breakpoint";
import { FeedbackForm } from "@/components/common/feedback-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { useUser } from "@/lib/user-store/provider";
import { Question } from "@phosphor-icons/react";
import { useState } from "react";

export function FeedbackTrigger() {
  const { user } = useUser();
  const isMobile = useBreakpoint(768);
  const [isOpen, setIsOpen] = useState(false);

  if (!isSupabaseEnabled) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
  };

  const trigger = (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      <Question className="size-4" />
      <span>Feedback</span>
    </DropdownMenuItem>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={setIsOpen} open={isOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="border-border bg-background">
          <FeedbackForm authUserId={user?.id} onClose={handleClose} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="overflow-hidden p-0 shadow-xs sm:max-w-md [&>button:last-child]:top-3.5 [&>button:last-child]:right-3 [&>button:last-child]:rounded-full [&>button:last-child]:bg-background [&>button:last-child]:p-1">
        <DialogHeader className="sr-only">
          <DialogTitle>Feedback</DialogTitle>
        </DialogHeader>
        <FeedbackForm authUserId={user?.id} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
}
