import { DriversPanel } from "@/components/ops/DriversPanel";
import { requireRole } from "@/lib/auth";
import { loadDrivers } from "@/lib/ops-store";

export const dynamic = "force-dynamic";

export default async function AdminDriversPage() {
  await requireRole("admin");
  const drivers = await loadDrivers();
  return <DriversPanel initialDrivers={drivers} />;
}
