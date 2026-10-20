import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { MapDriver } from "@/components/ops/LiveMap";
import { newTrackingCode, sumPayments, type TrackPayload } from "@/lib/ops";

export type StaffUser = {
  id: string;
  email: string;
  passwordHash: string;
  role: "admin" | "driver";
  fullName: string;
  phone: string | null;
  vehicleLabel: string | null;
  isActive: boolean;
  createdAt: string;
};

export type ClientRecord = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  pickup: string;
  dropoff: string;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
  passwordHash: string | null;
  source: "admin" | "quote";
};

export type TripRecord = {
  id: string;
  clientId: string;
  driverId: string | null;
  pickup: string;
  dropoff: string;
  pickupAt: string | null;
  passengers: number;
  notes: string | null;
  status: string;
  trackingCode: string;
  orderNumber: string;
  flight: string | null;
  returnTrip: boolean | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
};

export type FeedbackRecord = {
  id: string;
  clientId: string;
  tripId: string | null;
  orderNumber: string | null;
  message: string;
  rating: number | null;
  safetyAlert: boolean;
  createdAt: string;
};

export type TripEventRecord = {
  id: string;
  tripId: string;
  driverId: string | null;
  status: string;
  note: string | null;
  createdAt: string;
};

export type PaymentRecord = {
  id: string;
  clientId: string;
  tripId: string | null;
  orderNumber: string | null;
  amount: number;
  method: string;
  note: string | null;
  paidAt: string;
  createdAt: string;
  createdBy: string | null;
};

export type LocationRecord = {
  driverId: string;
  lat: number;
  lng: number;
  heading: number | null;
  accuracy: number | null;
  isOnline: boolean;
  updatedAt: string;
};

type Store = {
  users: StaffUser[];
  clients: ClientRecord[];
  trips: TripRecord[];
  events: TripEventRecord[];
  locations: LocationRecord[];
  feedback: FeedbackRecord[];
  payments: PaymentRecord[];
};

const filePath = join(process.cwd(), "data", "ops.json");
const empty = (): Store => ({ users: [], clients: [], trips: [], events: [], locations: [], feedback: [], payments: [] });

let queue: Promise<unknown> = Promise.resolve();

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const current = Buffer.from(hash, "hex");
  return current.length === next.length && timingSafeEqual(current, next);
}

function clientInitials(fullName: string) {
  const parts = fullName
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean);
  const letter = (value: string) => (value.match(/[A-Za-z]/)?.[0] ?? "X").toUpperCase();
  if (parts.length >= 2) return `${letter(parts[0])}${letter(parts[parts.length - 1])}`;
  if (parts[0]) {
    const letters = [...parts[0]].filter((ch) => /[A-Za-z]/.test(ch)).join("").toUpperCase();
    return (letters + "X").slice(0, 2);
  }
  return "XX";
}

function normalizeOrderNumber(value: string) {
  return value.trim().toUpperCase().replace(/[\s-]/g, "");
}

function isLegacyOrderNumber(value: string) {
  return !value || /^LRS-\d{4}-\d+$/i.test(value);
}

function orderSequence(value: string) {
  const match = normalizeOrderNumber(value).match(/^[A-Z]{2}(\d+)$/);
  return match ? Number(match[1]) : NaN;
}

function nextOrderNumber(store: Store, fullName: string) {
  let max = 0;
  for (const trip of store.trips) {
    const n = orderSequence(trip.orderNumber ?? "");
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${clientInitials(fullName)}${String(max + 1).padStart(4, "0")}`;
}

function applyOrderNumber(store: Store, trip: TripRecord, next: string) {
  const old = trip.orderNumber;
  trip.orderNumber = next;
  for (const payment of store.payments ?? []) {
    if (payment.tripId === trip.id || (old && payment.orderNumber === old)) {
      payment.orderNumber = next;
    }
  }
  for (const item of store.feedback ?? []) {
    if (item.tripId === trip.id || (old && item.orderNumber === old)) {
      item.orderNumber = next;
    }
  }
  const client = store.clients.find((row) => row.id === trip.clientId);
  if (client?.email) client.passwordHash = hashPassword(next);
}

function hasDuplicateOrderSequences(store: Store) {
  const seen = new Set<number>();
  for (const trip of store.trips) {
    const n = orderSequence(trip.orderNumber ?? "");
    if (!Number.isFinite(n)) continue;
    if (seen.has(n)) return true;
    seen.add(n);
  }
  return false;
}

function rewriteOrderNumbers(store: Store, trips: TripRecord[]) {
  if (!trips.length) return false;
  const ordered = trips.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (const trip of ordered) {
    const client = store.clients.find((row) => row.id === trip.clientId);
    applyOrderNumber(store, trip, nextOrderNumber(store, client?.fullName ?? "Client"));
  }
  return true;
}

function rewriteLegacyOrderNumbers(store: Store) {
  return rewriteOrderNumbers(
    store,
    store.trips.filter((trip) => isLegacyOrderNumber(trip.orderNumber)),
  );
}

function rewriteSharedOrderSequences(store: Store) {
  if (!hasDuplicateOrderSequences(store)) return false;
  const trips = store.trips.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (const trip of trips) trip.orderNumber = "";
  return rewriteOrderNumbers(store, trips);
}

function migrateStore(store: Store) {
  store.feedback ??= [];
  store.payments ??= [];
  store.clients = (store.clients ?? []).map((client) => ({
    ...client,
    pickup: client.pickup ?? "",
    dropoff: client.dropoff ?? "",
    passwordHash: client.passwordHash ?? null,
    source: client.source ?? "admin",
  }));
  store.trips = (store.trips ?? []).map((trip) => ({
    ...trip,
    flight: trip.flight ?? null,
    returnTrip: trip.returnTrip ?? null,
    orderNumber: trip.orderNumber ?? "",
  }));
  rewriteLegacyOrderNumbers(store);
  rewriteSharedOrderSequences(store);
}

async function readStore() {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    return empty();
  }
}

function needsMigrate(store: Store) {
  return (
    !Array.isArray(store.feedback) ||
    !Array.isArray(store.payments) ||
    (store.trips ?? []).some((trip) => isLegacyOrderNumber(trip.orderNumber)) ||
    hasDuplicateOrderSequences(store) ||
    (store.clients ?? []).some((client) => client.passwordHash === undefined || !client.source)
  );
}

async function writeStore(store: Store) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(store, null, 2));
}

function seedAdmin(store: Store) {
  const email = (process.env.OPS_ADMIN_EMAIL ?? "sam@techlypc.co.za").trim().toLowerCase();
  const password = process.env.OPS_ADMIN_PASSWORD ?? "Gospelman";
  if (store.users.some((user) => user.email === email)) return;
  store.users.push({
    id: crypto.randomUUID(),
    email,
    passwordHash: hashPassword(password),
    role: "admin",
    fullName: "Sam",
    phone: null,
    vehicleLabel: null,
    isActive: true,
    createdAt: new Date().toISOString(),
  });
}

function withStore<T>(fn: (store: Store) => T | Promise<T>, persist = true) {
  const run = queue.then(async () => {
    const store = await readStore();
    const before = store.users.length;
    const migrate = needsMigrate(store);
    seedAdmin(store);
    migrateStore(store);
    const result = await fn(store);
    if (persist || migrate || store.users.length !== before) await writeStore(store);
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function getClientById(id: string) {
  return withStore((store) => store.clients.find((client) => client.id === id) ?? null, false);
}

export function getClientByLogin(identifier: string) {
  return withStore((store) => {
    const value = identifier.trim().toLowerCase();
    return store.clients.find((client) => client.email?.toLowerCase() === value) ?? null;
  }, false);
}

export function clientHasOrderPassword(clientId: string, password: string) {
  return withStore((store) => {
    const needle = normalizeOrderNumber(password);
    if (!needle) return false;
    return store.trips.some((trip) => trip.clientId === clientId && normalizeOrderNumber(trip.orderNumber) === needle);
  }, false);
}

export function getUserById(id: string) {
  return withStore((store) => store.users.find((user) => user.id === id) ?? null, false);
}

export function getUserByEmail(email: string) {
  return withStore((store) => store.users.find((user) => user.email === email.toLowerCase()) ?? null, false);
}

export function adminExists() {
  return withStore((store) => store.users.some((user) => user.role === "admin"), false);
}

export function asProfile(user: StaffUser) {
  return {
    id: user.id,
    full_name: user.fullName,
    email: user.email,
    phone: user.phone,
    vehicle_label: user.vehicleLabel,
    role: user.role,
    is_active: user.isActive,
  };
}

export function addClientRecord(input: {
  fullName: string;
  phone: string | null;
  email: string | null;
  pickup: string;
  dropoff: string;
  notes: string | null;
  createdBy: string;
}) {
  return withStore((store) => {
    const client: ClientRecord = {
      id: crypto.randomUUID(),
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      pickup: input.pickup,
      dropoff: input.dropoff,
      notes: input.notes,
      createdAt: new Date().toISOString(),
      createdBy: input.createdBy,
      passwordHash: null,
      source: "admin",
    };
    store.clients.unshift(client);
    return client;
  });
}

export function addDriverRecord(input: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  vehicleLabel: string | null;
}) {
  return withStore((store) => {
    if (store.users.some((user) => user.email === input.email.toLowerCase())) {
      throw new Error("A staff login with that email already exists.");
    }
    const user: StaffUser = {
      id: crypto.randomUUID(),
      email: input.email.toLowerCase(),
      passwordHash: hashPassword(input.password),
      role: "driver",
      fullName: input.fullName,
      phone: input.phone,
      vehicleLabel: input.vehicleLabel,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    return user;
  });
}

export function assignTripRecord(input: {
  clientId: string;
  driverId: string;
  pickup: string;
  dropoff: string;
  pickupAt: string | null;
  passengers: number;
  notes: string | null;
  createdBy: string;
}) {
  return withStore((store) => {
    const client = store.clients.find((row) => row.id === input.clientId);
    if (!client) throw new Error("Client not found.");
    const pickup = client.pickup || input.pickup;
    const dropoff = client.dropoff || input.dropoff;
    if (!pickup || !dropoff) throw new Error("This client needs a pick-up and drop-off location first.");
    const pending = store.trips.find(
      (row) => row.clientId === input.clientId && !row.driverId && row.status === "quoted",
    );
    const now = new Date().toISOString();
    if (pending) {
      pending.driverId = input.driverId;
      pending.pickup = pickup;
      pending.dropoff = dropoff;
      pending.pickupAt = input.pickupAt || pending.pickupAt;
      pending.passengers = input.passengers || pending.passengers;
      pending.notes = input.notes || pending.notes;
      pending.status = "scheduled";
      pending.updatedAt = now;
      store.events.push({
        id: crypto.randomUUID(),
        tripId: pending.id,
        driverId: input.driverId,
        status: "scheduled",
        note: "Driver assigned",
        createdAt: now,
      });
      return pending;
    }
    const trip: TripRecord = {
      id: crypto.randomUUID(),
      clientId: input.clientId,
      driverId: input.driverId,
      pickup,
      dropoff,
      pickupAt: input.pickupAt,
      passengers: input.passengers,
      notes: input.notes,
      status: "scheduled",
      trackingCode: newTrackingCode(),
      orderNumber: nextOrderNumber(store, client.fullName),
      flight: null,
      returnTrip: null,
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy,
    };
    store.trips.unshift(trip);
    if (client.email) client.passwordHash = hashPassword(trip.orderNumber);
    store.events.push({
      id: crypto.randomUUID(),
      tripId: trip.id,
      driverId: input.driverId,
      status: "scheduled",
      note: "Trip assigned",
      createdAt: now,
    });
    return trip;
  });
}

export function updateTripProgressRecord(tripId: string, driverId: string, status: string) {
  return withStore((store) => {
    const trip = store.trips.find((row) => row.id === tripId && row.driverId === driverId);
    if (!trip) throw new Error("Trip not found.");
    trip.status = status;
    trip.updatedAt = new Date().toISOString();
    store.events.push({
      id: crypto.randomUUID(),
      tripId,
      driverId,
      status,
      note: null,
      createdAt: new Date().toISOString(),
    });
    return trip;
  });
}

export function saveLocationRecord(input: LocationRecord) {
  return withStore((store) => {
    const current = store.locations.find((row) => row.driverId === input.driverId);
    if (current) Object.assign(current, input);
    else store.locations.push(input);
  });
}

export function submitQuoteRecord(input: {
  fullName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  flight: string | null;
  pickup: string;
  dropoff: string;
  passengers: number;
  returnTrip: boolean;
  message: string | null;
}) {
  return withStore((store) => {
    const email = input.email.toLowerCase();
    let client = store.clients.find((row) => row.email?.toLowerCase() === email);
    if (!client) {
      client = {
        id: crypto.randomUUID(),
        fullName: input.fullName,
        phone: input.phone,
        email,
        pickup: input.pickup,
        dropoff: input.dropoff,
        notes: input.message,
        createdAt: new Date().toISOString(),
        createdBy: null,
        passwordHash: null,
        source: "quote",
      };
      store.clients.unshift(client);
    } else {
      client.fullName = input.fullName;
      client.phone = input.phone;
      client.pickup = input.pickup;
      client.dropoff = input.dropoff;
      if (input.message) client.notes = input.message;
    }

    const pickupAt =
      input.date && input.time && !Number.isNaN(new Date(`${input.date}T${input.time}`).getTime())
        ? new Date(`${input.date}T${input.time}`).toISOString()
        : null;
    const notes = [
      input.message,
      input.flight ? `Flight ${input.flight}` : null,
      input.returnTrip ? "Return trip requested" : "One way",
    ]
      .filter(Boolean)
      .join(" · ");
    const now = new Date().toISOString();
    const trip: TripRecord = {
      id: crypto.randomUUID(),
      clientId: client.id,
      driverId: null,
      pickup: input.pickup,
      dropoff: input.dropoff,
      pickupAt,
      passengers: input.passengers,
      notes: notes || null,
      status: "quoted",
      trackingCode: newTrackingCode(),
      orderNumber: nextOrderNumber(store, client.fullName),
      flight: input.flight,
      returnTrip: input.returnTrip,
      createdAt: now,
      updatedAt: now,
      createdBy: null,
    };
    store.trips.unshift(trip);
    client.passwordHash = hashPassword(trip.orderNumber);
    store.events.push({
      id: crypto.randomUUID(),
      tripId: trip.id,
      driverId: null,
      status: "quoted",
      note: "Quote received from website",
      createdAt: now,
    });
    return { client, trip, password: trip.orderNumber };
  });
}

export function addFeedbackRecord(input: {
  clientId: string;
  tripId: string | null;
  message: string;
  rating: number | null;
  safetyAlert: boolean;
}) {
  return withStore((store) => {
    const client = store.clients.find((row) => row.id === input.clientId);
    if (!client) throw new Error("Client not found.");
    const trip = input.tripId ? store.trips.find((row) => row.id === input.tripId && row.clientId === client.id) : store.trips.find((row) => row.clientId === client.id);
    const feedback: FeedbackRecord = {
      id: crypto.randomUUID(),
      clientId: client.id,
      tripId: trip?.id ?? null,
      orderNumber: trip?.orderNumber ?? null,
      message: input.message,
      rating: input.rating,
      safetyAlert: input.safetyAlert,
      createdAt: new Date().toISOString(),
    };
    store.feedback.unshift(feedback);
    return feedback;
  });
}

function paymentView(store: Store, row: PaymentRecord) {
  const client = store.clients.find((item) => item.id === row.clientId);
  const trip = row.tripId ? store.trips.find((item) => item.id === row.tripId) : null;
  return {
    id: row.id,
    amount: row.amount,
    method: row.method,
    note: row.note,
    paid_at: row.paidAt,
    order_number: row.orderNumber ?? trip?.orderNumber ?? null,
    client_name: client?.fullName ?? "Client",
    route: trip ? `${trip.pickup} → ${trip.dropoff}` : null,
  };
}

export function addPaymentRecord(input: {
  clientId: string;
  tripId: string | null;
  amount: number;
  method: string;
  note: string | null;
  paidAt: string;
  createdBy: string;
}) {
  return withStore((store) => {
    const client = store.clients.find((row) => row.id === input.clientId);
    if (!client) throw new Error("Client not found.");
    const trip = input.tripId ? store.trips.find((row) => row.id === input.tripId && row.clientId === client.id) : null;
    if (input.tripId && !trip) throw new Error("That order does not belong to this client.");
    const payment: PaymentRecord = {
      id: crypto.randomUUID(),
      clientId: client.id,
      tripId: trip?.id ?? null,
      orderNumber: trip?.orderNumber ?? null,
      amount: input.amount,
      method: input.method,
      note: input.note,
      paidAt: input.paidAt,
      createdAt: new Date().toISOString(),
      createdBy: input.createdBy,
    };
    store.payments.unshift(payment);
    return payment;
  });
}

export function loadPayments() {
  return withStore((store) => {
    const payments = (store.payments ?? []).map((row) => paymentView(store, row));
    const totals = sumPayments(store.payments ?? []);
    const clients = store.clients
      .slice()
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
      .map((client) => ({ id: client.id, full_name: client.fullName }));
    const trips = store.trips.map((trip) => ({
      id: trip.id,
      client_id: trip.clientId,
      order_number: trip.orderNumber,
      label: `${trip.orderNumber} · ${trip.pickup} → ${trip.dropoff}`,
    }));
    return { payments, totals, clients, trips };
  }, false);
}

export function loadClients() {
  return withStore(
    (store) =>
      store.clients.map((client) => {
        const latest = store.trips.find((trip) => trip.clientId === client.id);
        return {
          id: client.id,
          full_name: client.fullName,
          phone: client.phone,
          email: client.email,
          pickup: client.pickup,
          dropoff: client.dropoff,
          notes: client.notes,
          created_at: client.createdAt,
          source: client.source,
          order_number: latest?.orderNumber ?? null,
          has_portal: Boolean(client.email) && store.trips.some((trip) => trip.clientId === client.id),
        };
      }),
    false,
  );
}

export function loadDrivers() {
  return withStore(
    (store) =>
      store.users
        .filter((user) => user.role === "driver")
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
        .map((user) => asProfile(user)),
    false,
  );
}

function tripView(store: Store, trip: TripRecord) {
  const client = store.clients.find((row) => row.id === trip.clientId);
  const driver = store.users.find((row) => row.id === trip.driverId);
  return {
    id: trip.id,
    pickup: trip.pickup,
    dropoff: trip.dropoff,
    pickup_at: trip.pickupAt,
    passengers: trip.passengers,
    status: trip.status,
    tracking_code: trip.trackingCode,
    order_number: trip.orderNumber,
    flight: trip.flight,
    return_trip: trip.returnTrip,
    updated_at: trip.updatedAt,
    notes: trip.notes,
    clients: client ? { full_name: client.fullName, phone: client.phone, email: client.email } : null,
    profiles: driver ? { full_name: driver.fullName, phone: driver.phone } : null,
  };
}

export function loadTripFormData() {
  return withStore((store) => {
    const clients = store.clients
      .slice()
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
      .map((client) => {
        const pending = store.trips.find((trip) => trip.clientId === client.id && trip.status === "quoted" && !trip.driverId);
        return {
          id: client.id,
          full_name: client.fullName,
          pickup: client.pickup,
          dropoff: client.dropoff,
          order_number: pending?.orderNumber ?? store.trips.find((trip) => trip.clientId === client.id)?.orderNumber ?? null,
          pending_pickup_at: pending?.pickupAt ?? null,
          pending_passengers: pending?.passengers ?? null,
        };
      });
    const drivers = store.users
      .filter((user) => user.role === "driver" && user.isActive)
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
      .map((user) => ({ id: user.id, full_name: user.fullName }));
    const trips = store.trips.map((trip) => tripView(store, trip));
    return { clients, drivers, trips };
  }, false);
}

export function loadDriverTrips(driverId: string) {
  return withStore(
    (store) =>
      store.trips
        .filter((trip) => trip.driverId === driverId && trip.status !== "cancelled")
        .map((trip) => tripView(store, trip)),
    false,
  );
}

export function loadAdminOverview() {
  return withStore((store) => {
    const now = Date.now();
    const drivers: MapDriver[] = store.users
      .filter((user) => user.role === "driver")
      .map((user) => {
        const location = store.locations.find((row) => row.driverId === user.id);
        const updatedAt = location?.updatedAt ?? "";
        const fresh = Boolean(location?.isOnline && updatedAt && now - new Date(updatedAt).getTime() < 90_000);
        return {
          id: user.id,
          full_name: user.fullName,
          phone: user.phone,
          vehicle_label: user.vehicleLabel,
          lat: location?.lat ?? 0,
          lng: location?.lng ?? 0,
          is_online: fresh,
          updated_at: updatedAt,
        };
      });
    const quotes = store.trips.filter((trip) => trip.status === "quoted").length;
    const alerts = store.feedback.filter((row) => row.safetyAlert).length;
    return {
      drivers,
      trips: store.trips.slice(0, 8).map((trip) => tripView(store, trip)),
      feedback: store.feedback.slice(0, 6).map((row) => feedbackView(store, row)),
      payments: (store.payments ?? []).slice(0, 6).map((row) => paymentView(store, row)),
      totals: sumPayments(store.payments ?? []),
      counts: {
        clients: store.clients.length,
        drivers: drivers.length,
        active: drivers.filter((driver) => driver.is_online).length,
        quotes,
        alerts,
      },
    };
  }, false);
}

export function loadTrackedTrip(code: string): Promise<TrackPayload | null> {
  return withStore((store) => {
    const trip = store.trips.find((row) => row.trackingCode === code);
    if (!trip) return null;
    const client = store.clients.find((row) => row.id === trip.clientId);
    const driver = store.users.find((row) => row.id === trip.driverId);
    const events = store.events
      .filter((event) => event.tripId === trip.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((event) => ({ id: event.id, status: event.status, note: event.note, created_at: event.createdAt }));
    return {
      id: trip.id,
      pickup: trip.pickup,
      dropoff: trip.dropoff,
      pickup_at: trip.pickupAt,
      passengers: trip.passengers,
      status: trip.status,
      updated_at: trip.updatedAt,
      client_name: client?.fullName ?? "",
      driver_name: driver?.fullName ?? null,
      driver_phone: driver?.phone ?? null,
      events,
    } satisfies TrackPayload;
  }, false);
}

function feedbackView(store: Store, row: FeedbackRecord) {
  const client = store.clients.find((item) => item.id === row.clientId);
  return {
    id: row.id,
    message: row.message,
    rating: row.rating,
    safety_alert: row.safetyAlert,
    order_number: row.orderNumber,
    created_at: row.createdAt,
    client_name: client?.fullName ?? "Client",
  };
}

export function loadSafetyMonitor() {
  return withStore(
    (store) => ({
      quotes: store.trips
        .filter((trip) => trip.status === "quoted")
        .map((trip) => tripView(store, trip)),
      feedback: store.feedback.map((row) => feedbackView(store, row)),
    }),
    false,
  );
}

export function loadClientPortal(clientId: string) {
  return withStore((store) => {
    const client = store.clients.find((row) => row.id === clientId);
    if (!client) return null;
    const now = Date.now();
    const trips = store.trips
      .filter((trip) => trip.clientId === clientId)
      .map((trip) => {
        const view = tripView(store, trip);
        const location = trip.driverId ? store.locations.find((row) => row.driverId === trip.driverId) : null;
        const driver = trip.driverId ? store.users.find((row) => row.id === trip.driverId) : null;
        const fresh = Boolean(location?.isOnline && location.updatedAt && now - new Date(location.updatedAt).getTime() < 90_000);
        const events = store.events
          .filter((event) => event.tripId === trip.id)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .map((event) => ({ id: event.id, status: event.status, note: event.note, created_at: event.createdAt }));
        return {
          ...view,
          events,
          driver_map: driver
            ? {
                id: driver.id,
                full_name: driver.fullName,
                phone: driver.phone,
                vehicle_label: driver.vehicleLabel,
                lat: location?.lat ?? 0,
                lng: location?.lng ?? 0,
                is_online: fresh,
                updated_at: location?.updatedAt ?? "",
              }
            : null,
        };
      });
    return {
      client: {
        id: client.id,
        full_name: client.fullName,
        email: client.email,
        phone: client.phone,
        pickup: client.pickup,
        dropoff: client.dropoff,
      },
      trips,
      feedback: store.feedback.filter((row) => row.clientId === clientId).map((row) => feedbackView(store, row)),
    };
  }, false);
}
