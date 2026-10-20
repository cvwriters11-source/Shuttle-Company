"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatWhen, statusLabels, trackingUrl } from "@/lib/ops";

type QuoteRow = {
  id: string;
  pickup: string;
  dropoff: string;
  pickup_at: string | null;
  order_number: string;
  tracking_code: string;
  status: string;
  clients: { full_name: string; phone: string | null; email: string | null } | null;
};

type FeedbackRow = {
  id: string;
  message: string;
  rating: number | null;
  safety_alert: boolean;
  order_number: string | null;
  created_at: string;
  client_name: string;
};

export function SafetyPanel({ quotes, feedback }: { quotes: QuoteRow[]; feedback: FeedbackRow[] }) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 8000);
    return () => window.clearInterval(timer);
  }, [router]);

  return (
    <div className="ops-stack">
      <section className="ops-card">
        <h1>Safety monitor</h1>
        <p>Website quotes, live trip updates and client feedback all land here so admin can watch every booking.</p>
      </section>
      <section className="ops-card">
        <h2>New quotes waiting for a driver</h2>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Client</th>
                <th>Route</th>
                <th>When</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id}>
                  <td>
                    <a className="text-link" href={trackingUrl(quote.tracking_code)} target="_blank" rel="noreferrer">
                      {quote.order_number}
                    </a>
                  </td>
                  <td>
                    {quote.clients?.full_name}
                    <br />
                    <small>{quote.clients?.phone} {quote.clients?.email}</small>
                  </td>
                  <td>
                    {quote.pickup} → {quote.dropoff}
                  </td>
                  <td>{formatWhen(quote.pickup_at)}</td>
                  <td>{statusLabels[quote.status] ?? quote.status}</td>
                </tr>
              ))}
              {!quotes.length ? (
                <tr>
                  <td colSpan={5}>No open quotes. New website requests will appear here.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
      <section className="ops-card">
        <h2>Client feedback</h2>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Client</th>
                <th>Order</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr key={item.id} className={item.safety_alert ? "alert-row" : undefined}>
                  <td>{formatWhen(item.created_at)}</td>
                  <td>{item.client_name}</td>
                  <td>{item.order_number || "—"}</td>
                  <td>
                    {item.safety_alert ? <strong className="alert-flag">Safety alert · </strong> : null}
                    {item.rating ? `${item.rating}/5 · ` : null}
                    {item.message}
                  </td>
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
    </div>
  );
}
