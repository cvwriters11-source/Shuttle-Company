"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/auth";
import { CLIENT_COOKIE, clientCookieOptions, signClientSession } from "@/lib/client-session";
import { STAFF_COOKIE, signStaffSession, staffCookieOptions } from "@/lib/ops-session";
import { addFeedbackRecord, clientHasOrderPassword, getClientByLogin, getUserByEmail, verifyPassword } from "@/lib/ops-store";

export type AccountState = { error?: string; notice?: string };

export async function loginClient(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!identifier || !password) return { error: "Email and password are required." };

  const staff = await getUserByEmail(identifier);
  if (staff) {
    if (!staff.isActive || !verifyPassword(password, staff.passwordHash)) {
      return { error: "Incorrect email or password." };
    }
    const jar = await cookies();
    jar.set(CLIENT_COOKIE, "", { ...clientCookieOptions, maxAge: 0 });
    jar.set(STAFF_COOKIE, signStaffSession(staff.id, staff.role), staffCookieOptions);
    redirect(staff.role === "driver" ? "/driver" : "/admin");
  }

  const client = await getClientByLogin(identifier);
  if (!client || !(await clientHasOrderPassword(client.id, password))) {
    return { error: "Incorrect email or order number." };
  }

  const jar = await cookies();
  jar.set(STAFF_COOKIE, "", { ...staffCookieOptions, maxAge: 0 });
  jar.set(CLIENT_COOKIE, signClientSession(client.id), clientCookieOptions);
  redirect("/account");
}

export async function logoutClient() {
  const jar = await cookies();
  jar.set(CLIENT_COOKIE, "", { ...clientCookieOptions, maxAge: 0 });
  redirect("/account/login");
}

export async function addTripFeedback(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const session = await requireClient();
  const message = String(formData.get("message") ?? "").trim();
  const ratingRaw = Number(formData.get("rating") || 0);
  const safetyAlert = formData.get("safety_alert") === "on";
  const rating = ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null;
  if (!message && !safetyAlert) return { error: "Please add a comment, or tick the safety alert." };

  await addFeedbackRecord({
    clientId: session.clientId,
    tripId: String(formData.get("trip_id") ?? "") || null,
    message: message || (safetyAlert ? "Safety alert sent to admin." : ""),
    rating,
    safetyAlert,
  });
  revalidatePath("/account");
  revalidatePath("/admin");
  revalidatePath("/admin/safety");
  return { notice: safetyAlert ? "Admin has been alerted. Thank you." : "Feedback received. Admin can see it." };
}
