import { NextResponse, type NextRequest } from "next/server";
import { CLIENT_COOKIE, readClientSession } from "@/lib/client-session";
import { readStaffSession, STAFF_COOKIE } from "@/lib/ops-session";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isDriver = path.startsWith("/driver");
  const isClientApp = path.startsWith("/account") && path !== "/account/login";
  const session = readStaffSession(request.cookies.get(STAFF_COOKIE)?.value);
  const client = readClientSession(request.cookies.get(CLIENT_COOKIE)?.value);

  if (session && (path === "/login" || path === "/account/login" || isClientApp)) {
    const url = request.nextUrl.clone();
    url.pathname = session.role === "driver" ? "/driver" : "/admin";
    return NextResponse.redirect(url);
  }

  if ((isAdmin || isDriver) && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/account/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (isClientApp && !client) {
    const url = request.nextUrl.clone();
    url.pathname = "/account/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (client && path === "/account/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/account";
    return NextResponse.redirect(url);
  }

  if (isAdmin && session?.role === "driver") {
    const url = request.nextUrl.clone();
    url.pathname = "/driver";
    return NextResponse.redirect(url);
  }

  if (isDriver && session?.role === "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
