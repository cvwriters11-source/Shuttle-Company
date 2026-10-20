import { DriverApp } from "@/components/ops/DriverApp";
import { requireRole } from "@/lib/auth";
import { loadDriverTrips } from "@/lib/ops-store";

export const dynamic = "force-dynamic";

export default async function DriverPage() {
  const session = await requireRole("driver");
  const trips = await loadDriverTrips(session.userId);
  return <DriverApp initialTrips={trips as never} />;
}
