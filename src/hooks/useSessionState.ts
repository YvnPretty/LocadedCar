"use client";
import { useCallback, useMemo, useSyncExternalStore, type SetStateAction } from 'react';
const PREFIX = 'locaded:workflow:v1:';
const EVENT = 'locaded:workflow-change';
const TTL = 8 * 60 * 60 * 1000;
const memory = new Map<string, string>();
function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => { window.removeEventListener(EVENT, callback); window.removeEventListener('storage', callback); };
}
function read(key: string) {
  try { return sessionStorage.getItem(PREFIX + key) ?? memory.get(key) ?? null; }
  catch { return memory.get(key) ?? null; }
}
function compatible(value: unknown, initial: unknown): boolean {
  if (initial === null) return value === null || typeof value === 'string' || typeof value === 'object';
  if (Array.isArray(initial)) return Array.isArray(value) && value.every(item => typeof item === 'string');
  if (typeof initial === 'object') return !!value && typeof value === 'object' && Object.entries(initial).every(([key, field]) => compatible((value as Record<string, unknown>)[key], field));
  return typeof value === typeof initial;
}
function decode<T>(raw: string | null, fallback: T): T {
  try {
    const saved = raw ? JSON.parse(raw) : null;
    if (saved?.version === 1 && typeof saved.updatedAt === 'number' && Date.now() - saved.updatedAt < TTL && compatible(saved.value, fallback)) return saved.value;
  } catch { /* Corrupt drafts should never prevent navigation. */ }
  return fallback;
}
/** Per-tab drafts. Never use for credentials, card numbers or CVV. */
export function useSessionState<T>(key: string, initial: T): [T, (next: SetStateAction<T>) => void] {
  const initialJSON = JSON.stringify(initial);
  const fallback = useMemo(() => JSON.parse(initialJSON) as T, [initialJSON]);
  const snapshot = useCallback(() => read(key), [key]);
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const value = useMemo(() => decode(raw, fallback), [raw, fallback]);
  const set = useCallback((next: SetStateAction<T>) => {
    const current = decode(read(key), fallback);
    const value = typeof next === 'function' ? (next as (previous: T) => T)(current) : next;
    const serialized = JSON.stringify({ version: 1, updatedAt: Date.now(), value });
    memory.set(key, serialized);
    try { sessionStorage.setItem(PREFIX + key, serialized); } catch { /* In-memory continuity when storage is blocked. */ }
    window.dispatchEvent(new Event(EVENT));
  }, [key, fallback]);
  return [value, set];
}
export function clearSessionDraft(scope: string) {
  const prefix = `${scope}:`;
  for (const key of memory.keys()) if (key.startsWith(prefix)) memory.delete(key);
  try {
    for (const key of Object.keys(sessionStorage)) if (key.startsWith(PREFIX + prefix)) sessionStorage.removeItem(key);
  } catch { /* Storage may be disabled. */ }
  window.dispatchEvent(new Event(EVENT));
}
const noopSubscribe = () => () => {};
export function useSessionReady() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
