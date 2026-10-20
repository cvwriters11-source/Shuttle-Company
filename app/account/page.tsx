import Image from "next/image";
import Link from "next/link";
import { ClientPortal } from "@/components/account/ClientPortal";
import { logoutClient } from "@/app/actions/account";
import { requireClient } from "@/lib/auth";
import { loadClientPortal } from "@/lib/ops-store";

export const metadata = {
  title: "My booking",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireClient();
  const portal = await loadClientPortal(session.clientId);
  if (!portal) return null;

  return (
    <div className="account-shell">
      <header className="account-header">
        <Link href="/account" className="ops-brand">
          <Image src="/images/lions-route-logo.jpg" alt="Lion’s Route Shuttles SA" width={72} height={54} />
          <span>
            <strong>Lion&apos;s Route</strong>
            <small>My booking</small>
          </span>
        </Link>
        <nav>
          <Link href="/">Website</Link>
          <Link href="/account">Track my trip</Link>
        </nav>
        <div className="account-user">
          <span>{portal.client.full_name}</span>
          <form action={logoutClient}>
            <button type="submit" className="button button-orange">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="ops-main">
        <ClientPortal clientName={portal.client.full_name} trips={portal.trips} feedback={portal.feedback} />
      </main>
    </div>
  );
}
