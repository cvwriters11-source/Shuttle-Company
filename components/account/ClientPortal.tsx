"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatWhen, statusLabels } from "@/lib/ops";
import type { MapDriver } from "@/components/ops/LiveMap";
import { FeedbackForm } from "@/components/account/FeedbackForm";
import { ShareRoute } from "@/components/account/ShareRoute";

const LiveMap = dynamic(() => import("@/components/ops/LiveMap").then((mod) => mod.LiveMap), { ssr: false });

export type PortalTrip = {
  id: string;
  pickup: string;
  dropoff: string;
  pickup_at: string | null;
  passengers: number;
  status: string;
  tracking_code: string;
  order_number: string;
  flight: string | null;
  return_trip: boolean | null;
  notes: string | null;
  profiles: { full_name: string; phone: string | null } | null;
  events: { id: string; status: string; note: string | null; created_at: string }[];
  driver_map: MapDriver | null;
};

export type PortalFeedback = {
  id: string;
  message: string;
  rating: number | null;
  safety_alert: boolean;
  order_number: string | null;
  created_at: string;
};

export function ClientPortal({
  clientName,
  trips,
  feedback,
}: {
  clientName: string;
  trips: PortalTrip[];
  feedback: PortalFeedback[];
}) {
  const router = useRouter();
  const trip = trips[0];

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 8000);
    return () => window.clearInterval(timer);
  }, [router]);

  if (!trip) {
    return (
      <section className="ops-card">
        <h1>No booking yet</h1>
        <p>Submit a quote with your pick-up and drop-off and your order will appear here.</p>
      </section>
    );
  }

  const drivers = trip.driver_map ? [trip.driver_map] : [];

  return (
    <div className="ops-stack">
      <section className="ops-card">
        <p className="kicker">Order {trip.order_number}</p>
        <h1>
          {trip.pickup} → {trip.dropoff}
        </h1>
        <p>Hello {clientName}. Admin has this booking and is monitoring the trip for safety.</p>
        <p>
          Status: <strong>{statusLabels[trip.status] ?? trip.status}</strong>
          {" · "}
          Collection: {formatWhen(trip.pickup_at)}
          {" · "}
          Passengers: {trip.passengers}
        </p>
        <p>Driver: {trip.profiles?.full_name || "Waiting for admin to assign a driver"}{trip.profiles?.phone ? ` · ${trip.profiles.phone}` : ""}</p>
        {trip.flight ? <p>Flight: {trip.flight}</p> : null}
        <ShareRoute orderNumber={trip.order_number} trackingCode={trip.tracking_code} pickup={trip.pickup} dropoff={trip.dropoff} />
      </section>

      <section className="ops-card">
        <h2>Track your driver</h2>
        <p>When your driver is signed in, their phone GPS appears here. Share the route with family so they can follow too.</p>
        <LiveMap drivers={drivers} />
        <ol className="track-timeline">
          {trip.events.map((event) => (
            <li key={event.id}>
              <strong>{statusLabels[event.status] ?? event.status}</strong>
              <span>{formatWhen(event.created_at)}</span>
              {event.note ? <small>{event.note}</small> : null}
            </li>
          ))}
          {!trip.events.length ? <li>Your driver has not started updates yet.</li> : null}
        </ol>
      </section>

      <div className="ops-grid-two">
        <section className="ops-card">
          <h2>Leave feedback</h2>
          <p>Admin reads every comment. Use the safety box if you need help during the trip.</p>
          <FeedbackForm tripId={trip.id} />
        </section>
        <section className="ops-card">
          <h2>Your messages to admin</h2>
          <ul className="trip-list">
            {feedback.map((item) => (
              <li key={item.id}>
                <strong>{item.safety_alert ? "Safety alert" : "Feedback"}{item.rating ? ` · ${item.rating}/5` : ""}</strong>
                <span>{item.message}</span>
                <small>{formatWhen(item.created_at)}{item.order_number ? ` · ${item.order_number}` : ""}</small>
              </li>
            ))}
            {!feedback.length ? <li>No feedback sent yet.</li> : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
