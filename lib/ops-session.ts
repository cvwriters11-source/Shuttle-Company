import { createHmac, timingSafeEqual } from "crypto";

export const STAFF_COOKIE = "lrs_staff";

type SessionPayload = { userId: string; role: "admin" | "driver"; exp: number };

function secret() {
  return process.env.OPS_SESSION_SECRET || "lions-route-local-staff-secret";
}

export function signStaffSession(userId: string, role: "admin" | "driver") {
  const payload: SessionPayload = { userId, role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readStaffSession(token?: string | null): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    if (payload.role !== "admin" && payload.role !== "driver") return null;
    return payload;
  } catch {
    return null;
  }
}

export const staffCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === "production",
};
