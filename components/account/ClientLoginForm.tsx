"use client";

import { useActionState, useState } from "react";
import { loginClient, type AccountState } from "@/app/actions/account";

const initial: AccountState = {};

export function ClientLoginForm({ defaultIdentifier = "" }: { defaultIdentifier?: string }) {
  const [mode, setMode] = useState<"client" | "admin">("client");
  const [state, action, pending] = useActionState(loginClient, initial);
  const isClient = mode === "client";

  return (
    <form action={action} className="ops-form">
      <div className="login-modes" role="tablist" aria-label="Sign in as">
        <button type="button" role="tab" aria-selected={isClient} className={isClient ? "is-active" : undefined} onClick={() => setMode("client")}>
          Client
        </button>
        <button type="button" role="tab" aria-selected={!isClient} className={!isClient ? "is-active" : undefined} onClick={() => setMode("admin")}>
          Admin
        </button>
      </div>
      <label>
        User
        <input
          name="identifier"
          type={isClient ? "email" : "text"}
          autoComplete="username"
          defaultValue={defaultIdentifier}
          placeholder={isClient ? "Email" : "User"}
          required
        />
      </label>
      <label>
        Password
        <input
          key={mode}
          name="password"
          type={isClient ? "text" : "password"}
          autoComplete={isClient ? "off" : "current-password"}
          placeholder={isClient ? "Order number" : "Password"}
          required
        />
      </label>
      {state.error ? <p className="form-status">{state.error}</p> : null}
      <button className="button button-orange" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
