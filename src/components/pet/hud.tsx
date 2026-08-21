import type { ReactNode } from "react";
import { Moon, PawPrint, Sun, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROP_SRC } from "@/lib/pet/sprites";
import { usePetStore } from "@/lib/pet/store";
import { cn } from "@/lib/utils";

function Meter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "accent" | "sage" | "wood";
}) {
  const fill = {
    accent: "bg-accent",
    sage: "bg-sage",
    wood: "bg-wood",
  }[tone];

  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span className="font-display text-xs tabular-nums text-ink">{Math.round(value)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-paper-deep">
        <div
          className={cn("h-full rounded-full transition-[width] duration-300 ease-out", fill)}
          style={{ width: `${Math.max(4, value)}%` }}
        />
      </div>
    </div>
  );
}

type HudProps = {
  onPet: () => void;
  onFeed: () => void;
  onPlay: () => void;
  onSleep: () => void;
  sleeping: boolean;
  isNight: boolean;
};

export function Hud({ onPet, onFeed, onPlay, onSleep, sleeping, isNight }: HudProps) {
  const name = usePetStore((s) => s.name);
  const hunger = usePetStore((s) => s.hunger);
  const mood = usePetStore((s) => s.mood);
  const energy = usePetStore((s) => s.energy);
  const bornAt = usePetStore((s) => s.bornAt);
  const muted = usePetStore((s) => s.muted);
  const lighting = usePetStore((s) => s.lighting);
  const setMuted = usePetStore((s) => s.setMuted);
  const setLighting = usePetStore((s) => s.setLighting);

  const days = bornAt ? Math.max(1, Math.floor((Date.now() - bornAt) / 86_400_000) + 1) : 1;

  function cycleLight() {
    const order = ["auto", "day", "night"] as const;
    const i = order.indexOf(lighting);
    setLighting(order[(i + 1) % order.length]);
  }

  return (
    <>
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 sm:p-5">
        <div className="pointer-events-auto rounded-lg bg-surface/90 px-3.5 py-2.5 shadow-soft ring-1 ring-border backdrop-blur-sm">
          <p className="font-display text-lg font-semibold leading-tight tracking-tight text-ink">{name}</p>
          <p className="text-xs text-muted">一起的第 {days} 天</p>
        </div>

        <div className="pointer-events-auto w-40 space-y-2 rounded-lg bg-surface/90 px-3 py-2.5 shadow-soft ring-1 ring-border backdrop-blur-sm sm:w-48">
          <Meter label="饥饿" value={hunger} tone="accent" />
          <Meter label="心情" value={mood} tone="sage" />
          <Meter label="精力" value={energy} tone="wood" />
        </div>
      </header>

      <div className="pointer-events-none absolute right-3 top-auto bottom-24 z-20 flex flex-col gap-2 sm:top-1/2 sm:bottom-auto sm:right-5 sm:-translate-y-1/2">
        <Button
          variant="quiet"
          size="icon"
          className="pointer-events-auto bg-surface/90"
          aria-label={muted ? "打开声音" : "静音"}
          onClick={() => setMuted(!muted)}
        >
          {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </Button>
        <Button
          variant="quiet"
          size="icon"
          className="pointer-events-auto bg-surface/90"
          aria-label="切换日夜"
          onClick={cycleLight}
        >
          {isNight ? <Moon className="size-5" /> : <Sun className="size-5" />}
        </Button>
      </div>

      <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5">
        <div className="pointer-events-auto grid w-full max-w-md grid-cols-4 gap-1.5 rounded-xl bg-surface/95 p-2 shadow-soft ring-1 ring-border backdrop-blur-sm sm:gap-2 sm:p-2.5">
          <Action onClick={onPet} label="摸摸">
            <PawPrint className="size-5" />
          </Action>
          <Action onClick={onFeed} label="喂食">
            <img src={PROP_SRC.fish} alt="" className="size-7 object-contain" />
          </Action>
          <Action onClick={onPlay} label="玩耍">
            <img src={PROP_SRC.yarn} alt="" className="size-7 object-contain" />
          </Action>
          <Action onClick={onSleep} label={sleeping ? "叫醒" : "睡觉"}>
            <Moon className="size-5" />
          </Action>
        </div>
      </nav>
    </>
  );
}

function Action({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-ink transition-[background-color,transform] duration-150 hover:bg-paper-deep active:scale-[0.96]"
    >
      {children}
      <span className="text-[11px] font-medium text-muted">{label}</span>
    </button>
  );
}
