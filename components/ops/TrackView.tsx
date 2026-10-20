"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatWhen, statusLabels, type TrackPayload } from "@/lib/ops";

export function TrackView({ initialTrip }: { initialTrip: TrackPayload | null }) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 8000);
    return () => window.clearInterval(timer);
  }, [router]);

  if (!initialTrip) return <p className="form-status">Trip not found.</p>;

  return (
    <article className="ops-card track-card">
      <p className="kicker">Live trip updates</p>
      <h1>
        {initialTrip.pickup} → {initialTrip.dropoff}
      </h1>
      <p>Current status: {statusLabels[initialTrip.status] ?? initialTrip.status}</p>
      <p>Driver: {initialTrip.driver_name || "Being assigned"}</p>
      <p>Passenger: {initialTrip.client_name}</p>
      <p>Collection: {formatWhen(initialTrip.pickup_at)}</p>
      <ol className="track-timeline">
        {(initialTrip.events ?? []).map((event) => (
          <li key={event.id}>
            <strong>{statusLabels[event.status] ?? event.status}</strong>
            <span>{formatWhen(event.created_at)}</span>
            {event.note ? <small>{event.note}</small> : null}
          </li>
        ))}
        {!(initialTrip.events ?? []).length ? <li>Your driver has not started updates yet.</li> : null}
      </ol>
    </article>
  );
}
