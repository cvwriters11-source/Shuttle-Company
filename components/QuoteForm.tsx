"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitQuote, type QuoteState } from "@/app/actions/quote";

type QuoteFormProps = { compact?: boolean };

const initial: QuoteState = {};

export function QuoteForm({ compact = false }: QuoteFormProps) {
  const [state, action, pending] = useActionState(submitQuote, initial);

  if (state.orderNumber) {
    return (
      <div className={compact ? "quote-panel compact" : "quote-panel"} id="quote-form">
        <h2>Your booking is with admin</h2>
        <div className="quote-confirm">
          <p>Pick-up and drop-off are saved on your order. Use these details to open your trip profile, track the driver and share the route.</p>
          <dl className="credential-list">
            <div>
              <dt>Order number</dt>
              <dd>{state.orderNumber}</dd>
            </div>
            <div>
              <dt>Login email</dt>
              <dd>{state.email}</dd>
            </div>
            <div>
              <dt>Password</dt>
              <dd>{state.password || state.orderNumber}</dd>
            </div>
          </dl>
          <p className="form-status success">Sign in with your email and this order number as the password.</p>
          <Link className="button button-orange" href="/account">
            Open my booking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "quote-panel compact" : "quote-panel"} id="quote-form">
      <h2>Request a {compact ? "" : "Quick "}Quotation</h2>
      <form action={action}>
        <div className="form-grid">
          <label>
            Name <span>*</span>
            <input name="name" autoComplete="name" required />
          </label>
          <label>
            Cellphone <span>*</span>
            <input name="phone" type="tel" autoComplete="tel" required />
          </label>
          <label>
            Email <span>*</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Date <span>*</span>
            <input name="date" type="date" required />
          </label>
          <label>
            Time <span>*</span>
            <input name="time" type="time" required />
          </label>
          <label>
            Flight Number
            <input name="flight" placeholder="e.g. SA123" />
          </label>
          <label className="wide">
            Pick-Up Location <span>*</span>
            <input name="pickup" placeholder="e.g. O.R. Tambo, hotel, address" required />
          </label>
          <label className="wide">
            Drop-Off Location <span>*</span>
            <input name="dropoff" placeholder="Hotel, lodge or address" required />
          </label>
          <label>
            Number of Passengers <span>*</span>
            <input name="passengers" type="number" min="1" defaultValue="1" required />
          </label>
          <fieldset>
            <legend>Return Trip <span>*</span></legend>
            <label className="radio"><input name="returnTrip" type="radio" value="Yes" required /> Yes</label>
            <label className="radio"><input name="returnTrip" type="radio" value="No" required /> No</label>
          </fieldset>
          <label className="full">
            Message or Comment
            <textarea name="message" rows={compact ? 3 : 5} />
          </label>
        </div>
        {state.error ? <p className="form-status">{state.error}</p> : null}
        <button className="button button-orange" type="submit" disabled={pending}>
          {pending ? "Sending to admin…" : "Submit Quote Request"}
        </button>
      </form>
    </div>
  );
}
