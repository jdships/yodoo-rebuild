"use client";

import { LayoutApp } from "@/app/components/layout/layout-app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessagesProvider } from "@/lib/chat-store/messages/provider";
import { useUser } from "@/lib/user-store/provider";
import { getUserSubscription, hasActiveSubscription } from "@/lib/user/types";
import { CreditCard, Crown, ExternalLink, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function BillingPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return (
      <MessagesProvider>
        <LayoutApp>
          <div className="container mx-auto px-4 py-16">
            <p>Please sign in to view your billing information.</p>
          </div>
        </LayoutApp>
      </MessagesProvider>
    );
  }

  const subscription = getUserSubscription(user);
  const hasActiveSub = hasActiveSubscription(user);

  const handleManageBilling = async () => {
    setIsLoading(true);
    
    try {
      // For now, we'll redirect to the upgrade page if no active subscription
      // or show a message about contacting support for billing management
      if (!hasActiveSub) {
        window.location.href = "/upgrade";
        return;
      }

      // In a full implementation, you would:
      // 1. Call Polar API to create a customer portal session
      // 2. Redirect to the portal URL
      // For now, we'll show a message
      toast.info("Billing management portal coming soon. Please contact support for billing changes.");
      
    } catch (error) {
      console.error("Billing management error:", error);
      toast.error("Failed to access billing management. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSubscriptionIcon = () => {
    switch (subscription.type) {
      case "pro":
        return <Zap className="h-5 w-5 " />;
      case "unlimited":
        return <Crown className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getSubscriptionColor = () => {
    switch (subscription.type) {
      case "pro":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "unlimited":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = () => {
    switch (subscription.status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "canceled":
        return "bg-red-100 text-red-800 border-red-200";
      case "past_due":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <MessagesProvider>
      <LayoutApp>
        <div className="bg-background">
          <div className="container mx-auto px-4 py-16">
            {/* Header Section */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 font-medium text-3xl tracking-tight">
                Billing & Subscription
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Manage your subscription and billing information
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
              {/* Current Subscription */}
              <Card className="bg-popover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getSubscriptionIcon()}
                    Current Plan
                  </CardTitle>
                  <CardDescription>
                    Your current subscription details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Plan</span>
                    <Badge className={getSubscriptionColor()}>
                      {subscription.type.charAt(0).toUpperCase() + subscription.type.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge className={getStatusColor()}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </Badge>
                  </div>

                  {subscription.started_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Started</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(subscription.started_at)}
                      </span>
                    </div>
                  )}

                  {subscription.ends_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {subscription.status === "canceled" ? "Ends" : "Next billing"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(subscription.ends_at)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Billing Management */}
              <Card className="bg-popover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Billing Management
                  </CardTitle>
                  <CardDescription>
                    Update payment methods and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasActiveSub ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Manage your subscription, update payment methods, and view billing history.
                      </p>
                      <Button 
                        onClick={handleManageBilling}
                        disabled={isLoading}
                        className="w-full"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {isLoading ? "Loading..." : "Manage Billing"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        You don't have an active subscription. Upgrade to access premium features.
                      </p>
                      <Button asChild className="w-full">
                        <Link href="/upgrade">
                          <Crown className="h-4 w-4" />
                          Upgrade Now
                        </Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card className="md:col-span-2 bg-popover">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Your account details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <span className="text-sm font-medium">Name</span>
                      <p className="text-sm text-muted-foreground">{user.display_name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Email</span>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Account Type</span>
                      <p className="text-sm text-muted-foreground">
                        {user.anonymous ? "Guest" : "Registered"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Member Since</span>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </LayoutApp>
    </MessagesProvider>
  );
}
