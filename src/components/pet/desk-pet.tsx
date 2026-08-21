import { useCallback, useEffect, useRef, useState } from "react";
import { Hud } from "@/components/pet/hud";
import { Welcome } from "@/components/pet/welcome";
import { petAudio } from "@/lib/pet/audio";
import { frameIndex, loadAtlas, PROP_SRC, SHEET_CELL, SHEETS } from "@/lib/pet/sprites";
import { usePetStore } from "@/lib/pet/store";
import type { Particle, PetAnim, World } from "@/lib/pet/types";

const FLOOR = { x0: 0.08, x1: 0.92, y0: 0.64, y1: 0.9 };
const LINES = {
  hungry: ["肚子饿了…", "想吃小鱼。", "咕噜咕噜。"],
  tired: ["好困…", "眼皮抬不起来。", "想晒太阳睡一会儿。"],
  sad: ["陪我玩嘛。", "有点想你。", "毛线球呢？"],
  happy: ["呼噜呼噜。", "今天天气真好。", "再摸摸！"],
  eat: ["谢谢小鱼！", "好吃。", "还想再来一条。"],
  play: ["毛线球！", "抓住了！", "再丢一次！"],
  pet: ["嘿嘿。", "再多一会儿。", "那里好舒服。"],
  sleep: ["呼…", "不要吵我。"],
  wake: ["嗯？", "我醒了。"],
  come: ["来了来了。", "等我。"],
};

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function createWorld(): World {
  return {
    x: 0.52,
    y: 0.78,
    facing: 1,
    anim: "idle",
    animTime: 0,
    targetX: null,
    targetY: null,
    stateTime: 0,
    nextThink: 2.4,
    held: false,
    dragDx: 0,
    dragDy: 0,
    yarn: null,
    particles: [],
    speech: null,
    speechUntil: 0,
    squashX: 1,
    squashY: 1,
    chasing: false,
  };
}

function say(world: World, text: string, now: number, dur = 2.4) {
  world.speech = text;
  world.speechUntil = now + dur;
}

function burst(world: World, kind: Particle["kind"], x: number, y: number, n: number) {
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
    const spd = kind === "heart" ? 40 + Math.random() * 50 : 18 + Math.random() * 28;
    world.particles.push({
      x,
      y,
      vx: Math.cos(ang) * spd * (kind === "dust" ? 0.4 : 1) + (kind === "dust" ? (Math.random() - 0.5) * 30 : 0),
      vy: Math.sin(ang) * spd,
      life: 0,
      maxLife: kind === "heart" ? 1.1 : 0.55,
      kind,
      size: kind === "heart" ? 8 + Math.random() * 5 : 3 + Math.random() * 3,
    });
  }
}

function petSizeFor(w: number, h: number) {
  return clamp(Math.min(w, h) * 0.28, 132, 210);
}

export function DeskPet() {
  const hydrated = usePetStore((s) => s.hydrated);
  const name = usePetStore((s) => s.name);
  const lighting = usePetStore((s) => s.lighting);
  const muted = usePetStore((s) => s.muted);
  const hydrate = usePetStore((s) => s.hydrate);
  const flush = usePetStore((s) => s.flush);

  const [sleeping, setSleeping] = useState(false);
  const [clockHour, setClockHour] = useState(() => new Date().getHours());
  const [ready, setReady] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<World>(createWorld());
  const atlasRef = useRef<Awaited<ReturnType<typeof loadAtlas>> | null>(null);
  const pointerRef = useRef<{ id: number; x: number; y: number; down: boolean; dragging: boolean } | null>(
    null,
  );

  const isNight =
    lighting === "night" || (lighting === "auto" && (clockHour >= 19 || clockHour < 6));

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    petAudio.muted = muted;
  }, [muted]);

  useEffect(() => {
    const id = window.setInterval(() => setClockHour(new Date().getHours()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, [flush]);

  useEffect(() => {
    if (!name) return;
    let cancelled = false;
    loadAtlas()
      .then((atlas) => {
        if (cancelled) return;
        atlasRef.current = atlas;
        setReady(true);
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      cancelled = true;
    };
  }, [name]);

  const goTo = useCallback((nx: number, ny: number, chase = false) => {
    const w = worldRef.current;
    if (w.held || w.anim === "eat") return;
    w.targetX = clamp(nx, FLOOR.x0, FLOOR.x1);
    w.targetY = clamp(ny, FLOOR.y0, FLOOR.y1);
    w.chasing = chase;
    if (w.anim === "sleep") {
      w.anim = "idle";
      setSleeping(false);
      say(w, pick(LINES.wake), performance.now() / 1000);
    }
  }, []);

  const actionPet = useCallback(() => {
    const w = worldRef.current;
    const store = usePetStore.getState();
    petAudio.unlock();
    petAudio.purr();
    store.pet();
    w.anim = w.held ? "held" : "idle";
    w.stateTime = 0;
    say(w, pick(LINES.pet), performance.now() / 1000);
    burst(w, "heart", 0, 0, 5);
  }, []);

  const actionFeed = useCallback(() => {
    const w = worldRef.current;
    if (w.held) return;
    const store = usePetStore.getState();
    petAudio.unlock();
    petAudio.chomp();
    store.feed();
    w.anim = "eat";
    w.animTime = 0;
    w.stateTime = 0;
    w.targetX = null;
    w.targetY = null;
    w.chasing = false;
    say(w, pick(LINES.eat), performance.now() / 1000);
    setSleeping(false);
  }, []);

  const actionPlay = useCallback(() => {
    const w = worldRef.current;
    if (w.held) return;
    const store = usePetStore.getState();
    petAudio.unlock();
    petAudio.boing();
    store.play();
    const dir = Math.random() < 0.5 ? -1 : 1;
    w.yarn = {
      x: clamp(w.x + dir * 0.18, FLOOR.x0, FLOOR.x1),
      y: w.y - 0.12,
      vx: dir * 0.35,
      vy: -0.55,
      airborne: true,
    };
    w.chasing = true;
    w.targetX = w.yarn.x;
    w.targetY = FLOOR.y0 + 0.12;
    w.anim = "walk";
    setSleeping(false);
    say(w, pick(LINES.play), performance.now() / 1000);
  }, []);

  const actionSleep = useCallback(() => {
    const w = worldRef.current;
    if (w.held) return;
    petAudio.unlock();
    if (w.anim === "sleep") {
      w.anim = "idle";
      w.stateTime = 0;
      setSleeping(false);
      say(w, pick(LINES.wake), performance.now() / 1000);
      petAudio.meow();
      return;
    }
    petAudio.yawn();
    w.anim = "sleep";
    w.animTime = 0;
    w.stateTime = 0;
    w.targetX = null;
    w.targetY = null;
    w.chasing = false;
    setSleeping(true);
    say(w, pick(LINES.sleep), performance.now() / 1000);
    usePetStore.getState().rest();
  }, []);

  useEffect(() => {
    if (!ready || !name) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let needAcc = 0;
    const reduced = prefersReducedMotion();
    const world = worldRef.current;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const loop = (nowMs: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((nowMs - last) / 1000, 0.1);
      last = nowMs;
      const now = nowMs / 1000;
      const rect = wrap.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const size = petSizeFor(W, H);
      const store = usePetStore.getState();

      needAcc += dt;
      if (needAcc >= 0.25) {
        store.tickNeeds(needAcc, world.anim === "sleep", world.anim === "walk");
        needAcc = 0;
      }

      world.stateTime += dt;
      world.animTime += dt;
      world.squashX += (1 - world.squashX) * (1 - Math.exp(-10 * dt));
      world.squashY += (1 - world.squashY) * (1 - Math.exp(-10 * dt));

      if (world.speech && now > world.speechUntil) world.speech = null;

      // yarn physics (normalized coords, vy in screen-ish units)
      if (world.yarn) {
        const y = world.yarn;
        if (y.airborne) {
          y.vy += 1.6 * dt;
          y.x += y.vx * dt;
          y.y += y.vy * dt;
          if (y.x < FLOOR.x0 || y.x > FLOOR.x1) {
            y.vx *= -0.6;
            y.x = clamp(y.x, FLOOR.x0, FLOOR.x1);
          }
          if (y.y >= world.y || y.y >= FLOOR.y1) {
            y.y = clamp(Math.max(world.y, FLOOR.y0 + 0.04), FLOOR.y0, FLOOR.y1);
            y.airborne = false;
            y.vx = 0;
            y.vy = 0;
            world.targetX = y.x;
            world.targetY = y.y;
            world.chasing = true;
          }
        }
      }

      if (!world.held && world.anim !== "eat" && world.anim !== "play" && world.anim !== "sleep") {
        if (world.targetX != null && world.targetY != null) {
          const dx = world.targetX - world.x;
          const dy = world.targetY - world.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.012) {
            world.x = world.targetX;
            world.y = world.targetY;
            world.targetX = null;
            world.targetY = null;
            if (world.chasing && world.yarn && !world.yarn.airborne) {
              world.anim = "play";
              world.animTime = 0;
              world.stateTime = 0;
              world.chasing = false;
              world.yarn = null;
              world.squashY = 1.12;
              world.squashX = 0.92;
              burst(world, "dust", 0, 0, 4);
              petAudio.boing();
            } else {
              world.anim = "idle";
              world.stateTime = 0;
              world.nextThink = 1.8 + Math.random() * 3;
              world.chasing = false;
            }
          } else {
            const speed = world.chasing ? 0.28 : 0.16;
            world.x += (dx / dist) * speed * dt;
            world.y += (dy / dist) * speed * dt;
            world.facing = dx >= 0 ? 1 : -1;
            world.anim = "walk";
            if (Math.random() < dt * 6) burst(world, "dust", 0, 0, 1);
          }
        } else if (!reduced && world.anim === "idle" && world.stateTime > world.nextThink) {
          world.stateTime = 0;
          if (store.energy < 22) {
            world.anim = "sleep";
            setSleeping(true);
            say(world, pick(LINES.tired), now);
          } else if (store.hunger < 28) {
            say(world, pick(LINES.hungry), now);
            world.nextThink = 4 + Math.random() * 3;
            petAudio.meow();
          } else if (store.mood < 28) {
            say(world, pick(LINES.sad), now);
            world.nextThink = 4 + Math.random() * 3;
          } else if (Math.random() < 0.55) {
            world.targetX = FLOOR.x0 + Math.random() * (FLOOR.x1 - FLOOR.x0);
            world.targetY = FLOOR.y0 + Math.random() * (FLOOR.y1 - FLOOR.y0);
          } else {
            if (Math.random() < 0.4) say(world, pick(LINES.happy), now);
            world.nextThink = 2.5 + Math.random() * 4;
          }
        }
      }

      if (world.anim === "eat" && world.stateTime > 2.6) {
        world.anim = "idle";
        world.stateTime = 0;
        world.nextThink = 2;
      }
      if (world.anim === "play" && world.stateTime > 2.2) {
        world.anim = "idle";
        world.stateTime = 0;
        world.nextThink = 1.6;
      }

      // particles in pixel space relative to pet later; store as offsets from pet
      for (const p of world.particles) {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.kind === "heart") p.vy -= 20 * dt;
        else p.vy += 40 * dt;
      }
      world.particles = world.particles.filter((p) => p.life < p.maxLife);

      // draw
      ctx.clearRect(0, 0, W, H);
      const atlas = atlasRef.current;
      if (!atlas) return;

      const px = world.x * W;
      const py = world.y * H;

      if (world.yarn) {
        const yx = world.yarn.x * W;
        const yy = world.yarn.y * H;
        const ys = size * 0.28;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(yx, yy + ys * 0.28, ys * 0.28, ys * 0.1, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(44,36,28,0.18)";
        ctx.fill();
        ctx.drawImage(atlas.yarn, yx - ys / 2, yy - ys / 2, ys, ys);
        ctx.restore();
      }

      // pet shadow
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(px, py + 4, size * 0.28 * world.squashX, size * 0.07, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(44,36,28,0.22)";
      ctx.fill();
      ctx.restore();

      const animKey: Exclude<PetAnim, "held"> =
        world.anim === "held" ? "idle" : world.anim;
      const sheet = atlas.sheets[animKey];
      const fi = frameIndex(animKey, world.animTime);
      const cols = SHEETS[animKey].cols;
      const sx = (fi % cols) * SHEET_CELL;
      const sy = Math.floor(fi / cols) * SHEET_CELL;

      ctx.save();
      ctx.translate(px, py);
      ctx.scale(world.facing * world.squashX, world.squashY);
      if (world.held) ctx.rotate(-0.12);
      ctx.drawImage(
        sheet,
        sx,
        sy,
        SHEET_CELL,
        SHEET_CELL,
        -size / 2,
        -size + 8,
        size,
        size,
      );
      ctx.restore();

      for (const p of world.particles) {
        const alpha = 1 - p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(px + p.x, py - size * 0.55 + p.y);
        if (p.kind === "heart") {
          ctx.fillStyle = "#c45c3a";
          ctx.beginPath();
          const s = p.size;
          ctx.moveTo(0, s * 0.3);
          ctx.bezierCurveTo(-s, -s * 0.35, -s * 0.35, -s, 0, -s * 0.4);
          ctx.bezierCurveTo(s * 0.35, -s, s, -s * 0.35, 0, s * 0.3);
          ctx.fill();
        } else {
          ctx.fillStyle = "rgba(196,165,116,0.7)";
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // speech
      if (world.speech) {
        ctx.save();
        const text = world.speech;
        ctx.font = "600 14px 'Noto Sans SC', sans-serif";
        const padX = 12;
        const tw = ctx.measureText(text).width;
        const bw = tw + padX * 2;
        const bh = 32;
        const bx = px - bw / 2;
        const by = py - size - 10;
        ctx.fillStyle = "rgba(250,246,239,0.96)";
        ctx.strokeStyle = "rgba(217,207,192,0.9)";
        ctx.lineWidth = 1;
        roundRect(ctx, bx, by, bw, bh, 12);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px - 6, by + bh);
        ctx.lineTo(px, by + bh + 7);
        ctx.lineTo(px + 6, by + bh);
        ctx.fill();
        ctx.fillStyle = "#2c241c";
        ctx.fillText(text, bx + padX, by + 21);
        ctx.restore();
      }
    };

    raf = requestAnimationFrame(loop);

    const hitPet = (cx: number, cy: number) => {
      const size = petSizeFor(W(), H());
      const px = world.x * W();
      const py = world.y * H();
      return cx >= px - size * 0.42 && cx <= px + size * 0.42 && cy >= py - size * 0.95 && cy <= py + 8;
    };
    const W = () => wrap.getBoundingClientRect().width;
    const H = () => wrap.getBoundingClientRect().height;
    const local = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      petAudio.unlock();
      const { x, y } = local(e);
      pointerRef.current = { id: e.pointerId, x, y, down: true, dragging: false };
      canvas.setPointerCapture(e.pointerId);
      if (hitPet(x, y)) {
        world.dragDx = x - world.x * W();
        world.dragDy = y - world.y * H();
      }
    };

    const onMove = (e: PointerEvent) => {
      const p = pointerRef.current;
      if (!p || p.id !== e.pointerId || !p.down) return;
      const { x, y } = local(e);
      const hit = hitPet(p.x, p.y);
      if (!p.dragging && hit && Math.hypot(x - p.x, y - p.y) > 8) {
        p.dragging = true;
        world.held = true;
        world.anim = "held";
        world.targetX = null;
        world.targetY = null;
        world.squashX = 0.92;
        world.squashY = 1.08;
      }
      if (p.dragging) {
        const nx = (x - world.dragDx) / W();
        const ny = (y - world.dragDy) / H();
        world.facing = x > p.x ? 1 : x < p.x ? -1 : world.facing;
        world.x = clamp(nx, 0.04, 0.96);
        world.y = clamp(ny, 0.2, 0.95);
      }
      p.x = x;
      p.y = y;
    };

    const onUp = (e: PointerEvent) => {
      const p = pointerRef.current;
      if (!p || p.id !== e.pointerId) return;
      const { x, y } = local(e);
      canvas.releasePointerCapture(e.pointerId);
      if (p.dragging) {
        world.held = false;
        world.y = clamp(world.y, FLOOR.y0, FLOOR.y1);
        world.x = clamp(world.x, FLOOR.x0, FLOOR.x1);
        world.anim = "idle";
        world.squashY = 0.86;
        world.squashX = 1.12;
        burst(world, "dust", 0, 0, 5);
        petAudio.boing();
      } else if (hitPet(x, y)) {
        actionPet();
      } else {
        const nx = x / W();
        const ny = y / H();
        if (ny > FLOOR.y0 - 0.08) {
          goTo(nx, clamp(ny, FLOOR.y0, FLOOR.y1));
          say(world, pick(LINES.come), performance.now() / 1000, 1.6);
        }
      }
      pointerRef.current = null;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [ready, name, actionPet, goTo]);

  if (!hydrated) {
    return <div className="min-h-dvh bg-paper" />;
  }

  if (!name) {
    return <Welcome />;
  }

  return (
    <main ref={wrapRef} className="relative h-dvh w-full overflow-hidden bg-night">
      <img
        src={PROP_SRC.roomDay}
        alt=""
        className="absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out"
        style={{ opacity: isNight ? 0 : 1 }}
      />
      <img
        src={PROP_SRC.roomNight}
        alt=""
        className="absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out"
        style={{ opacity: isNight ? 1 : 0 }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 size-full touch-none"
        style={{ touchAction: "none" }}
      />
      <Hud
        onPet={actionPet}
        onFeed={actionFeed}
        onPlay={actionPlay}
        onSleep={actionSleep}
        sleeping={sleeping}
        isNight={isNight}
      />
      {!ready && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-paper/40 text-sm text-ink">
          小猫正在跳上窗台…
        </div>
      )}
    </main>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
