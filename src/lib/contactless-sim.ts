import { randomUUID } from "node:crypto";

export type ContactlessStatus = "pending" | "approved" | "declined" | "expired";

export interface ContactlessSession {
  id: string;
  amount: number;
  vehicle: string;
  status: ContactlessStatus;
  createdAt: string;
  expiresAt: string;
}

type ContactlessStore = Map<string, ContactlessSession>;

const globalStore = globalThis as typeof globalThis & {
  __locadedContactlessStore?: ContactlessStore;
};

const store = globalStore.__locadedContactlessStore ?? new Map<string, ContactlessSession>();
globalStore.__locadedContactlessStore = store;

const SESSION_TTL_MS = 10 * 60 * 1000;

export function createContactlessSession(amount: number, vehicle: string): ContactlessSession {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("El monto del pago sin contacto es inválido.");
  }

  const now = Date.now();
  const session: ContactlessSession = {
    id: randomUUID(),
    amount: Math.round((amount + Number.EPSILON) * 100) / 100,
    vehicle: vehicle.trim().slice(0, 160) || "Vehículo LocadedCar",
    status: "pending",
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
  };

  store.set(session.id, session);
  return session;
}

export function getContactlessSession(id: string): ContactlessSession | null {
  const session = store.get(id);
  if (!session) return null;

  if (session.status === "pending" && Date.now() > Date.parse(session.expiresAt)) {
    const expired = { ...session, status: "expired" as const };
    store.set(id, expired);
    return expired;
  }

  return session;
}

export function updateContactlessSession(
  id: string,
  status: Extract<ContactlessStatus, "approved" | "declined">,
): ContactlessSession | null {
  const current = getContactlessSession(id);
  if (!current) return null;
  if (current.status !== "pending") return current;

  const updated: ContactlessSession = { ...current, status };
  store.set(id, updated);
  return updated;
}
