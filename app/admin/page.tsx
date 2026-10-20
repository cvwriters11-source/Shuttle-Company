import { AdminDashboard, type TripRow } from "@/components/ops/AdminDashboard";
import { requireRole } from "@/lib/auth";
import { loadAdminOverview } from "@/lib/ops-store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireRole("admin");
  const overview = await loadAdminOverview();
  return (
    <AdminDashboard
      initialDrivers={overview.drivers}
      initialTrips={overview.trips as TripRow[]}
      initialFeedback={overview.feedback}
      initialPayments={overview.payments}
      initialTotals={overview.totals}
      initialCounts={overview.counts}
    />
  );
}
