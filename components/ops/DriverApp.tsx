"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTripProgress } from "@/app/actions/ops";
import { formatWhen, progressActions, statusLabels, trackingUrl } from "@/lib/ops";

type Trip = {
  id: string;
  pickup: string;
  dropoff: string;
  pickup_at: string | null;
  passengers: number;
  status: string;
  tracking_code: string;
  notes: string | null;
  clients: { full_name: string; phone: string | null } | null;
};

export function DriverApp({ initialTrips }: { initialTrips: Trip[] }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 10000);
    return () => window.clearInterval(timer);
  }, [router]);

  function updateTrip(tripId: string, status: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateTripProgress(tripId, status);
      if (result.error) {
        setMessage({ type: "err", text: result.error });
        return;
      }
      setMessage({ type: "ok", text: result.notice ?? "Admin and the client have been updated." });
      router.refresh();
    });
  }

  const active =
    initialTrips.find((trip) => ["started", "resting", "adding_fuel"].includes(trip.status)) ??
    initialTrips.find((trip) => trip.status === "scheduled");

  return (
    <div className="ops-stack">
      {message ? <p className={`form-status${message.type === "ok" ? " success" : ""}`}>{message.text}</p> : null}
      {active ? (
        <section className="ops-card driver-active">
          <p className="kicker">Current trip</p>
          <h1>
            {active.pickup} → {active.dropoff}
          </h1>
          <p>
            {active.clients?.full_name} · {active.passengers} passenger{active.passengers === 1 ? "" : "s"}
          </p>
          <p>{formatWhen(active.pickup_at)}</p>
          <p>Status: {statusLabels[active.status] ?? active.status}</p>
          <div className="progress-actions">
            {progressActions.map((action) => (
              <button
                key={action.status}
                className="button button-orange"
                type="button"
                onClick={() => updateTrip(active.id, action.status)}
                disabled={pending || active.status === action.status}
              >
                {action.label}
              </button>
            ))}
          </div>
          <p>
            Client tracking:{" "}
            <a className="text-link" href={trackingUrl(active.tracking_code)}>
              {active.tracking_code}
            </a>
          </p>
        </section>
      ) : (
        <section className="ops-card">
          <h1>No active trip</h1>
          <p>When admin assigns you a journey, it will appear here.</p>
        </section>
      )}
      <section className="ops-card">
        <h2>Assigned trips</h2>
        <ul className="trip-list">
          {initialTrips.map((trip) => (
            <li key={trip.id}>
              <strong>
                {trip.pickup} → {trip.dropoff}
              </strong>
              <span>{trip.clients?.full_name}</span>
              <span>{formatWhen(trip.pickup_at)}</span>
              <span>{statusLabels[trip.status] ?? trip.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
