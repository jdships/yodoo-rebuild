"use client";

import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

export type PromptSuggestionProps = {
  children: React.ReactNode;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
  highlight?: string;
  /** Optional CSS gradient string (e.g. 'linear-gradient(...)') to render a rounded gradient ring */
  gradient?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function PromptSuggestion({
  children,
  variant,
  size,
  className,
  highlight,
  gradient,
  ...props
}: PromptSuggestionProps) {
  const isHighlightMode = highlight !== undefined && highlight.trim() !== "";
  const content = typeof children === "string" ? children : "";

  if (!isHighlightMode) {
    const button = (
      <Button
        className={cn("rounded-full text-xs", gradient ? 'btn-reset' : '', className)}
        size={size || "sm"}
        variant={variant || "outline"}
        {...props}
        style={{ ...(props.style || {}), background: 'transparent', border: 'none', boxShadow: 'none' }}
      >
        {children}
      </Button>
    );

    // If a gradient is provided, wrap the button to create a rounded gradient ring
    if (gradient) {
      return (
        <div className="gradient-ring" style={{ background: gradient }}>
          <div className="gradient-ring-inner">
            {button}
          </div>
        </div>
      );
    }

    return button;
  }

  if (!content) {
    return (
      <Button
        className={cn(
    "w-full justify-start rounded-xl py-2",
    "hover:bg-transparent",
          className
        )}
        size={size || "sm"}
        variant={variant || "ghost"}
        {...props}
      >
        {children}
      </Button>
    );
  }

  const trimmedHighlight = highlight!.trim();
  const contentLower = content.toLowerCase();
  const highlightLower = trimmedHighlight.toLowerCase();
  const shouldHighlight = contentLower.includes(highlightLower);
  const innerButton = (
    <Button
      className={cn(
  "w-full justify-start gap-0 rounded-xl py-2",
  "hover:bg-transparent",
        gradient ? 'btn-reset' : '',
        className
      )}
      size={size || "sm"}
      variant={variant || "ghost"}
      {...props}
      style={{ ...(props.style || {}), background: 'transparent', border: 'none', boxShadow: 'none' }}
    >
      {shouldHighlight ? (
        (() => {
          const index = contentLower.indexOf(highlightLower);
          if (index === -1)
            return (
              <span className="whitespace-pre-wrap text-muted-foreground">
                {content}
              </span>
            );

          const actualHighlightedText = content.substring(
            index,
            index + highlightLower.length
          );

          const before = content.substring(0, index);
          const after = content.substring(index + actualHighlightedText.length);

          return (
            <>
              {before && (
                <span className="whitespace-pre-wrap text-muted-foreground">
                  {before}
                </span>
              )}
              <span className="whitespace-pre-wrap font-medium text-primary">
                {actualHighlightedText}
              </span>
              {after && (
                <span className="whitespace-pre-wrap text-muted-foreground">
                  {after}
                </span>
              )}
            </>
          );
        })()
      ) : (
        <span className="whitespace-pre-wrap text-muted-foreground">
          {content}
        </span>
      )}
    </Button>
  );

  if (gradient) {
    return (
      <div className="gradient-ring" style={{ borderRadius: 12, padding: 2, background: gradient }}>
        <div className="gradient-ring-inner" style={{ borderRadius: 11 }}>
          {innerButton}
        </div>
      </div>
    );
  }

  return innerButton;
}

export { PromptSuggestion };
