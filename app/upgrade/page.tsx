"use client";

import { LayoutApp } from "@/app/components/layout/layout-app";
import { Button } from "@/components/ui/button";
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
import { MessagesProvider } from "@/lib/chat-store/messages/provider";
import { fetchClient } from "@/lib/fetch";
import { CheckCircle2, Crown, Loader2, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

async function createCheckout(planType: "pro" | "unlimited") {
  // Ensure CSRF token is available
  const csrfCookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith("csrf_token="));
    
  if (!csrfCookie) {
    // Fetch CSRF token first
    await fetch("/api/csrf");
  }

  const response = await fetchClient("/api/create-checkout", {
    method: "POST",
    body: JSON.stringify({ planType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create checkout");
  }

  return response.json();
}

function ProPlan() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    
    try {
      const { checkoutUrl } = await createCheckout("pro");
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start checkout");
    } finally {
      setIsLoading(false);
    }
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
            <span className="text-muted-foreground">Pro</span>
          </PlanName>
          <Badge className="border-indigo-500/20 bg-indigo-500/10 text-indigo-600">
            Most Popular
          </Badge>
        </Plan>
        <Price>
          <MainPrice>$20</MainPrice>
          <Period>/ month</Period>
        </Price>
        <Button 
          className="w-full" 
          onClick={handleClick} 
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Upgrade to Pro"
          )}
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

function UnlimitedPlan() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    
    try {
      const { checkoutUrl } = await createCheckout("unlimited");
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start checkout");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "Everything in Pro",
    "Unlimited storage",
    "Custom integrations",
    "24/7 phone support",
    "SLA guarantee",
    "Custom branding",
    "Dedicated account manager",
    "White-label options",
  ];

  return (
    <Card className="mx-auto max-w-sm">
      <Header>
        <Plan>
          <PlanName>
            <Crown aria-hidden="true" />
            <span className="text-muted-foreground">Unlimited</span>
          </PlanName>
          <Badge className="border-purple-500/20 bg-purple-500/10 text-purple-600">
            For Serious Users
          </Badge>
        </Plan>
        <Price>
          <MainPrice>$100</MainPrice>
          <Period>/ month</Period>
        </Price>
        <Button
          className="w-full"
          onClick={handleClick}
          size="lg"
          variant="default"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Upgrade to Unlimited"
          )}
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

export default function UpgradePage() {
  const searchParams = useSearchParams();
  
  // Check for error message from usage limit redirect
  useEffect(() => {
    const errorMessage = searchParams.get("error");
    if (errorMessage) {
      toast.error("Message Limit Reached", {
        description: decodeURIComponent(errorMessage),
        duration: 6000, // Show for 6 seconds
      });
    }
  }, [searchParams]);

  // Ensure CSRF token is available when component mounts
  useEffect(() => {
    const csrfCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("csrf_token="));
      
    if (!csrfCookie) {
      fetch("/api/csrf").catch(console.error);
    }
  }, []);

  return (
    <MessagesProvider>
      <LayoutApp>
        <div className="bg-background">
          <div className="container mx-auto px-4 py-16">
            {/* Header Section */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 font-medium text-3xl tracking-tight">
                Choose Your Plan
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Unlock the full potential of Yodoo with our premium plans. Get
                unlimited access to AI models and advanced features.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="mx-auto flex max-w-3xl flex-col items-start justify-center gap-8 md:flex-row">
              <ProPlan />
              <UnlimitedPlan />
            </div>
          </div>
        </div>
      </LayoutApp>
    </MessagesProvider>
  );
}
