import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readStaffSession, STAFF_COOKIE } from "@/lib/ops-session";
import { saveLocationRecord } from "@/lib/ops-store";

export async function POST(request: Request) {
  const session = readStaffSession((await cookies()).get(STAFF_COOKIE)?.value);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    lat?: number;
    lng?: number;
    heading?: number | null;
    accuracy?: number | null;
    is_online?: boolean;
  };

  await saveLocationRecord({
    driverId: session.userId,
    lat: Number(body.lat ?? 0),
    lng: Number(body.lng ?? 0),
    heading: body.heading ?? null,
    accuracy: body.accuracy ?? null,
    isOnline: Boolean(body.is_online),
    updatedAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
