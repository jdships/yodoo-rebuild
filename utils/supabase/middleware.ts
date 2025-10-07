import { isSupabaseEnabled } from "@/lib/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  if (!isSupabaseEnabled) {
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    return NextResponse.next({
      request,
    });
  }

  if (!supabaseAnonKey) {
    return NextResponse.next({
      request,
    });
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({
          request,
        });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  let user = null;
  try {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    // If there's an auth error (like invalid refresh token), we should handle it gracefully
    if (error) {
      console.warn("Auth error in middleware:", error.message);
      
      // If it's a refresh token error, we should clear the session to prevent repeated errors
      if (error.message.includes("refresh_token_not_found") || 
          error.message.includes("Invalid Refresh Token")) {
        try {
          // Clear the invalid session
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.warn("Failed to clear invalid session:", signOutError);
        }
      }
      
      // Don't throw - let the user be treated as unauthenticated
      user = null;
    } else {
      user = authUser;
    }
  } catch (error) {
    // Catch any unexpected errors from getUser()
    console.error("Unexpected auth error in middleware:", error);
    user = null;
  }

  // Pass user information to the response headers for middleware to use
  if (user) {
    supabaseResponse.headers.set("x-user", JSON.stringify(user));
  } else {
    supabaseResponse.headers.set("x-user", "null");
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
