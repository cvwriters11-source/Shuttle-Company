"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDriver, type OpsState } from "@/app/actions/ops";

type Driver = {
  id: string;
  full_name: string;
  phone: string | null;
  vehicle_label: string | null;
  is_active: boolean;
};

const initial: OpsState = {};

export function DriversPanel({ initialDrivers }: { initialDrivers: Driver[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(addDriver, initial);

  useEffect(() => {
    if (!state.notice) return;
    (document.getElementById("driver-form") as HTMLFormElement | null)?.reset();
    router.refresh();
  }, [state, router]);

  return (
    <div className="ops-grid-two">
      <section className="ops-card">
        <h1>Add a driver</h1>
        <p>Create a login the driver will use on their phone. GPS tracking starts as soon as they sign in.</p>
        <form id="driver-form" className="ops-form" action={action}>
          <label>
            Full name
            <input name="full_name" required />
          </label>
          <label>
            Phone
            <input name="phone" required />
          </label>
          <label>
            Email / login
            <input name="email" type="email" required />
          </label>
          <label>
            Temporary password
            <input name="password" type="text" minLength={8} required />
          </label>
          <label>
            Vehicle
            <input name="vehicle_label" placeholder="e.g. 10 seater minivan" />
          </label>
          {state.error ? <p className="form-status">{state.error}</p> : null}
          {state.notice ? <p className="form-status success">{state.notice}</p> : null}
          <button className="button button-orange" type="submit" disabled={pending}>
            {pending ? "Adding driver…" : "Add driver"}
          </button>
        </form>
      </section>
      <section className="ops-card">
        <h2>Driver team</h2>
        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Vehicle</th>
              </tr>
            </thead>
            <tbody>
              {initialDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td>{driver.full_name}</td>
                  <td>{driver.phone}</td>
                  <td>{driver.vehicle_label}</td>
                </tr>
              ))}
              {!initialDrivers.length ? (
                <tr>
                  <td colSpan={3}>No drivers added yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
