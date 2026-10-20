import { SafetyPanel } from "@/components/ops/SafetyPanel";
import { requireRole } from "@/lib/auth";
import { loadSafetyMonitor } from "@/lib/ops-store";

export const dynamic = "force-dynamic";

export default async function SafetyPage() {
  await requireRole("admin");
  const data = await loadSafetyMonitor();
  return <SafetyPanel quotes={data.quotes} feedback={data.feedback} />;
}
