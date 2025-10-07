"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Badge,
  Body,
  Card,
  Header,
  List,
  ListItem,
  MainPrice,
  Period,
  Plan,
  PlanName,
  Price,
} from "@/components/ui/pricing-card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Zap } from "lucide-react";

type PricingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function PremiumPlan() {
  const handleClick = () => {
    // TODO: Implement actual upgrade logic
  };

  const features = [
    "Unlimited AI conversations",
    "Access to all AI models",
    "Priority support",
    "Advanced features",
    "Custom integrations",
    "Export capabilities",
  ];

  return (
    <Card className="mx-auto max-w-sm">
      <Header>
        <Plan>
          <PlanName>
            <Zap aria-hidden="true" />
            <span className="text-muted-foreground">Premium</span>
          </PlanName>
          <Badge className="border-primary/20 bg-primary/10 text-primary">
            Most Popular
          </Badge>
        </Plan>
        <Price>
          <MainPrice>$20</MainPrice>
          <Period>/ month</Period>
        </Price>
        <Button
          className={cn(
            "w-full font-semibold text-white",
            "bg-gradient-to-b from-blue-500 to-blue-600 shadow-[0_10px_25px_rgba(59,130,246,0.3)]"
          )}
          onClick={handleClick}
        >
          Upgrade to Premium
        </Button>
      </Header>
      <Body>
        <List>
          {features.map((item) => (
            <ListItem key={item}>
              <span className="mt-0.5">
                <CheckCircle2
                  aria-hidden="true"
                  className="h-4 w-4 text-green-500"
                />
              </span>
              <span>{item}</span>
            </ListItem>
          ))}
        </List>
      </Body>
    </Card>
  );
}

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md border-0 bg-transparent shadow-none backdrop-blur-none">
        <DialogTitle className="sr-only">Upgrade to Premium</DialogTitle>
        <div className="flex justify-center p-4">
          <PremiumPlan />
        </div>
      </DialogContent>
    </Dialog>
  );
}
