"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { CLIENT_COOKIE, clientCookieOptions, signClientSession } from "@/lib/client-session";
import { submitQuoteRecord } from "@/lib/ops-store";

export type QuoteState = {
  error?: string;
  orderNumber?: string;
  email?: string;
  password?: string | null;
  isNewLogin?: boolean;
};

export async function submitQuote(_prev: QuoteState, formData: FormData): Promise<QuoteState> {
  const fullName = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const pickup = String(formData.get("pickup") ?? "").trim();
  const dropoff = String(formData.get("dropoff") ?? "").trim();
  const passengers = Number(formData.get("passengers") || 1);
  const returnTrip = String(formData.get("returnTrip") ?? "") === "Yes";
  const flight = String(formData.get("flight") ?? "").trim() || null;
  const message = String(formData.get("message") ?? "").trim() || null;

  if (!fullName || !phone || !email || !date || !time || !pickup || !dropoff) {
    return { error: "Please complete your name, contact details, travel time, pick-up and drop-off." };
  }
  if (!Number.isFinite(passengers) || passengers < 1) {
    return { error: "Please enter how many passengers will travel." };
  }

  const result = await submitQuoteRecord({
    fullName,
    phone,
    email,
    date,
    time,
    flight,
    pickup,
    dropoff,
    passengers,
    returnTrip,
    message,
  });

  const jar = await cookies();
  jar.set(CLIENT_COOKIE, signClientSession(result.client.id), clientCookieOptions);
  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/trips");
  revalidatePath("/admin/safety");
  revalidatePath("/account");

  return {
    orderNumber: result.trip.orderNumber,
    email,
    password: result.trip.orderNumber,
    isNewLogin: true,
  };
}
