"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ToolCategory } from "@/lib/tools/types";
import { cn } from "@/lib/utils";
import {
  Code,
  FileText,
  Grid3X3,
  Headphones,
  Image as ImageIcon,
  Mic,
  Music,
  Video,
} from "lucide-react";

type CategoryTabsProps = {
  activeCategory: ToolCategory | "all";
  onCategoryChange: (category: ToolCategory | "all") => void;
  className?: string;
};

const categoryIcons = {
  all: Grid3X3,
  image: ImageIcon,
  video: Video,
  audio: Headphones,
  podcast: Mic,
  music: Music,
  text: FileText,
  code: Code,
} as const;

const categories = [
  { id: "all", label: "All Tools" },
  { id: "image", label: "Image" },
  { id: "video", label: "Video" },
  { id: "audio", label: "Audio" },
  { id: "podcast", label: "Podcast" },
  { id: "music", label: "Music" },
  { id: "text", label: "Text" },
  { id: "code", label: "Code" },
] as const;

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  className,
}: CategoryTabsProps) {
  return (
    <Tabs
      className={cn("w-full", className)}
      onValueChange={(value) => onCategoryChange(value as ToolCategory | "all")}
      value={activeCategory}
    >
      <TabsList className="grid w-full grid-cols-8 gap-1 bg-sidebar">
        {categories.map((category) => {
          const Icon = categoryIcons[category.id as keyof typeof categoryIcons];
          return (
            <TabsTrigger
              className={cn(
                "flex items-center gap-2 font-medium text-sm transition-all",
                "data-[state=active]:bg-gradient-to-l data-[state=active]:from-[#6A11CB] data-[state=active]:to-[#2575FC] data-[state=active]:text-white",
                "hover:bg-gradient-to-l hover:from-[#6A11CB]/20 hover:to-[#2575FC]/20 hover:text-foreground"
              )}
              key={category.id}
              value={category.id}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{category.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
