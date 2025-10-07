"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toolsData } from "@/lib/tools/data";
import type { ToolConfig } from "@/lib/tools/types";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Code,
  FileText,
  Headphones,
  Image,
  Mic,
  Music,
  Video,
} from "lucide-react";
import Link from "next/link";

type ToolsContainerProps = {
  onToolSelect?: (tool: ToolConfig) => void;
  selectedTools?: ToolConfig[];
  maxVisibleTools?: number;
  className?: string;
};

const getToolIcon = (category: string) => {
  switch (category) {
    case "image":
      return Image;
    case "video":
      return Video;
    case "audio":
      return Headphones;
    case "podcast":
      return Mic;
    case "music":
      return Music;
    case "text":
      return FileText;
    case "code":
      return Code;
    default:
      return FileText;
  }
};

export function ToolsContainer({
  onToolSelect,
  selectedTools = [],
  maxVisibleTools = 4,
  className,
}: ToolsContainerProps) {
  // Get available tools (free tools for now, can be filtered based on user subscription)
  const availableTools = toolsData.filter(tool => tool.accessible);

  const handleToolClick = (tool: ToolConfig) => {
    onToolSelect?.(tool);
  };

  const isToolSelected = (tool: ToolConfig) => {
    return selectedTools.some(selected => selected.id === tool.id);
  };

  if (availableTools.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-1">
        {availableTools.slice(0, maxVisibleTools).map((tool) => {
          const IconComponent = getToolIcon(tool.category);
          const isSelected = isToolSelected(tool);
          
          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "size-8 rounded-lg p-0 transition-all duration-200",
                    isSelected 
                      ? "bg-primary/10 text-primary hover:bg-primary/20" 
                      : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                  )}
                  onClick={() => handleToolClick(tool)}
                >
                  <IconComponent className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {tool.name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      
      {/* View all tools button */}
      <Button
        variant="link"
        size="sm"
        className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        asChild
      >
        <Link href="/tools">
          <span>View all tools</span>
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
