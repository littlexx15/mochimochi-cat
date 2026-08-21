import type { PetAnim } from "./types";

export const SHEET_CELL = 256;

export const SHEETS: Record<
  Exclude<PetAnim, "held">,
  { src: string; cols: number; rows: number; fps: number }
> = {
  idle: { src: "/sprites/mochi/idle.png", cols: 2, rows: 2, fps: 3.2 },
  walk: { src: "/sprites/mochi/walk.png", cols: 2, rows: 2, fps: 8 },
  sleep: { src: "/sprites/mochi/sleep.png", cols: 2, rows: 2, fps: 2.2 },
  eat: { src: "/sprites/mochi/eat.png", cols: 2, rows: 2, fps: 5 },
  play: { src: "/sprites/mochi/play.png", cols: 2, rows: 2, fps: 7 },
};

export const PROP_SRC = {
  fish: "/sprites/mochi/fish.png",
  yarn: "/sprites/mochi/yarn.png",
  portrait: "/sprites/mochi/portrait.png",
  roomDay: "/rooms/day.jpg",
  roomNight: "/rooms/night.jpg",
};

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export async function loadAtlas() {
  const entries = await Promise.all(
    (Object.keys(SHEETS) as Array<Exclude<PetAnim, "held">>).map(async (key) => {
      const img = await loadImage(SHEETS[key].src);
      return [key, img] as const;
    }),
  );
  const sheets = Object.fromEntries(entries) as Record<Exclude<PetAnim, "held">, HTMLImageElement>;
  const [yarn, fish] = await Promise.all([loadImage(PROP_SRC.yarn), loadImage(PROP_SRC.fish)]);
  return { sheets, yarn, fish };
}

export function frameIndex(anim: Exclude<PetAnim, "held">, time: number) {
  const sheet = SHEETS[anim];
  const count = sheet.cols * sheet.rows;
  return Math.floor(time * sheet.fps) % count;
}
