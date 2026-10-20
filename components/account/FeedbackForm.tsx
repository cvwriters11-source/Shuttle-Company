"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addTripFeedback, type AccountState } from "@/app/actions/account";

const initial: AccountState = {};

export function FeedbackForm({ tripId }: { tripId?: string | null }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(addTripFeedback, initial);

  useEffect(() => {
    if (!state.notice) return;
    (document.getElementById("feedback-form") as HTMLFormElement | null)?.reset();
    router.refresh();
  }, [state, router]);

  return (
    <form id="feedback-form" className="ops-form" action={action}>
      {tripId ? <input type="hidden" name="trip_id" value={tripId} /> : null}
      <label>
        How was this trip?
        <select name="rating" defaultValue="">
          <option value="">No rating</option>
          <option value="5">5 — Excellent</option>
          <option value="4">4 — Good</option>
          <option value="3">3 — Average</option>
          <option value="2">2 — Poor</option>
          <option value="1">1 — Very poor</option>
        </select>
      </label>
      <label>
        Feedback for admin
        <textarea name="message" rows={4} placeholder="Tell us about the driver, the vehicle or anything we should know." />
      </label>
      <label className="check-row">
        <input name="safety_alert" type="checkbox" />
        Alert admin now — I feel unsafe or something is wrong
      </label>
      {state.error ? <p className="form-status">{state.error}</p> : null}
      {state.notice ? <p className="form-status success">{state.notice}</p> : null}
      <button className="button button-orange" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}
