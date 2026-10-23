/* ——— Persistence: library of analyses in localStorage (mirrors the DB schema) ——— */

import type { Analysis } from "./audio";

const KEY = "echolens.library.v1";

export function loadLibrary(): Analysis[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Analysis[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveToLibrary(a: Analysis): Analysis[] {
  const lib = loadLibrary();
  const idx = lib.findIndex(x => x.id === a.id);
  if (idx >= 0) lib[idx] = a; else lib.unshift(a);
  const trimmed = lib.slice(0, 24);
  try { localStorage.setItem(KEY, JSON.stringify(trimmed)); } catch { /* quota */ }
  return trimmed;
}

export function removeFromLibrary(id: string): Analysis[] {
  const lib = loadLibrary().filter(a => a.id !== id);
  try { localStorage.setItem(KEY, JSON.stringify(lib)); } catch { /* noop */ }
  return lib;
}

export function formatDuration(t: number) {
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
export function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
