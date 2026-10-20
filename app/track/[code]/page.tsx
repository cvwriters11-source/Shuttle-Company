import Image from "next/image";
import Link from "next/link";
import { TrackView } from "@/components/ops/TrackView";
import { loadTrackedTrip } from "@/lib/ops-store";

export const metadata = {
  title: "Track your shuttle",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TrackPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const trip = await loadTrackedTrip(code);

  return (
    <div className="login-screen">
      <div className="track-shell">
        <Link href="/" className="ops-brand">
          <Image src="/images/lions-route-logo.jpg" alt="Lion’s Route Shuttles SA" width={72} height={54} />
          <span>
            <strong>Lion&apos;s Route</strong>
            <small>Your premium travel partner</small>
          </span>
        </Link>
        <TrackView initialTrip={trip} />
      </div>
    </div>
  );
}
