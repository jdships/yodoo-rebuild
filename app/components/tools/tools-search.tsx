"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

type ToolsSearchProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
};

export function ToolsSearch({
  searchQuery,
  onSearchChange,
  placeholder = "Search for AI Tool...",
  className,
}: ToolsSearchProps) {
  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
      <Input
        className="h-10 border-border bg-background py-2 pr-4 pl-10 focus:ring-2 focus:ring-primary/20"
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        type="text"
        value={searchQuery}
      />
    </div>
  );
}
