import { create } from "zustand";
import type { Lighting, PetSave } from "./types";
import { applyOfflineDecay, DEFAULT_SAVE, loadSave, writeSave } from "./save";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

type PetStore = PetSave & {
  hydrated: boolean;
  hydrate: () => void;
  adopt: (name: string) => void;
  tickNeeds: (dt: number, sleeping: boolean, walking: boolean) => void;
  feed: () => void;
  play: () => void;
  rest: () => void;
  pet: () => void;
  setMuted: (muted: boolean) => void;
  setLighting: (lighting: Lighting) => void;
  flush: () => void;
};

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let pending: PetSave | null = null;

function snapshot(partial: Partial<PetSave> = {}): PetSave {
  const state = usePetStore.getState();
  return {
    version: 1,
    name: state.name,
    hunger: state.hunger,
    mood: state.mood,
    energy: state.energy,
    bornAt: state.bornAt,
    lastTick: state.lastTick,
    muted: state.muted,
    lighting: state.lighting,
    careCount: state.careCount,
    ...partial,
  };
}

function persist(partial: Partial<PetSave> = {}) {
  pending = snapshot(partial);
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    if (pending) writeSave(pending);
    pending = null;
    writeTimer = null;
  }, 2000);
}

export const usePetStore = create<PetStore>((set, get) => ({
  ...DEFAULT_SAVE,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const now = Date.now();
    const loaded = applyOfflineDecay(loadSave(), now);
    set({ ...loaded, hydrated: true });
    if (loaded.name) writeSave({ ...loaded, lastTick: now });
  },

  adopt: (name) => {
    const now = Date.now();
    const trimmed = name.trim().slice(0, 12) || "麻糬";
    const next: PetSave = {
      ...DEFAULT_SAVE,
      name: trimmed,
      bornAt: now,
      lastTick: now,
    };
    set({ ...next, hydrated: true });
    writeSave(next);
  },

  tickNeeds: (dt, sleeping, walking) => {
    const s = get();
    if (!s.name) return;
    const hunger = clamp(s.hunger - dt * 0.11);
    const mood = clamp(s.mood - dt * (walking ? 0.04 : 0.07));
    const energy = sleeping
      ? clamp(s.energy + dt * 4.2)
      : clamp(s.energy - dt * (walking ? 0.16 : 0.07));
    set({ hunger, mood, energy, lastTick: Date.now() });
    persist({ hunger, mood, energy, lastTick: Date.now() });
  },

  feed: () => {
    const hunger = clamp(get().hunger + 28);
    const mood = clamp(get().mood + 6);
    const careCount = get().careCount + 1;
    set({ hunger, mood, careCount });
    persist({ hunger, mood, careCount });
  },

  play: () => {
    const mood = clamp(get().mood + 18);
    const energy = clamp(get().energy - 10);
    const hunger = clamp(get().hunger - 4);
    const careCount = get().careCount + 1;
    set({ mood, energy, hunger, careCount });
    persist({ mood, energy, hunger, careCount });
  },

  rest: () => {
    persist({ energy: get().energy });
  },

  pet: () => {
    const mood = clamp(get().mood + 10);
    const careCount = get().careCount + 1;
    set({ mood, careCount });
    persist({ mood, careCount });
  },

  setMuted: (muted) => {
    set({ muted });
    persist({ muted });
  },

  setLighting: (lighting) => {
    set({ lighting });
    persist({ lighting });
  },

  flush: () => {
    const s = get();
    if (!s.name) return;
    if (writeTimer) {
      clearTimeout(writeTimer);
      writeTimer = null;
    }
    pending = null;
    writeSave({
      version: 1,
      name: s.name,
      hunger: s.hunger,
      mood: s.mood,
      energy: s.energy,
      bornAt: s.bornAt,
      lastTick: Date.now(),
      muted: s.muted,
      lighting: s.lighting,
      careCount: s.careCount,
    });
  },
}));
