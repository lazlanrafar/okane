import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { createMiddlewareClient } from "@workspace/supabase/middleware";

function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales;
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales,
  );

  return matchLocale(languages, locales, i18n.defaultLocale);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Ignore static assets and ignored paths
  if (
    ["/manifest.json", "/favicon.ico", "/robots.txt", "/sitemap.xml"].includes(
      pathname,
    )
  )
    return;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        request.url,
      ),
    );
  }

  // Extract locale from the path
  // Assumes path starts with /<locale>
  const locale = pathname.split("/")[1];

  // Calculate specific path after locale
  // e.g. /en/dashboard -> /dashboard
  // e.g. /en -> /
  const pathAfterLocale = pathname.replace(`/${locale}`, "") || "/";

  // Supabase Auth Logic
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createMiddlewareClient(request, response);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect dashboard routes
  if (pathAfterLocale.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // Protect create-workspace (must be logged in)
  if (pathAfterLocale === "/create-workspace" && !session) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // Redirect to dashboard if logged in and on login/register pages
  // (but NOT create-workspace — that's a valid logged-in page)
  if (
    (pathAfterLocale === "/login" || pathAfterLocale === "/register") &&
    session
  ) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
