import { MODEL_DEFAULT } from "@/lib/config";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { createGuestServerClient } from "@/lib/supabase/server-guest";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!isSupabaseEnabled) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent("Supabase is not enabled in this deployment.")}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent("Missing authentication code")}`
    );
  }

  const supabase = await createClient();
  const supabaseAdmin = await createGuestServerClient();

  if (!(supabase && supabaseAdmin)) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent("Supabase is not enabled in this deployment.")}`
    );
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent(error.message)}`
    );
  }

  const user = data?.user;
  if (!(user?.id && user?.email)) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent("Missing user info")}`
    );
  }

  try {
    // Try to insert user only if not exists
    const { error: insertError } = await supabaseAdmin.from("users").insert({
      id: user.id,
      email: user.email,
      createdAt: new Date().toISOString(),
      messageCount: 0,
      premium: false,
      favoriteModels: [MODEL_DEFAULT],
    });

    if (insertError && insertError.code !== "23505") {
      // User already exists, which is fine
    }
  } catch {
    // User insert failed, but we can continue
  }

  const host = request.headers.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";

  // Ensure the redirect URL is safe and doesn't redirect to external sites
  const safeNext = next.startsWith("/") ? next : "/";
  const redirectUrl = `${protocol}://${host}${safeNext}`;

  return NextResponse.redirect(redirectUrl);
}
