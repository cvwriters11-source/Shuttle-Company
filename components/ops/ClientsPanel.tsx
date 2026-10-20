"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addClient, type OpsState } from "@/app/actions/ops";
import { AddressField } from "@/components/AddressField";
import { formatWhen } from "@/lib/ops";

type Client = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  pickup: string;
  dropoff: string;
  notes: string | null;
  created_at: string;
  source?: "admin" | "quote";
  order_number?: string | null;
  has_portal?: boolean;
};

const initial: OpsState = {};

export function ClientsPanel({ initialClients }: { initialClients: Client[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(addClient, initial);

  useEffect(() => {
    if (!state.notice) return;
    (document.getElementById("client-form") as HTMLFormElement | null)?.reset();
    router.refresh();
  }, [state, router]);

  return (
    <div className="ops-grid-two">
      <section className="ops-card">
        <h1>Add a client</h1>
        <form id="client-form" className="ops-form" action={action}>
          <label>
            Full name
            <input name="full_name" required />
          </label>
          <label>
            Phone
            <input name="phone" />
          </label>
          <label>
            Email
            <input name="email" type="email" />
          </label>
          <label>
            Pick-up
            <AddressField name="pickup" required placeholder="South African address" />
          </label>
          <label>
            Drop-off
            <AddressField name="dropoff" required placeholder="South African address" />
          </label>
          <label>
            Notes
            <textarea name="notes" rows={3} />
          </label>
          {state.error ? <p className="form-status">{state.error}</p> : null}
          {state.notice ? <p className="form-status success">{state.notice}</p> : null}
          <button className="button button-orange" type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save client"}
          </button>
        </form>
      </section>
      <section className="ops-card">
        <h2>All clients</h2>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Order</th>
                <th>Pick-up</th>
                <th>Drop-off</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {initialClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    {client.full_name}
                    <br />
                    <small>{client.source === "quote" ? "Website quote" : "Added by admin"}{client.has_portal ? " · Portal login" : ""}</small>
                  </td>
                  <td>{client.order_number || "—"}</td>
                  <td>{client.pickup || "—"}</td>
                  <td>{client.dropoff || "—"}</td>
                  <td>{client.phone || client.email}</td>
                </tr>
              ))}
              {!initialClients.length ? (
                <tr>
                  <td colSpan={5}>No clients yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
