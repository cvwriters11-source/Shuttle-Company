import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { asProfile, getClientById, getUserById } from "@/lib/ops-store";
import { CLIENT_COOKIE, readClientSession } from "@/lib/client-session";
import { readStaffSession, STAFF_COOKIE } from "@/lib/ops-session";

export async function getSessionUser() {
  const token = (await cookies()).get(STAFF_COOKIE)?.value;
  const session = readStaffSession(token);
  if (!session) return null;
  const user = await getUserById(session.userId);
  if (!user || !user.isActive) return null;
  return {
    userId: user.id,
    role: user.role,
    profile: asProfile(user),
  };
}

export async function requireRole(role: "admin" | "driver") {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== role) {
    if (session.role === "admin") redirect("/admin");
    if (session.role === "driver") redirect("/driver");
    redirect("/login");
  }
  return session;
}

export async function getClientSession() {
  const token = (await cookies()).get(CLIENT_COOKIE)?.value;
  const session = readClientSession(token);
  if (!session) return null;
  const client = await getClientById(session.clientId);
  if (!client) return null;
  return {
    clientId: client.id,
    fullName: client.fullName,
    email: client.email,
  };
}

export async function requireClient() {
  const session = await getClientSession();
  if (!session) redirect("/account/login");
  return session;
}
