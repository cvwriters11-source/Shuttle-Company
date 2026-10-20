import { OpsShell } from "@/components/ops/OpsShell";
import { requireRole } from "@/lib/auth";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("admin");
  return (
    <OpsShell role="admin" name={session.profile?.full_name ?? "Admin"} email={session.profile?.email}>
      {children}
    </OpsShell>
  );
}
