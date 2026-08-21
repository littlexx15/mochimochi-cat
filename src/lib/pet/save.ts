import type { Lighting, PetSave } from "./types";

export const SAVE_KEY = "mochi-desk-v1";
export const SAVE_VERSION = 1 as const;

export const DEFAULT_SAVE: PetSave = {
  version: SAVE_VERSION,
  name: "",
  hunger: 78,
  mood: 82,
  energy: 70,
  bornAt: 0,
  lastTick: 0,
  muted: false,
  lighting: "auto",
  careCount: 0,
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function migrate(raw: unknown): PetSave {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SAVE };
  const s = raw as Partial<PetSave>;
  return {
    version: SAVE_VERSION,
    name: typeof s.name === "string" ? s.name.slice(0, 12) : "",
    hunger: clamp(Number(s.hunger ?? DEFAULT_SAVE.hunger)),
    mood: clamp(Number(s.mood ?? DEFAULT_SAVE.mood)),
    energy: clamp(Number(s.energy ?? DEFAULT_SAVE.energy)),
    bornAt: Number(s.bornAt ?? 0) || 0,
    lastTick: Number(s.lastTick ?? 0) || 0,
    muted: Boolean(s.muted),
    lighting: (["auto", "day", "night"] as Lighting[]).includes(s.lighting as Lighting)
      ? (s.lighting as Lighting)
      : "auto",
    careCount: Math.max(0, Number(s.careCount ?? 0) || 0),
  };
}

export function loadSave(): PetSave {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    return migrate(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function writeSave(save: PetSave) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    /* private mode / quota */
  }
}

/** Apply offline decay, capped so a long absence is sad — not empty. */
export function applyOfflineDecay(save: PetSave, now: number): PetSave {
  if (!save.lastTick || !save.name) return save;
  const elapsed = Math.max(0, (now - save.lastTick) / 1000);
  const hours = Math.min(elapsed / 3600, 8);
  return {
    ...save,
    hunger: clamp(save.hunger - hours * 8),
    mood: clamp(save.mood - hours * 6),
    energy: clamp(save.energy - hours * 4),
    lastTick: now,
  };
}
