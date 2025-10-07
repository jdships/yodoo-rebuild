"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { ToolConfig } from "@/lib/tools/types";
import { useUser } from "@/lib/user-store/provider";
import { getUserSubscription, hasActiveSubscription, isUnlimitedUser } from "@/lib/user/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Lock } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

type ToolCardProps = {
  tool: ToolConfig;
  className?: string;
};

export function ToolCard({ tool, className }: ToolCardProps) {
  const { user } = useUser();
  
  // Determine if the tool is accessible based on user's subscription
  const isAccessible = useMemo(() => {
    if (tool.pricing === "free") {
      return true; // Free tools are always accessible
    }
    
    if (!user) {
      return false; // Not logged in, only free tools accessible
    }
    
    const subscription = getUserSubscription(user);
    
    if (tool.pricing === "pro") {
      // Pro tools require Pro or Unlimited subscription
      return hasActiveSubscription(user);
    }
    
    if (tool.pricing === "unlimited") {
      // Unlimited tools require Unlimited subscription
      return isUnlimitedUser(user);
    }
    
    return false;
  }, [tool.pricing, user]);
  
  const getButtonText = () => {
    if (isAccessible) {
      return "Try It Now";
    }
    
    if (tool.pricing === "pro") {
      return "Pro Plan Required";
    }
    
    if (tool.pricing === "unlimited") {
      return "Unlimited Plan Required";
    }
    
    return "Premium Plan Required";
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden p-0 transition-all duration-200 hover:shadow-lg",
        className
      )}
    >
      <CardHeader className="relative p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          <Image
            alt={tool.name}
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            src={tool.imageUrl}
          />
          <div className="absolute top-2 right-2">
            <Badge
              className={cn(
                "font-medium text-xs",
                tool.category === "image" &&
                  "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
                tool.category === "video" &&
                  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                tool.category === "audio" &&
                  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                tool.category === "text" &&
                  "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
                tool.category === "code" &&
                  "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
              )}
              variant="secondary"
            >
              {tool.category.charAt(0).toUpperCase() + tool.category.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg leading-tight">{tool.name}</h3>
            {!isAccessible && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {tool.description}
          </p>
        </div>
      </CardContent>

      <CardFooter className="px-4 pt-0 pb-4">
        <Button
          className={cn(
            "group/button w-full",
            isAccessible
              ? "bg-gradient-to-l from-[#6A11CB] to-[#2575FC] text-white hover:from-[#5A0EB0] hover:to-[#1E5FD6]"
              : "cursor-not-allowed bg-gradient-to-l from-[#6A11CB]/60 to-[#2575FC]/60 text-white/70"
          )}
          disabled={!isAccessible}
        >
          <span className="flex items-center gap-2">
            {getButtonText()}
            <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}
