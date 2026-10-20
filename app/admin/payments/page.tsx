import { PaymentsPanel } from "@/components/ops/PaymentsPanel";
import { requireRole } from "@/lib/auth";
import { loadPayments } from "@/lib/ops-store";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  await requireRole("admin");
  const data = await loadPayments();
  return (
    <PaymentsPanel
      initialClients={data.clients}
      initialTrips={data.trips}
      initialPayments={data.payments}
      initialTotals={data.totals}
    />
  );
}
