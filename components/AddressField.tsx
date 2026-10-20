"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PlaceSuggestion } from "@/lib/places";

type AddressFieldProps = {
  name: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
};

export function AddressField({ name, required, placeholder, defaultValue = "" }: AddressFieldProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const pickedRef = useRef(false);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);

  useEffect(() => {
    if (pickedRef.current) {
      pickedRef.current = false;
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as { suggestions?: PlaceSuggestion[] };
        const next = data.suggestions ?? [];
        setSuggestions(next);
        setActive(0);
        setOpen(next.length > 0);
      } catch {
        if (!controller.signal.aborted) setSuggestions([]);
      }
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function choose(label: string) {
    pickedRef.current = true;
    setValue(label);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div className="address-field" ref={rootRef}>
      <input
        name={name}
        value={value}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => {
          if (suggestions.length) setOpen(true);
        }}
        onKeyDown={(event) => {
          if (!open || suggestions.length === 0) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((current) => (current + 1) % suggestions.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((current) => (current - 1 + suggestions.length) % suggestions.length);
          } else if (event.key === "Enter") {
            event.preventDefault();
            choose(suggestions[active]?.label ?? value);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open ? (
        <ul id={listId} className="address-suggest" role="listbox">
          {suggestions.map((place, index) => (
            <li key={place.label} role="option" aria-selected={index === active}>
              <button
                type="button"
                className={index === active ? "is-active" : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(place.label)}
              >
                {place.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
