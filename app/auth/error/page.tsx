"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

// Create a separate component that uses useSearchParams
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const message =
    searchParams.get("message") || "An error occurred during authentication.";

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="font-medium text-3xl text-white tracking-tight sm:text-4xl">
          Authentication Error
        </h1>
        <div className="mt-6 rounded-md bg-red-500/10 p-4">
          <p className="text-red-400">{message}</p>
        </div>
        <div className="mt-8">
          <Button
            asChild
            className="w-full text-base sm:text-base"
            size="lg"
            variant="secondary"
          >
            <Link href="/auth">Try Again</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex h-screen flex-col bg-zinc-800 text-white">
      {/* Header */}
      <header className="p-4" />

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <Suspense fallback={<div>Loading...</div>}>
          <AuthErrorContent />
        </Suspense>
      </main>

      <footer className="py-6 text-center text-sm text-zinc-500">
        <p>
          Need help? {/* @todo */}
          <Link className="text-zinc-400 hover:underline" href="/">
            Contact Support
          </Link>
        </p>
      </footer>
    </div>
  );
}
