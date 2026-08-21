import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { petAudio } from "@/lib/pet/audio";
import { PROP_SRC } from "@/lib/pet/sprites";
import { usePetStore } from "@/lib/pet/store";

export function Welcome() {
  const adopt = usePetStore((s) => s.adopt);
  const [name, setName] = useState("麻糬");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    petAudio.unlock();
    petAudio.meow();
    adopt(name);
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-paper px-5 py-10">
      <img
        src={PROP_SRC.roomDay}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-paper/55" />

      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-md rounded-xl bg-surface/95 p-6 shadow-soft ring-1 ring-border sm:p-8"
      >
        <p className="font-display text-sm tracking-wide text-muted">窗边</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          一只想被领养的小猫
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          它会在房间里散步、打盹、追毛线球。点地板叫它过来，拖起来也能抱一抱。
        </p>

        <img
          src={PROP_SRC.portrait}
          alt="待领养的奶油色小猫"
          className="mx-auto mt-6 size-40 object-contain sm:size-48"
        />

        <label className="mt-4 block text-sm font-medium text-ink" htmlFor="pet-name">
          给它起个名字
        </label>
        <input
          id="pet-name"
          value={name}
          maxLength={12}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 h-12 w-full rounded-md border border-border bg-paper px-3 text-base text-ink outline-none ring-accent/40 placeholder:text-muted focus:ring-2"
          placeholder="麻糬"
          autoComplete="off"
        />

        <Button type="submit" size="lg" className="mt-5 w-full">
          开始一起生活
        </Button>
      </form>
    </main>
  );
}
