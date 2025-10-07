"use client";

import { LayoutApp } from "@/app/components/layout/layout-app";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessagesProvider } from "@/lib/chat-store/messages/provider";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for processing
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <MessagesProvider>
        <LayoutApp>
          <div className="bg-background">
            <div className="container mx-auto px-4 py-16">
              <div className="mx-auto max-w-md text-center">
                <div className="animate-pulse">
                  <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-muted"></div>
                  <div className="mb-4 h-8 bg-muted rounded"></div>
                  <div className="mb-2 h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </LayoutApp>
      </MessagesProvider>
    );
  }

  return (
    <MessagesProvider>
      <LayoutApp>
        <div className="bg-background">
          <div className="container mx-auto px-4 py-16">
            <Card className="mx-auto max-w-md p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              
              <h1 className="mb-4 font-medium text-2xl tracking-tight">
                Payment Successful!
              </h1>
              
              <p className="mb-6 text-muted-foreground">
                Thank you for upgrading to Yodoo Pro! Your subscription is now active 
                and you have access to all premium features.
              </p>
              
              {checkoutId && (
                <p className="mb-6 text-sm text-muted-foreground">
                  Checkout ID: {checkoutId}
                </p>
              )}
              
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/">
                    Start Chatting
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href="/upgrade">
                    View Plans
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </LayoutApp>
    </MessagesProvider>
  );
}

