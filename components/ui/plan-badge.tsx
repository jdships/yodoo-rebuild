import { cn } from "@/lib/utils";

export type PlanType = "Free" | "Pro" | "Unlimited";

type PlanBadgeProps = {
  plan: PlanType;
  className?: string;
};

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const getStyles = () => {
    switch (plan) {
      case "Pro":
        return "bg-indigo-500 text-white";
      case "Unlimited":
        return "bg-purple-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  return (
    <span
      className={cn(
        "inline-flex items-center !rounded px-2 py-0.5 text-xs font-medium",
        getStyles(),
        className
      )}
    >
      {plan}
    </span>
  );
}
