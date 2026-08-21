import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as PawPrint, i as Sun, n as Volume2, o as Moon, t as VolumeX } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-3f1h8ahd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium select-none transition-[opacity,transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			solid: "bg-accent text-accent-fg shadow-soft hover:opacity-90",
			quiet: "bg-surface text-ink border border-border hover:bg-paper-deep",
			ghost: "bg-transparent text-ink hover:bg-paper-deep/80",
			wood: "bg-wood text-ink hover:opacity-90"
		},
		size: {
			sm: "h-9 px-3 text-sm rounded-sm",
			md: "h-11 px-4 text-sm rounded-md",
			lg: "h-12 px-5 text-base rounded-lg",
			icon: "size-11 rounded-md"
		}
	},
	defaultVariants: {
		variant: "solid",
		size: "md"
	}
});
function Button({ className, variant, size, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
var SHEETS = {
	idle: {
		src: "/sprites/mochi/idle.png",
		cols: 2,
		rows: 2,
		fps: 3.2
	},
	walk: {
		src: "/sprites/mochi/walk.png",
		cols: 2,
		rows: 2,
		fps: 8
	},
	sleep: {
		src: "/sprites/mochi/sleep.png",
		cols: 2,
		rows: 2,
		fps: 2.2
	},
	eat: {
		src: "/sprites/mochi/eat.png",
		cols: 2,
		rows: 2,
		fps: 5
	},
	play: {
		src: "/sprites/mochi/play.png",
		cols: 2,
		rows: 2,
		fps: 7
	}
};
var PROP_SRC = {
	fish: "/sprites/mochi/fish.png",
	yarn: "/sprites/mochi/yarn.png",
	portrait: "/sprites/mochi/portrait.png",
	roomDay: "/rooms/day.jpg",
	roomNight: "/rooms/night.jpg"
};
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error(`Failed to load ${src}`));
		img.src = src;
	});
}
async function loadAtlas() {
	const entries = await Promise.all(Object.keys(SHEETS).map(async (key) => {
		return [key, await loadImage(SHEETS[key].src)];
	}));
	const sheets = Object.fromEntries(entries);
	const [yarn, fish] = await Promise.all([loadImage(PROP_SRC.yarn), loadImage(PROP_SRC.fish)]);
	return {
		sheets,
		yarn,
		fish
	};
}
function frameIndex(anim, time) {
	const sheet = SHEETS[anim];
	const count = sheet.cols * sheet.rows;
	return Math.floor(time * sheet.fps) % count;
}
var SAVE_KEY = "mochi-desk-v1";
var DEFAULT_SAVE = {
	version: 1,
	name: "",
	hunger: 78,
	mood: 82,
	energy: 70,
	bornAt: 0,
	lastTick: 0,
	muted: false,
	lighting: "auto",
	careCount: 0
};
function clamp$2(n, min = 0, max = 100) {
	return Math.max(min, Math.min(max, n));
}
function migrate(raw) {
	if (!raw || typeof raw !== "object") return { ...DEFAULT_SAVE };
	const s = raw;
	return {
		version: 1,
		name: typeof s.name === "string" ? s.name.slice(0, 12) : "",
		hunger: clamp$2(Number(s.hunger ?? DEFAULT_SAVE.hunger)),
		mood: clamp$2(Number(s.mood ?? DEFAULT_SAVE.mood)),
		energy: clamp$2(Number(s.energy ?? DEFAULT_SAVE.energy)),
		bornAt: Number(s.bornAt ?? 0) || 0,
		lastTick: Number(s.lastTick ?? 0) || 0,
		muted: Boolean(s.muted),
		lighting: [
			"auto",
			"day",
			"night"
		].includes(s.lighting) ? s.lighting : "auto",
		careCount: Math.max(0, Number(s.careCount ?? 0) || 0)
	};
}
function loadSave() {
	try {
		const raw = localStorage.getItem(SAVE_KEY);
		if (!raw) return { ...DEFAULT_SAVE };
		return migrate(JSON.parse(raw));
	} catch {
		return { ...DEFAULT_SAVE };
	}
}
function writeSave(save) {
	try {
		localStorage.setItem(SAVE_KEY, JSON.stringify(save));
	} catch {}
}
/** Apply offline decay, capped so a long absence is sad — not empty. */
function applyOfflineDecay(save, now) {
	if (!save.lastTick || !save.name) return save;
	const elapsed = Math.max(0, (now - save.lastTick) / 1e3);
	const hours = Math.min(elapsed / 3600, 8);
	return {
		...save,
		hunger: clamp$2(save.hunger - hours * 8),
		mood: clamp$2(save.mood - hours * 6),
		energy: clamp$2(save.energy - hours * 4),
		lastTick: now
	};
}
function clamp$1(n, min = 0, max = 100) {
	return Math.max(min, Math.min(max, n));
}
var writeTimer = null;
var pending = null;
function snapshot(partial = {}) {
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
		...partial
	};
}
function persist(partial = {}) {
	pending = snapshot(partial);
	if (writeTimer) return;
	writeTimer = setTimeout(() => {
		if (pending) writeSave(pending);
		pending = null;
		writeTimer = null;
	}, 2e3);
}
var usePetStore = create((set, get) => ({
	...DEFAULT_SAVE,
	hydrated: false,
	hydrate: () => {
		if (get().hydrated) return;
		const now = Date.now();
		const loaded = applyOfflineDecay(loadSave(), now);
		set({
			...loaded,
			hydrated: true
		});
		if (loaded.name) writeSave({
			...loaded,
			lastTick: now
		});
	},
	adopt: (name) => {
		const now = Date.now();
		const trimmed = name.trim().slice(0, 12) || "麻糬";
		const next = {
			...DEFAULT_SAVE,
			name: trimmed,
			bornAt: now,
			lastTick: now
		};
		set({
			...next,
			hydrated: true
		});
		writeSave(next);
	},
	tickNeeds: (dt, sleeping, walking) => {
		const s = get();
		if (!s.name) return;
		const hunger = clamp$1(s.hunger - dt * .11);
		const mood = clamp$1(s.mood - dt * (walking ? .04 : .07));
		const energy = sleeping ? clamp$1(s.energy + dt * 4.2) : clamp$1(s.energy - dt * (walking ? .16 : .07));
		set({
			hunger,
			mood,
			energy,
			lastTick: Date.now()
		});
		persist({
			hunger,
			mood,
			energy,
			lastTick: Date.now()
		});
	},
	feed: () => {
		const hunger = clamp$1(get().hunger + 28);
		const mood = clamp$1(get().mood + 6);
		const careCount = get().careCount + 1;
		set({
			hunger,
			mood,
			careCount
		});
		persist({
			hunger,
			mood,
			careCount
		});
	},
	play: () => {
		const mood = clamp$1(get().mood + 18);
		const energy = clamp$1(get().energy - 10);
		const hunger = clamp$1(get().hunger - 4);
		const careCount = get().careCount + 1;
		set({
			mood,
			energy,
			hunger,
			careCount
		});
		persist({
			mood,
			energy,
			hunger,
			careCount
		});
	},
	rest: () => {
		persist({ energy: get().energy });
	},
	pet: () => {
		const mood = clamp$1(get().mood + 10);
		const careCount = get().careCount + 1;
		set({
			mood,
			careCount
		});
		persist({
			mood,
			careCount
		});
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
			careCount: s.careCount
		});
	}
}));
function Meter({ label, value, tone }) {
	const fill = {
		accent: "bg-accent",
		sage: "bg-sage",
		wood: "bg-wood"
	}[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex items-baseline justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-medium text-muted",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-display text-xs tabular-nums text-ink",
				children: Math.round(value)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-1.5 overflow-hidden rounded-full bg-paper-deep",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("h-full rounded-full transition-[width] duration-300 ease-out", fill),
				style: { width: `${Math.max(4, value)}%` }
			})
		})]
	});
}
function Hud({ onPet, onFeed, onPlay, onSleep, sleeping, isNight }) {
	const name = usePetStore((s) => s.name);
	const hunger = usePetStore((s) => s.hunger);
	const mood = usePetStore((s) => s.mood);
	const energy = usePetStore((s) => s.energy);
	const bornAt = usePetStore((s) => s.bornAt);
	const muted = usePetStore((s) => s.muted);
	const lighting = usePetStore((s) => s.lighting);
	const setMuted = usePetStore((s) => s.setMuted);
	const setLighting = usePetStore((s) => s.setLighting);
	const days = bornAt ? Math.max(1, Math.floor((Date.now() - bornAt) / 864e5) + 1) : 1;
	function cycleLight() {
		const order = [
			"auto",
			"day",
			"night"
		];
		const i = order.indexOf(lighting);
		setLighting(order[(i + 1) % order.length]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 sm:p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto rounded-lg bg-surface/90 px-3.5 py-2.5 shadow-soft ring-1 ring-border backdrop-blur-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg font-semibold leading-tight tracking-tight text-ink",
					children: name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						"一起的第 ",
						days,
						" 天"
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto w-40 space-y-2 rounded-lg bg-surface/90 px-3 py-2.5 shadow-soft ring-1 ring-border backdrop-blur-sm sm:w-48",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						label: "饥饿",
						value: hunger,
						tone: "accent"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						label: "心情",
						value: mood,
						tone: "sage"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						label: "精力",
						value: energy,
						tone: "wood"
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute right-3 top-auto bottom-24 z-20 flex flex-col gap-2 sm:top-1/2 sm:bottom-auto sm:right-5 sm:-translate-y-1/2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "quiet",
				size: "icon",
				className: "pointer-events-auto bg-surface/90",
				"aria-label": muted ? "打开声音" : "静音",
				onClick: () => setMuted(!muted),
				children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "quiet",
				size: "icon",
				className: "pointer-events-auto bg-surface/90",
				"aria-label": "切换日夜",
				onClick: cycleLight,
				children: isNight ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-5" })
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto grid w-full max-w-md grid-cols-4 gap-1.5 rounded-xl bg-surface/95 p-2 shadow-soft ring-1 ring-border backdrop-blur-sm sm:gap-2 sm:p-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
						onClick: onPet,
						label: "摸摸",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PawPrint, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
						onClick: onFeed,
						label: "喂食",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: PROP_SRC.fish,
							alt: "",
							className: "size-7 object-contain"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
						onClick: onPlay,
						label: "玩耍",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: PROP_SRC.yarn,
							alt: "",
							className: "size-7 object-contain"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
						onClick: onSleep,
						label: sleeping ? "叫醒" : "睡觉",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-5" })
					})
				]
			})
		})
	] });
}
function Action({ onClick, label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-ink transition-[background-color,transform] duration-150 hover:bg-paper-deep active:scale-[0.96]",
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] font-medium text-muted",
			children: label
		})]
	});
}
var PetAudio = class {
	ctx = null;
	muted = false;
	unlock() {
		if (!this.ctx) {
			const Ctx = window.AudioContext || window.webkitAudioContext;
			if (!Ctx) return;
			this.ctx = new Ctx();
		}
		this.ctx.resume();
	}
	tone({ freq, dur, type = "sine", gain = .08, slide }) {
		if (this.muted || !this.ctx || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const g = this.ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, t);
		if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);
		g.gain.setValueAtTime(gain, t);
		g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
		osc.connect(g);
		g.connect(this.ctx.destination);
		osc.start(t);
		osc.stop(t + dur + .02);
	}
	meow() {
		this.unlock();
		this.tone({
			freq: 740,
			dur: .16,
			type: "triangle",
			gain: .07,
			slide: 420
		});
		this.tone({
			freq: 980,
			dur: .09,
			type: "sine",
			gain: .03,
			slide: 520
		});
	}
	purr() {
		this.unlock();
		this.tone({
			freq: 90,
			dur: .28,
			type: "sawtooth",
			gain: .025
		});
		this.tone({
			freq: 140,
			dur: .22,
			type: "triangle",
			gain: .02
		});
	}
	chomp() {
		this.unlock();
		this.tone({
			freq: 220,
			dur: .07,
			type: "square",
			gain: .04,
			slide: 90
		});
	}
	boing() {
		this.unlock();
		this.tone({
			freq: 320,
			dur: .18,
			type: "sine",
			gain: .05,
			slide: 180
		});
	}
	yawn() {
		this.unlock();
		this.tone({
			freq: 360,
			dur: .32,
			type: "triangle",
			gain: .04,
			slide: 160
		});
	}
};
var petAudio = new PetAudio();
function Welcome() {
	const adopt = usePetStore((s) => s.adopt);
	const [name, setName] = (0, import_react.useState)("麻糬");
	function onSubmit(e) {
		e.preventDefault();
		petAudio.unlock();
		petAudio.meow();
		adopt(name);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex min-h-dvh items-center justify-center overflow-hidden bg-paper px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: PROP_SRC.roomDay,
				alt: "",
				className: "pointer-events-none absolute inset-0 size-full object-cover opacity-40"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-paper/55" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "relative w-full max-w-md rounded-xl bg-surface/95 p-6 shadow-soft ring-1 ring-border sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-sm tracking-wide text-muted",
						children: "窗边"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl",
						children: "一只想被领养的小猫"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-relaxed text-muted",
						children: "它会在房间里散步、打盹、追毛线球。点地板叫它过来，拖起来也能抱一抱。"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: PROP_SRC.portrait,
						alt: "待领养的奶油色小猫",
						className: "mx-auto mt-6 size-40 object-contain sm:size-48"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-4 block text-sm font-medium text-ink",
						htmlFor: "pet-name",
						children: "给它起个名字"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "pet-name",
						value: name,
						maxLength: 12,
						onChange: (e) => setName(e.target.value),
						className: "mt-2 h-12 w-full rounded-md border border-border bg-paper px-3 text-base text-ink outline-none ring-accent/40 placeholder:text-muted focus:ring-2",
						placeholder: "麻糬",
						autoComplete: "off"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "lg",
						className: "mt-5 w-full",
						children: "开始一起生活"
					})
				]
			})
		]
	});
}
var FLOOR = {
	x0: .08,
	x1: .92,
	y0: .64,
	y1: .9
};
var LINES = {
	hungry: [
		"肚子饿了…",
		"想吃小鱼。",
		"咕噜咕噜。"
	],
	tired: [
		"好困…",
		"眼皮抬不起来。",
		"想晒太阳睡一会儿。"
	],
	sad: [
		"陪我玩嘛。",
		"有点想你。",
		"毛线球呢？"
	],
	happy: [
		"呼噜呼噜。",
		"今天天气真好。",
		"再摸摸！"
	],
	eat: [
		"谢谢小鱼！",
		"好吃。",
		"还想再来一条。"
	],
	play: [
		"毛线球！",
		"抓住了！",
		"再丢一次！"
	],
	pet: [
		"嘿嘿。",
		"再多一会儿。",
		"那里好舒服。"
	],
	sleep: ["呼…", "不要吵我。"],
	wake: ["嗯？", "我醒了。"],
	come: ["来了来了。", "等我。"]
};
function pick(list) {
	return list[Math.floor(Math.random() * list.length)];
}
function clamp(n, a, b) {
	return Math.max(a, Math.min(b, n));
}
function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function createWorld() {
	return {
		x: .52,
		y: .78,
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
		chasing: false
	};
}
function say(world, text, now, dur = 2.4) {
	world.speech = text;
	world.speechUntil = now + dur;
}
function burst(world, kind, x, y, n) {
	for (let i = 0; i < n; i++) {
		const ang = -Math.PI / 2 + (Math.random() - .5) * 1.2;
		const spd = kind === "heart" ? 40 + Math.random() * 50 : 18 + Math.random() * 28;
		world.particles.push({
			x,
			y,
			vx: Math.cos(ang) * spd * (kind === "dust" ? .4 : 1) + (kind === "dust" ? (Math.random() - .5) * 30 : 0),
			vy: Math.sin(ang) * spd,
			life: 0,
			maxLife: kind === "heart" ? 1.1 : .55,
			kind,
			size: kind === "heart" ? 8 + Math.random() * 5 : 3 + Math.random() * 3
		});
	}
}
function petSizeFor(w, h) {
	return clamp(Math.min(w, h) * .28, 132, 210);
}
function DeskPet() {
	const hydrated = usePetStore((s) => s.hydrated);
	const name = usePetStore((s) => s.name);
	const lighting = usePetStore((s) => s.lighting);
	const muted = usePetStore((s) => s.muted);
	const hydrate = usePetStore((s) => s.hydrate);
	const flush = usePetStore((s) => s.flush);
	const [sleeping, setSleeping] = (0, import_react.useState)(false);
	const [clockHour, setClockHour] = (0, import_react.useState)(() => (/* @__PURE__ */ new Date()).getHours());
	const [ready, setReady] = (0, import_react.useState)(false);
	const wrapRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const worldRef = (0, import_react.useRef)(createWorld());
	const atlasRef = (0, import_react.useRef)(null);
	const pointerRef = (0, import_react.useRef)(null);
	const isNight = lighting === "night" || lighting === "auto" && (clockHour >= 19 || clockHour < 6);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	(0, import_react.useEffect)(() => {
		petAudio.muted = muted;
	}, [muted]);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setClockHour((/* @__PURE__ */ new Date()).getHours()), 6e4);
		return () => window.clearInterval(id);
	}, []);
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		if (!name) return;
		let cancelled = false;
		loadAtlas().then((atlas) => {
			if (cancelled) return;
			atlasRef.current = atlas;
			setReady(true);
		}).catch((err) => {
			console.error(err);
		});
		return () => {
			cancelled = true;
		};
	}, [name]);
	const goTo = (0, import_react.useCallback)((nx, ny, chase = false) => {
		const w = worldRef.current;
		if (w.held || w.anim === "eat") return;
		w.targetX = clamp(nx, FLOOR.x0, FLOOR.x1);
		w.targetY = clamp(ny, FLOOR.y0, FLOOR.y1);
		w.chasing = chase;
		if (w.anim === "sleep") {
			w.anim = "idle";
			setSleeping(false);
			say(w, pick(LINES.wake), performance.now() / 1e3);
		}
	}, []);
	const actionPet = (0, import_react.useCallback)(() => {
		const w = worldRef.current;
		const store = usePetStore.getState();
		petAudio.unlock();
		petAudio.purr();
		store.pet();
		w.anim = w.held ? "held" : "idle";
		w.stateTime = 0;
		say(w, pick(LINES.pet), performance.now() / 1e3);
		burst(w, "heart", 0, 0, 5);
	}, []);
	const actionFeed = (0, import_react.useCallback)(() => {
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
		say(w, pick(LINES.eat), performance.now() / 1e3);
		setSleeping(false);
	}, []);
	const actionPlay = (0, import_react.useCallback)(() => {
		const w = worldRef.current;
		if (w.held) return;
		const store = usePetStore.getState();
		petAudio.unlock();
		petAudio.boing();
		store.play();
		const dir = Math.random() < .5 ? -1 : 1;
		w.yarn = {
			x: clamp(w.x + dir * .18, FLOOR.x0, FLOOR.x1),
			y: w.y - .12,
			vx: dir * .35,
			vy: -.55,
			airborne: true
		};
		w.chasing = true;
		w.targetX = w.yarn.x;
		w.targetY = FLOOR.y0 + .12;
		w.anim = "walk";
		setSleeping(false);
		say(w, pick(LINES.play), performance.now() / 1e3);
	}, []);
	const actionSleep = (0, import_react.useCallback)(() => {
		const w = worldRef.current;
		if (w.held) return;
		petAudio.unlock();
		if (w.anim === "sleep") {
			w.anim = "idle";
			w.stateTime = 0;
			setSleeping(false);
			say(w, pick(LINES.wake), performance.now() / 1e3);
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
		say(w, pick(LINES.sleep), performance.now() / 1e3);
		usePetStore.getState().rest();
	}, []);
	(0, import_react.useEffect)(() => {
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
		const loop = (nowMs) => {
			raf = requestAnimationFrame(loop);
			const dt = Math.min((nowMs - last) / 1e3, .1);
			last = nowMs;
			const now = nowMs / 1e3;
			const rect = wrap.getBoundingClientRect();
			const W = rect.width;
			const H = rect.height;
			const size = petSizeFor(W, H);
			const store = usePetStore.getState();
			needAcc += dt;
			if (needAcc >= .25) {
				store.tickNeeds(needAcc, world.anim === "sleep", world.anim === "walk");
				needAcc = 0;
			}
			world.stateTime += dt;
			world.animTime += dt;
			world.squashX += (1 - world.squashX) * (1 - Math.exp(-10 * dt));
			world.squashY += (1 - world.squashY) * (1 - Math.exp(-10 * dt));
			if (world.speech && now > world.speechUntil) world.speech = null;
			if (world.yarn) {
				const y = world.yarn;
				if (y.airborne) {
					y.vy += 1.6 * dt;
					y.x += y.vx * dt;
					y.y += y.vy * dt;
					if (y.x < FLOOR.x0 || y.x > FLOOR.x1) {
						y.vx *= -.6;
						y.x = clamp(y.x, FLOOR.x0, FLOOR.x1);
					}
					if (y.y >= world.y || y.y >= FLOOR.y1) {
						y.y = clamp(Math.max(world.y, FLOOR.y0 + .04), FLOOR.y0, FLOOR.y1);
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
					if (dist < .012) {
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
							world.squashX = .92;
							burst(world, "dust", 0, 0, 4);
							petAudio.boing();
						} else {
							world.anim = "idle";
							world.stateTime = 0;
							world.nextThink = 1.8 + Math.random() * 3;
							world.chasing = false;
						}
					} else {
						const speed = world.chasing ? .28 : .16;
						world.x += dx / dist * speed * dt;
						world.y += dy / dist * speed * dt;
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
					} else if (Math.random() < .55) {
						world.targetX = FLOOR.x0 + Math.random() * (FLOOR.x1 - FLOOR.x0);
						world.targetY = FLOOR.y0 + Math.random() * (FLOOR.y1 - FLOOR.y0);
					} else {
						if (Math.random() < .4) say(world, pick(LINES.happy), now);
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
			for (const p of world.particles) {
				p.life += dt;
				p.x += p.vx * dt;
				p.y += p.vy * dt;
				if (p.kind === "heart") p.vy -= 20 * dt;
				else p.vy += 40 * dt;
			}
			world.particles = world.particles.filter((p) => p.life < p.maxLife);
			ctx.clearRect(0, 0, W, H);
			const atlas = atlasRef.current;
			if (!atlas) return;
			const px = world.x * W;
			const py = world.y * H;
			if (world.yarn) {
				const yx = world.yarn.x * W;
				const yy = world.yarn.y * H;
				const ys = size * .28;
				ctx.save();
				ctx.beginPath();
				ctx.ellipse(yx, yy + ys * .28, ys * .28, ys * .1, 0, 0, Math.PI * 2);
				ctx.fillStyle = "rgba(44,36,28,0.18)";
				ctx.fill();
				ctx.drawImage(atlas.yarn, yx - ys / 2, yy - ys / 2, ys, ys);
				ctx.restore();
			}
			ctx.save();
			ctx.beginPath();
			ctx.ellipse(px, py + 4, size * .28 * world.squashX, size * .07, 0, 0, Math.PI * 2);
			ctx.fillStyle = "rgba(44,36,28,0.22)";
			ctx.fill();
			ctx.restore();
			const animKey = world.anim === "held" ? "idle" : world.anim;
			const sheet = atlas.sheets[animKey];
			const fi = frameIndex(animKey, world.animTime);
			const cols = SHEETS[animKey].cols;
			const sx = fi % cols * 256;
			const sy = Math.floor(fi / cols) * 256;
			ctx.save();
			ctx.translate(px, py);
			ctx.scale(world.facing * world.squashX, world.squashY);
			if (world.held) ctx.rotate(-.12);
			ctx.drawImage(sheet, sx, sy, 256, 256, -size / 2, -size + 8, size, size);
			ctx.restore();
			for (const p of world.particles) {
				const alpha = 1 - p.life / p.maxLife;
				ctx.save();
				ctx.globalAlpha = alpha;
				ctx.translate(px + p.x, py - size * .55 + p.y);
				if (p.kind === "heart") {
					ctx.fillStyle = "#c45c3a";
					ctx.beginPath();
					const s = p.size;
					ctx.moveTo(0, s * .3);
					ctx.bezierCurveTo(-s, -s * .35, -s * .35, -s, 0, -s * .4);
					ctx.bezierCurveTo(s * .35, -s, s, -s * .35, 0, s * .3);
					ctx.fill();
				} else {
					ctx.fillStyle = "rgba(196,165,116,0.7)";
					ctx.beginPath();
					ctx.ellipse(0, 0, p.size, p.size * .55, 0, 0, Math.PI * 2);
					ctx.fill();
				}
				ctx.restore();
			}
			if (world.speech) {
				ctx.save();
				const text = world.speech;
				ctx.font = "600 14px 'Noto Sans SC', sans-serif";
				const padX = 12;
				const bw = ctx.measureText(text).width + 24;
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
		const hitPet = (cx, cy) => {
			const size = petSizeFor(W(), H());
			const px = world.x * W();
			const py = world.y * H();
			return cx >= px - size * .42 && cx <= px + size * .42 && cy >= py - size * .95 && cy <= py + 8;
		};
		const W = () => wrap.getBoundingClientRect().width;
		const H = () => wrap.getBoundingClientRect().height;
		const local = (e) => {
			const r = wrap.getBoundingClientRect();
			return {
				x: e.clientX - r.left,
				y: e.clientY - r.top
			};
		};
		const onDown = (e) => {
			if (e.button !== 0 && e.pointerType === "mouse") return;
			petAudio.unlock();
			const { x, y } = local(e);
			pointerRef.current = {
				id: e.pointerId,
				x,
				y,
				down: true,
				dragging: false
			};
			canvas.setPointerCapture(e.pointerId);
			if (hitPet(x, y)) {
				world.dragDx = x - world.x * W();
				world.dragDy = y - world.y * H();
			}
		};
		const onMove = (e) => {
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
				world.squashX = .92;
				world.squashY = 1.08;
			}
			if (p.dragging) {
				const nx = (x - world.dragDx) / W();
				const ny = (y - world.dragDy) / H();
				world.facing = x > p.x ? 1 : x < p.x ? -1 : world.facing;
				world.x = clamp(nx, .04, .96);
				world.y = clamp(ny, .2, .95);
			}
			p.x = x;
			p.y = y;
		};
		const onUp = (e) => {
			const p = pointerRef.current;
			if (!p || p.id !== e.pointerId) return;
			const { x, y } = local(e);
			canvas.releasePointerCapture(e.pointerId);
			if (p.dragging) {
				world.held = false;
				world.y = clamp(world.y, FLOOR.y0, FLOOR.y1);
				world.x = clamp(world.x, FLOOR.x0, FLOOR.x1);
				world.anim = "idle";
				world.squashY = .86;
				world.squashX = 1.12;
				burst(world, "dust", 0, 0, 5);
				petAudio.boing();
			} else if (hitPet(x, y)) actionPet();
			else {
				const nx = x / W();
				const ny = y / H();
				if (ny > FLOOR.y0 - .08) {
					goTo(nx, clamp(ny, FLOOR.y0, FLOOR.y1));
					say(world, pick(LINES.come), performance.now() / 1e3, 1.6);
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
	}, [
		ready,
		name,
		actionPet,
		goTo
	]);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-paper" });
	if (!name) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Welcome, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		ref: wrapRef,
		className: "relative h-dvh w-full overflow-hidden bg-night",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: PROP_SRC.roomDay,
				alt: "",
				className: "absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out",
				style: { opacity: isNight ? 0 : 1 }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: PROP_SRC.roomNight,
				alt: "",
				className: "absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out",
				style: { opacity: isNight ? 1 : 0 }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 z-10 size-full touch-none",
				style: { touchAction: "none" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {
				onPet: actionPet,
				onFeed: actionFeed,
				onPlay: actionPlay,
				onSleep: actionSleep,
				sleeping,
				isNight
			}),
			!ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-30 flex items-center justify-center bg-paper/40 text-sm text-ink",
				children: "小猫正在跳上窗台…"
			})
		]
	});
}
function roundRect(ctx, x, y, w, h, r) {
	const rr = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + rr, y);
	ctx.arcTo(x + w, y, x + w, y + h, rr);
	ctx.arcTo(x + w, y + h, x, y + h, rr);
	ctx.arcTo(x, y + h, x, y, rr);
	ctx.arcTo(x, y, x + w, y, rr);
	ctx.closePath();
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskPet, {});
}
//#endregion
export { Home as component };
