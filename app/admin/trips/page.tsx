import { TripsPanel } from "@/components/ops/TripsPanel";
import { requireRole } from "@/lib/auth";
import { loadTripFormData } from "@/lib/ops-store";

export const dynamic = "force-dynamic";

export default async function AdminTripsPage() {
  await requireRole("admin");
  const data = await loadTripFormData();
  return <TripsPanel initialClients={data.clients} initialDrivers={data.drivers} initialTrips={data.trips as never} />;
}
