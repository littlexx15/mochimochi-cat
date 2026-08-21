export type PetAnim = "idle" | "walk" | "sleep" | "eat" | "play" | "held";

export type Lighting = "auto" | "day" | "night";

export type PetSave = {
  version: 1;
  name: string;
  hunger: number;
  mood: number;
  energy: number;
  bornAt: number;
  lastTick: number;
  muted: boolean;
  lighting: Lighting;
  careCount: number;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  kind: "heart" | "dust" | "puff";
  size: number;
};

export type YarnBall = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  airborne: boolean;
};

export type World = {
  x: number;
  y: number;
  facing: 1 | -1;
  anim: PetAnim;
  animTime: number;
  targetX: number | null;
  targetY: number | null;
  stateTime: number;
  nextThink: number;
  held: boolean;
  dragDx: number;
  dragDy: number;
  yarn: YarnBall | null;
  particles: Particle[];
  speech: string | null;
  speechUntil: number;
  squashX: number;
  squashY: number;
  chasing: boolean;
};
