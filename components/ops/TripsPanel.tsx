"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { assignTrip, type OpsState } from "@/app/actions/ops";
import { formatLocalInput, formatWhen, statusLabels, trackingUrl } from "@/lib/ops";

type Option = {
  id: string;
  full_name: string;
  pickup?: string;
  dropoff?: string;
  order_number?: string | null;
  pending_pickup_at?: string | null;
  pending_passengers?: number | null;
};
type Trip = {
  id: string;
  pickup: string;
  dropoff: string;
  pickup_at: string | null;
  passengers: number;
  status: string;
  tracking_code: string;
  order_number?: string;
  clients: { full_name: string } | null;
  profiles: { full_name: string } | null;
};

const initial: OpsState = {};

export function TripsPanel({
  initialClients,
  initialDrivers,
  initialTrips,
}: {
  initialClients: Option[];
  initialDrivers: Option[];
  initialTrips: Trip[];
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [state, action, pending] = useActionState(assignTrip, initial);
  const selected = initialClients.find((client) => client.id === clientId);

  useEffect(() => {
    if (!state.notice) return;
    (document.getElementById("trip-form") as HTMLFormElement | null)?.reset();
    setClientId("");
    router.refresh();
  }, [state, router]);

  return (
    <div className="ops-stack">
      <section className="ops-card">
        <h1>Assign a trip</h1>
        <form id="trip-form" className="ops-form ops-form-grid" action={action}>
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
            Driver
            <select name="driver_id" required defaultValue="">
              <option value="" disabled>
                Select driver
              </option>
              {initialDrivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.full_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Pick-up
            <input name="pickup" value={selected?.pickup ?? ""} placeholder="Taken from the client" readOnly />
          </label>
          <label>
            Drop-off
            <input name="dropoff" value={selected?.dropoff ?? ""} placeholder="Taken from the client" readOnly />
          </label>
          <label>
            Date and time
            <input key={`${clientId}-when`} name="pickup_at" type="datetime-local" defaultValue={formatLocalInput(selected?.pending_pickup_at)} />
          </label>
          <label>
            Passengers
            <input key={`${clientId}-pax`} name="passengers" type="number" min={1} defaultValue={selected?.pending_passengers ?? 1} />
          </label>
          <label className="wide">
            Notes
            <textarea name="notes" rows={2} />
          </label>
          {selected && (!selected.pickup || !selected.dropoff) ? (
            <p className="form-status wide">Add pick-up and drop-off on this client first.</p>
          ) : null}
          {state.error ? <p className="form-status wide">{state.error}</p> : null}
          {state.notice ? <p className="form-status success wide">{state.notice}</p> : null}
          <button className="button button-orange" type="submit" disabled={pending}>
            {pending ? "Assigning…" : "Give driver this trip"}
          </button>
        </form>
      </section>
      <section className="ops-card">
        <h2>All trips</h2>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Client</th>
                <th>Driver</th>
                <th>Route</th>
                <th>When</th>
                <th>Status</th>
                <th>Client link</th>
              </tr>
            </thead>
            <tbody>
              {initialTrips.map((trip) => (
                <tr key={trip.id}>
                  <td>{trip.order_number || "—"}</td>
                  <td>{trip.clients?.full_name}</td>
                  <td>{trip.profiles?.full_name || "Awaiting assignment"}</td>
                  <td>
                    {trip.pickup} → {trip.dropoff}
                  </td>
                  <td>{formatWhen(trip.pickup_at)}</td>
                  <td>{statusLabels[trip.status] ?? trip.status}</td>
                  <td>
                    <a className="text-link" href={trackingUrl(trip.tracking_code)} target="_blank" rel="noreferrer">
                      {trip.tracking_code}
                    </a>
                  </td>
                </tr>
              ))}
              {!initialTrips.length ? (
                <tr>
                  <td colSpan={7}>No trips yet. Website quotes appear here until you assign a driver.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
