import { GpsTracker } from "@/components/ops/GpsTracker";
import { OpsShell } from "@/components/ops/OpsShell";
import { requireRole } from "@/lib/auth";

export const metadata = {
  title: "Driver",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("driver");
  return (
    <OpsShell role="driver" name={session.profile?.full_name ?? "Driver"} email={session.profile?.email}>
      <GpsTracker driverId={session.userId} />
      {children}
    </OpsShell>
  );
}
