"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserByEmail, getUserById, saveLocationRecord, verifyPassword } from "@/lib/ops-store";
import { readStaffSession, signStaffSession, STAFF_COOKIE, staffCookieOptions } from "@/lib/ops-session";

export type AuthState = { error?: string; notice?: string };

export async function createFirstAdmin(): Promise<AuthState> {
  return { error: "Admin login is already set. Sign in with the staff email and password." };
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const user = await getUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Incorrect email or password." };
  }

  const jar = await cookies();
  jar.set(STAFF_COOKIE, signStaffSession(user.id, user.role), staffCookieOptions);
  redirect(user.role === "driver" ? "/driver" : "/admin");
}

export async function logout() {
  const jar = await cookies();
  const session = readStaffSession(jar.get(STAFF_COOKIE)?.value);
  if (session) {
    const user = await getUserById(session.userId);
    if (user?.role === "driver") {
      await saveLocationRecord({
        driverId: user.id,
        lat: 0,
        lng: 0,
        heading: null,
        accuracy: null,
        isOnline: false,
        updatedAt: new Date().toISOString(),
      });
    }
  }
  jar.set(STAFF_COOKIE, "", { ...staffCookieOptions, maxAge: 0 });
  redirect("/account/login");
}
