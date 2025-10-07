import { isSupabaseEnabled } from "@/lib/supabase/config";
import { updateSession } from "@/utils/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "./lib/csrf";

function isPublicRouteCheck(pathname: string): boolean {
  const publicRoutes = [
    "/auth",
    "/auth/error", 
    "/auth/callback",
    "/api/auth",
    "/api/health",
    "/api/csrf",
    "/api/webhook/polar", // Keep webhook accessible
  ];

  return publicRoutes.some((route) => pathname.startsWith(route));
}

function isCsrfExemptRoute(pathname: string): boolean {
  const csrfExemptRoutes = ["/api/chat"];

  return csrfExemptRoutes.some((route) => pathname.startsWith(route));
}

function validateCsrfForRequest(request: NextRequest): NextResponse | null {
  const csrfCookie = request.cookies.get("csrf_token")?.value;
  const headerToken = request.headers.get("x-csrf-token");

  // Decode URL-encoded CSRF token
  const decodedHeaderToken = headerToken
    ? decodeURIComponent(headerToken)
    : null;

  if (
    !(csrfCookie && decodedHeaderToken && validateCsrfToken(decodedHeaderToken))
  ) {
    return new NextResponse("Invalid CSRF token", { status: 403 });
  }

  return null;
}

function handleUnauthenticatedRequest(
  request: NextRequest,
  isApiRoute: boolean
): NextResponse {
  if (isApiRoute) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const loginUrl = new URL("/auth", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const user = response.headers.get("x-user");
  const isAuthenticated = user && user !== "null";

  const isPublicRoute = isPublicRouteCheck(request.nextUrl.pathname);
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");

  if (!isSupabaseEnabled) {
    if (!isPublicRoute) {
      return handleUnauthenticatedRequest(request, isApiRoute);
    }
    return response;
  }

  // Require authentication for all non-public routes
  if (!isAuthenticated && !isPublicRoute) {
    return handleUnauthenticatedRequest(request, isApiRoute);
  }

  // CSRF protection for state-changing requests (except exempt routes)
  if (
    ["POST", "PUT", "DELETE"].includes(request.method) &&
    !isCsrfExemptRoute(request.nextUrl.pathname)
  ) {
    const csrfError = validateCsrfForRequest(request);
    if (csrfError) {
      return csrfError;
    }
  }

  // CSP for development and production
  const isDev = process.env.NODE_ENV === "development";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseDomain = supabaseUrl ? new URL(supabaseUrl).origin : "";

  response.headers.set(
    "Content-Security-Policy",
    isDev
      ? `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://assets.onedollarstats.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' wss: https://api.openai.com https://api.mistral.ai https://api.supabase.com ${supabaseDomain} https://api.github.com https://collector.onedollarstats.com;`
      : `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://analytics.umami.is https://vercel.live https://assets.onedollarstats.com; frame-src 'self' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' wss: https://api.openai.com https://api.mistral.ai https://api.supabase.com ${supabaseDomain} https://api-gateway.umami.dev https://api.github.com https://collector.onedollarstats.com;`
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
  runtime: "nodejs",
};
