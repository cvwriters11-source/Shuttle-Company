import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function copySession(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = from.headers.get(header);
    if (value) to.headers.set(header, value);
  }
  return to;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
          Object.entries(headers ?? {}).forEach(([key, value]) => supabaseResponse.headers.set(key, value));
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  let role = String((data?.claims?.app_metadata as { role?: string } | undefined)?.role ?? "");
  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isDriver = path.startsWith("/driver");

  if ((isAdmin || isDriver) && !data?.claims) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return copySession(supabaseResponse, NextResponse.redirect(url));
  }

  if (data?.claims && !role && (isAdmin || isDriver || path === "/login")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", String(data.claims.sub ?? ""))
      .maybeSingle();
    role = profile?.role ?? "";
  }

  if (data?.claims && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = role === "driver" ? "/driver" : "/admin";
    return copySession(supabaseResponse, NextResponse.redirect(url));
  }

  if (isAdmin && role === "driver") {
    const url = request.nextUrl.clone();
    url.pathname = "/driver";
    return copySession(supabaseResponse, NextResponse.redirect(url));
  }

  if (isDriver && role === "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return copySession(supabaseResponse, NextResponse.redirect(url));
  }

  return supabaseResponse;
}
