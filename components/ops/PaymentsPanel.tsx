"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addPayment, type OpsState } from "@/app/actions/ops";
import { formatMoney, formatWhen } from "@/lib/ops";

type ClientOption = { id: string; full_name: string };
type TripOption = { id: string; client_id: string; order_number: string; label: string };
type PaymentRow = {
  id: string;
  amount: number;
  method: string;
  note: string | null;
  paid_at: string;
  order_number: string | null;
  client_name: string;
  route: string | null;
};

const initial: OpsState = {};

export function PaymentsPanel({
  initialClients,
  initialTrips,
  initialPayments,
  initialTotals,
}: {
  initialClients: ClientOption[];
  initialTrips: TripOption[];
  initialPayments: PaymentRow[];
  initialTotals: { today: number; week: number; month: number; overall: number };
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [state, action, pending] = useActionState(addPayment, initial);
  const trips = initialTrips.filter((trip) => !clientId || trip.client_id === clientId);

  useEffect(() => {
    if (!state.notice) return;
    (document.getElementById("payment-form") as HTMLFormElement | null)?.reset();
    setClientId("");
    router.refresh();
  }, [state, router]);

  return (
    <div className="ops-stack">
      <div className="ops-stats money">
        <article>
          <strong>{formatMoney(initialTotals.today)}</strong>
          <span>Today</span>
        </article>
        <article>
          <strong>{formatMoney(initialTotals.week)}</strong>
          <span>This week</span>
        </article>
        <article>
          <strong>{formatMoney(initialTotals.month)}</strong>
          <span>This month</span>
        </article>
        <article>
          <strong>{formatMoney(initialTotals.overall)}</strong>
          <span>Overall</span>
        </article>
      </div>
      <div className="ops-grid-two">
        <section className="ops-card">
          <h1>Record a payment</h1>
          <p>When a client pays, save it here. Admin totals update for today, the week, the month and overall.</p>
          <form id="payment-form" className="ops-form" action={action}>
            <label>
              Client
              <select name="client_id" required value={clientId} onChange={(event) => setClientId(event.target.value)}>
                <option value="" disabled>
                  Select client
                </option>
                {initialClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Order
              <select key={clientId} name="trip_id" defaultValue="">
                <option value="">No specific order</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Amount (R)
              <input name="amount" type="number" min="1" step="0.01" required placeholder="2500" />
            </label>
            <label>
              Payment method
              <select name="method" required defaultValue="">
                <option value="" disabled>
                  Select method
                </option>
                <option value="EFT">EFT</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="WhatsApp">WhatsApp pay</option>
              </select>
            </label>
            <label>
              Paid at
              <input name="paid_at" type="datetime-local" />
            </label>
            <label>
              Note
              <textarea name="note" rows={2} placeholder="Deposit, balance, extra stop…" />
            </label>
            {state.error ? <p className="form-status">{state.error}</p> : null}
            {state.notice ? <p className="form-status success">{state.notice}</p> : null}
            <button className="button button-orange" type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save payment"}
            </button>
          </form>
        </section>
        <section className="ops-card">
          <h2>Payment history</h2>
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Client</th>
                  <th>Order</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {initialPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatWhen(payment.paid_at)}</td>
                    <td>
                      {payment.client_name}
                      <br />
                      <small>{payment.method}{payment.note ? ` · ${payment.note}` : ""}</small>
                    </td>
                    <td>{payment.order_number || "—"}</td>
                    <td>{formatMoney(payment.amount)}</td>
                  </tr>
                ))}
                {!initialPayments.length ? (
                  <tr>
                    <td colSpan={4}>No payments recorded yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
