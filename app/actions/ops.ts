"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  addClientRecord,
  addDriverRecord,
  addPaymentRecord,
  assignTripRecord,
  saveLocationRecord,
  updateTripProgressRecord,
} from "@/lib/ops-store";
import { readStaffSession, STAFF_COOKIE } from "@/lib/ops-session";
import { cookies } from "next/headers";

function refreshOps() {
  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/drivers");
  revalidatePath("/admin/trips");
  revalidatePath("/admin/safety");
  revalidatePath("/admin/payments");
  revalidatePath("/driver");
  revalidatePath("/account");
}

export type OpsState = { error?: string; notice?: string };

export async function addClient(_prev: OpsState, formData: FormData): Promise<OpsState> {
  const session = await requireRole("admin");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const pickup = String(formData.get("pickup") ?? "").trim();
  const dropoff = String(formData.get("dropoff") ?? "").trim();
  if (!fullName) return { error: "Client name is required." };
  if (!pickup || !dropoff) return { error: "Pick-up and drop-off locations are required." };
  await addClientRecord({
    fullName,
    phone: String(formData.get("phone") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    pickup,
    dropoff,
    notes: String(formData.get("notes") ?? "").trim() || null,
    createdBy: session.userId,
  });
  refreshOps();
  return { notice: "Client saved." };
}

export async function addDriver(_prev: OpsState, formData: FormData): Promise<OpsState> {
  await requireRole("admin");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const vehicleLabel = String(formData.get("vehicle_label") ?? "").trim();
  if (!fullName || !phone || !email || !password) return { error: "Name, phone, email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  try {
    await addDriverRecord({
      fullName,
      phone,
      email,
      password,
      vehicleLabel: vehicleLabel || null,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not add driver." };
  }
  refreshOps();
  return { notice: "Driver added. They can sign in at /login with the password you set." };
}

export async function assignTrip(_prev: OpsState, formData: FormData): Promise<OpsState> {
  const session = await requireRole("admin");
  const clientId = String(formData.get("client_id") ?? "");
  const driverId = String(formData.get("driver_id") ?? "");
  if (!clientId || !driverId) return { error: "Client and driver are required." };
  try {
    const trip = await assignTripRecord({
      clientId,
      driverId,
      pickup: String(formData.get("pickup") ?? "").trim(),
      dropoff: String(formData.get("dropoff") ?? "").trim(),
      pickupAt: String(formData.get("pickup_at") ?? "") ? new Date(String(formData.get("pickup_at"))).toISOString() : null,
      passengers: Number(formData.get("passengers") || 1),
      notes: String(formData.get("notes") ?? "").trim() || null,
      createdBy: session.userId,
    });
    refreshOps();
    return { notice: `Trip assigned. Client tracking link: /track/${trip.trackingCode}` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not assign this trip." };
  }
}

export async function addPayment(_prev: OpsState, formData: FormData): Promise<OpsState> {
  const session = await requireRole("admin");
  const clientId = String(formData.get("client_id") ?? "");
  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "").trim();
  if (!clientId) return { error: "Select the client who paid." };
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Enter the amount the client paid." };
  if (!method) return { error: "Select how they paid." };
  const paidRaw = String(formData.get("paid_at") ?? "").trim();
  const paidAt = paidRaw ? new Date(paidRaw).toISOString() : new Date().toISOString();
  if (Number.isNaN(new Date(paidAt).getTime())) return { error: "Enter a valid payment time." };
  try {
    await addPaymentRecord({
      clientId,
      tripId: String(formData.get("trip_id") ?? "") || null,
      amount: Math.round(amount * 100) / 100,
      method,
      note: String(formData.get("note") ?? "").trim() || null,
      paidAt,
      createdBy: session.userId,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save this payment." };
  }
  refreshOps();
  return { notice: "Payment saved. Totals on the dashboard have been updated." };
}

export async function updateTripProgress(tripId: string, status: string): Promise<OpsState> {
  const session = await requireRole("driver");
  try {
    await updateTripProgressRecord(tripId, session.userId, status);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update the trip." };
  }
  refreshOps();
  revalidatePath("/track", "layout");
  return { notice: "Admin and the client have been updated." };
}

export async function saveDriverLocation(input: {
  lat: number;
  lng: number;
  heading?: number | null;
  accuracy?: number | null;
  isOnline: boolean;
}) {
  const token = (await cookies()).get(STAFF_COOKIE)?.value;
  const session = readStaffSession(token);
  if (!session) return { error: "Not signed in." };
  await saveLocationRecord({
    driverId: session.userId,
    lat: input.lat,
    lng: input.lng,
    heading: input.heading ?? null,
    accuracy: input.accuracy ?? null,
    isOnline: input.isOnline,
    updatedAt: new Date().toISOString(),
  });
  return { ok: true };
}
