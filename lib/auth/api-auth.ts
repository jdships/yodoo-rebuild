import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export type AuthenticatedUser = {
  id: string;
  email?: string;
  userMetadata?: {
    name?: string;
    avatarUrl?: string;
  };
};

export async function requireAuth(): Promise<
  | {
      user: AuthenticatedUser;
      supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>;
    }
  | NextResponse
> {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return { user, supabase };
}

export async function optionalAuth(): Promise<{
  user: AuthenticatedUser | null;
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>> | null;
}> {
  const supabase = await createClient();

  if (!supabase) {
    return { user: null, supabase: null };
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Handle auth errors gracefully
    if (error) {
      console.warn("Auth error in optionalAuth:", error.message);
      return { user: null, supabase };
    }

    return { user, supabase };
  } catch (error) {
    console.error("Unexpected auth error in optionalAuth:", error);
    return { user: null, supabase };
  }
}
