"use client";

import { useActionState } from "react";
import { login, type AuthState } from "@/app/actions/auth";

const initial: AuthState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="ops-form">
      <label>
        Email
        <input name="email" type="email" autoComplete="username" defaultValue="sam@techlypc.co.za" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error ? <p className="form-status">{state.error}</p> : null}
      <button className="button button-orange" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
