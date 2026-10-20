"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, formatWhen, statusLabels } from "@/lib/ops";
import type { MapDriver } from "@/components/ops/LiveMap";

const LiveMap = dynamic(() => import("@/components/ops/LiveMap").then((mod) => mod.LiveMap), { ssr: false });

export type TripRow = {
  id: string;
  pickup: string;
  dropoff: string;
  status: string;
  updated_at: string;
  tracking_code: string;
  order_number?: string;
  clients: { full_name: string } | null;
  profiles: { full_name: string } | null;
};

export type FeedbackRow = {
  id: string;
  message: string;
  rating: number | null;
  safety_alert: boolean;
  order_number: string | null;
  created_at: string;
  client_name: string;
};

export type PaymentRow = {
  id: string;
  amount: number;
  method: string;
  note: string | null;
  paid_at: string;
  order_number: string | null;
  client_name: string;
};

export function AdminDashboard({
  initialDrivers,
  initialTrips,
  initialFeedback,
  initialPayments,
  initialTotals,
  initialCounts,
}: {
  initialDrivers: MapDriver[];
  initialTrips: TripRow[];
  initialFeedback: FeedbackRow[];
  initialPayments: PaymentRow[];
  initialTotals: { today: number; week: number; month: number; overall: number };
  initialCounts: { clients: number; drivers: number; active: number; quotes: number; alerts: number };
}) {
  const router = useRouter();
  const drivers = initialDrivers;
  const trips = initialTrips;
  const feedback = initialFeedback;
  const payments = initialPayments;
  const totals = initialTotals;
  const counts = initialCounts;

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 6000);
    return () => window.clearInterval(timer);
  }, [router]);

  return (
    <div className="ops-stack">
      <div className="ops-stats">
        <article>
          <strong>{counts.active}</strong>
          <span>Drivers live on GPS</span>
        </article>
        <article>
          <strong>{counts.drivers}</strong>
          <span>Drivers</span>
        </article>
        <article>
          <strong>{counts.clients}</strong>
          <span>Clients</span>
        </article>
        <article>
          <strong>{counts.quotes}</strong>
          <span>Quotes waiting</span>
        </article>
        <article>
          <strong>{counts.alerts}</strong>
          <span>Safety alerts</span>
        </article>
      </div>
      <div className="ops-stats money">
        <article>
          <strong>{formatMoney(totals.today)}</strong>
          <span>Paid today</span>
        </article>
        <article>
          <strong>{formatMoney(totals.week)}</strong>
          <span>This week</span>
        </article>
        <article>
          <strong>{formatMoney(totals.month)}</strong>
          <span>This month</span>
        </article>
        <article>
          <strong>{formatMoney(totals.overall)}</strong>
          <span>Overall</span>
        </article>
      </div>
      <section className="ops-card">
        <h1>Live driver tracking</h1>
        <p>Any driver who is signed in shares their phone GPS with admin. Markers disappear when they sign out or go stale.</p>
        <LiveMap drivers={drivers} />
        <ul className="ops-online-list">
          {drivers.map((driver) => (
            <li key={driver.id}>
              <b>{driver.full_name}</b>
              <span className={driver.is_online ? "online" : "offline"}>{driver.is_online ? "Online" : "Offline"}</span>
              <small>{driver.vehicle_label || "No vehicle set"}</small>
            </li>
          ))}
          {!drivers.length ? <li>No drivers added yet.</li> : null}
        </ul>
      </section>
      <section className="ops-card">
        <h2>Latest trip updates</h2>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Client</th>
                <th>Driver</th>
                <th>Route</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id}>
                  <td>{trip.order_number || trip.tracking_code}</td>
                  <td>{trip.clients?.full_name}</td>
                  <td>{trip.profiles?.full_name || "Unassigned"}</td>
                  <td>
                    {trip.pickup} → {trip.dropoff}
                  </td>
                  <td>{statusLabels[trip.status] ?? trip.status}</td>
                  <td>{formatWhen(trip.updated_at)}</td>
                </tr>
              ))}
              {!trips.length ? (
                <tr>
                  <td colSpan={6}>No trips yet. Website quotes and assigned trips will appear here.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
      <section className="ops-card">
        <h2>Client feedback and safety</h2>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Order</th>
                <th>Message</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr key={item.id} className={item.safety_alert ? "alert-row" : undefined}>
                  <td>{item.client_name}</td>
                  <td>{item.order_number || "—"}</td>
                  <td>
                    {item.safety_alert ? <strong className="alert-flag">Safety alert · </strong> : null}
                    {item.rating ? `${item.rating}/5 · ` : null}
                    {item.message}
                  </td>
                  <td>{formatWhen(item.created_at)}</td>
                </tr>
              ))}
              {!feedback.length ? (
                <tr>
                  <td colSpan={4}>No client feedback yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
      <section className="ops-card">
        <h2>Latest payments</h2>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Order</th>
                <th>Amount</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    {payment.client_name}
                    <br />
                    <small>{payment.method}</small>
                  </td>
                  <td>{payment.order_number || "—"}</td>
                  <td>{formatMoney(payment.amount)}</td>
                  <td>{formatWhen(payment.paid_at)}</td>
                </tr>
              ))}
              {!payments.length ? (
                <tr>
                  <td colSpan={4}>No payments yet. Record one under Payments when a client pays.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
