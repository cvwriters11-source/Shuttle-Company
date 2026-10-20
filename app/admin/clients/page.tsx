import { ClientsPanel } from "@/components/ops/ClientsPanel";
import { requireRole } from "@/lib/auth";
import { loadClients } from "@/lib/ops-store";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  await requireRole("admin");
  const clients = await loadClients();
  return <ClientsPanel initialClients={clients} />;
}
