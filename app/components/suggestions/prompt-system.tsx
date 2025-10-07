"use client";

import { AnimatePresence } from "motion/react";
import { memo } from "react";
import { Suggestions } from "../chat-input/suggestions";

type PromptSystemProps = {
  onValueChange: (value: string) => void;
  onSuggestion: (suggestion: string) => void;
  value: string;
  activeCategory?: string | null;
};

export const PromptSystem = memo(function PromptSystem({
  onValueChange,
  onSuggestion,
  value,
  activeCategory,
}: PromptSystemProps) {
  return (
    <>
      <div className="relative order-1 w-full md:absolute md:bottom-[-70px] md:order-2 md:h-[70px]">
        <AnimatePresence mode="popLayout">
          <Suggestions
            onSuggestion={onSuggestion}
            onValueChange={onValueChange}
            value={value}
            activeCategory={activeCategory}
          />
        </AnimatePresence>
      </div>
    </>
  );
});
