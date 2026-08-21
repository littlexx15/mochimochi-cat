type Tone = {
  freq: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  slide?: number;
};

export class PetAudio {
  private ctx: AudioContext | null = null;
  muted = false;

  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
    }
    void this.ctx.resume();
  }

  private tone({ freq, dur, type = "sine", gain = 0.08, slide }: Tone) {
    if (this.muted || !this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  meow() {
    this.unlock();
    this.tone({ freq: 740, dur: 0.16, type: "triangle", gain: 0.07, slide: 420 });
    this.tone({ freq: 980, dur: 0.09, type: "sine", gain: 0.03, slide: 520 });
  }

  purr() {
    this.unlock();
    this.tone({ freq: 90, dur: 0.28, type: "sawtooth", gain: 0.025 });
    this.tone({ freq: 140, dur: 0.22, type: "triangle", gain: 0.02 });
  }

  chomp() {
    this.unlock();
    this.tone({ freq: 220, dur: 0.07, type: "square", gain: 0.04, slide: 90 });
  }

  boing() {
    this.unlock();
    this.tone({ freq: 320, dur: 0.18, type: "sine", gain: 0.05, slide: 180 });
  }

  yawn() {
    this.unlock();
    this.tone({ freq: 360, dur: 0.32, type: "triangle", gain: 0.04, slide: 160 });
  }
}

export const petAudio = new PetAudio();
