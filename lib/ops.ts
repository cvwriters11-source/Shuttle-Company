export const progressActions = [
  { status: "started", label: "Start trip", hint: "Tell admin and the client the journey has begun." },
  { status: "resting", label: "Resting now", hint: "Pause for a comfort or meal stop." },
  { status: "adding_fuel", label: "Adding fuel", hint: "Short fuel stop on the route." },
  { status: "arrived", label: "Arrived", hint: "Passengers have reached the drop-off." },
] as const;

export const statusLabels: Record<string, string> = {
  quoted: "Quote received",
  scheduled: "Scheduled",
  started: "Trip started",
  resting: "Resting now",
  adding_fuel: "Adding fuel",
  arrived: "Arrived",
  cancelled: "Cancelled",
  note: "Update",
};

export function formatWhen(value?: string | null) {
  if (!value) return "Time to be confirmed";
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function trackingUrl(code: string) {
  return `/track/${code}`;
}

export function newTrackingCode() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 10);
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount || 0);
}

const ZA = "Africa/Johannesburg";

function zaParts(value: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: ZA,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    })
      .formatToParts(value)
      .map((part) => [part.type, part.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday: parts.weekday ?? "Mon",
  };
}

function dayKey(value: Date) {
  const part = zaParts(value);
  return `${part.year}-${String(part.month).padStart(2, "0")}-${String(part.day).padStart(2, "0")}`;
}

function monthKey(value: Date) {
  const part = zaParts(value);
  return `${part.year}-${String(part.month).padStart(2, "0")}`;
}

function weekKeys(now: Date) {
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(zaParts(now).weekday);
  const fromMonday = weekday === 0 ? 6 : Math.max(weekday - 1, 0);
  const keys = new Set<string>();
  for (let i = 0; i <= fromMonday; i += 1) {
    keys.add(dayKey(new Date(now.getTime() - i * 24 * 60 * 60 * 1000)));
  }
  return keys;
}

export function sumPayments(payments: { amount: number; paidAt: string }[]) {
  const now = new Date();
  const today = dayKey(now);
  const month = monthKey(now);
  const week = weekKeys(now);
  const totals = { today: 0, week: 0, month: 0, overall: 0 };
  for (const payment of payments) {
    const when = new Date(payment.paidAt);
    if (Number.isNaN(when.getTime()) || !Number.isFinite(payment.amount)) continue;
    totals.overall += payment.amount;
    const key = dayKey(when);
    if (key === today) totals.today += payment.amount;
    if (week.has(key)) totals.week += payment.amount;
    if (monthKey(when) === month) totals.month += payment.amount;
  }
  return totals;
}

export function formatLocalInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export type TrackPayload = {
  id: string;
  pickup: string;
  dropoff: string;
  pickup_at: string | null;
  passengers: number;
  status: string;
  updated_at: string;
  client_name: string;
  driver_name: string | null;
  driver_phone: string | null;
  events: { id: string; status: string; note: string | null; created_at: string }[];
};
