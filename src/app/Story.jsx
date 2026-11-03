"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ─────────────────────────────────────────────────────────────
   SCENE 03 — THE STORY BEHIND SOCIALSECT  (3D fly-through)
   Rayansh arrives from Scene 02 and stands at the left inside a
   turning gold gyroscope. The section pins and the camera travels
   forward through a 3D space: the title rushes past, then each
   chapter card approaches from the distance, holds in focus while
   its story plays, and sweeps past the camera.
   ───────────────────────────────────────────────────────────── */

const CHAPTERS = [
  {
    n: "01",
    kicker: "A problem in healthcare",
    tab: "The problem",
    title: "A frustrated specialist",
    paras: [
      "It started with a simple conversation — and a problem that ran deeper than marketing.",
      "I met a specialist who was exceptional at their work but had already been through two agencies in eighteen months without getting the support they needed.",
    ],
  },
  {
    n: "02",
    kicker: "Two weeks of understanding",
    tab: "Two weeks",
    title: "Listen before marketing",
    paras: [
      "Instead of jumping straight into marketing, I spent two weeks understanding their practice, their patients, and the challenges behind their business.",
    ],
  },
  {
    n: "03",
    kicker: "A bigger purpose",
    tab: "The purpose",
    title: "The birth of Socialsect",
    paras: [
      "That’s when I realised healthcare professionals shouldn’t have to become marketers to grow their practice.",
      "They deserve a partner who understands their world.",
      "That’s the reason I built Socialsect.",
    ],
  },
];

/* camera stops: the title, then each chapter, every DEPTH apart */
const DEPTH = 1300;
/* resting pose of each chapter card in the corridor */
const CARD_POSE = [
  { x: 0, y: 0, ry: 0 },
  { x: 0, y: 0, ry: 0 },
  { x: 0, y: 0, ry: 0 },
];
const DAYS = Array.from({ length: 14 }, (_, i) => i + 1);
const LEARNT = ["Their practice", "Their patients", "Their challenges"];
/* wave entrance: 7 weekday letters, then the 14 days */
const WAVE = [
  "delay-[0ms]", "delay-[35ms]", "delay-[70ms]", "delay-[105ms]", "delay-[140ms]", "delay-[175ms]", "delay-[210ms]",
  "delay-[260ms]", "delay-[300ms]", "delay-[340ms]", "delay-[380ms]", "delay-[420ms]", "delay-[460ms]", "delay-[500ms]",
  "delay-[540ms]", "delay-[580ms]", "delay-[620ms]", "delay-[660ms]", "delay-[700ms]", "delay-[740ms]", "delay-[780ms]",
];

export default function Story() {
  const sectionRef = useRef(null);
  const slotRef = useRef(null);
  const flyerRef = useRef(null);
  const pinRef = useRef(null);
  const [chapter, setChapter] = useState(-1); // -1 = the title is in focus

  const goTo = (i) => {
    const st = pinRef.current;
    if (!st) {
      document.getElementById(`story-ch-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const y = st.start + (st.end - st.start) * ((i + 1 + 0.25) / 4);
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    let mm;
    let cancelled = false;
    const timers = [];

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const q = (sel) => gsap.utils.toArray(sel, section);
      const clamp = gsap.utils.clamp;
      mm = gsap.matchMedia(section);

      mm.add(
        { desktop: "(min-width: 1024px)", motion: "(prefers-reduced-motion: no-preference)" },
        (ctx) => {
          const { desktop, motion } = ctx.conditions;
          if (!desktop) return;
          const cleanups = [];

          /* ── 1. THE HAND-OFF: the exact Scene 02 portrait flies in ── */
          const prevSlot = document.querySelector("[data-story-portrait]");
          const prevSection = prevSlot?.closest("section");
          const flyer = flyerRef.current;
          const mono = flyer.querySelector("[data-mono]");

          if (motion && prevSlot && prevSection) {
            const proxy = { p: 0 };
            let m = { dx: 0, dy: 0, s: 1 };
            const easeX = gsap.parseEase("power2.inOut");
            const easeS = gsap.parseEase("power1.inOut");
            // both slots measured relative to their own section: scroll- and pin-independent
            const measure = () => {
              const a = prevSlot.getBoundingClientRect();
              const aSec = prevSection.getBoundingClientRect();
              const b = slotRef.current.getBoundingClientRect();
              const bSec = section.getBoundingClientRect();
              m = {
                dx: a.left - aSec.left - (b.left - bSec.left),
                dy: a.top - aSec.top - (b.top - bSec.top) - window.innerHeight,
                s: a.height / b.height,
              };
            };
            const setX = gsap.quickSetter(flyer, "x", "px");
            const setY = gsap.quickSetter(flyer, "y", "px");
            const setSX = gsap.quickSetter(flyer, "scaleX");
            const setSY = gsap.quickSetter(flyer, "scaleY");
            const setRot = gsap.quickSetter(flyer, "rotation", "deg");
            const setMono = gsap.quickSetter(mono, "opacity");
            let wasFlying = null;
            const apply = () => {
              const p = proxy.p;
              const sc = m.s + (1 - m.s) * easeS(p);
              setX(m.dx * (1 - easeX(p)));
              setY(m.dy * (1 - p));
              setSX(sc);
              setSY(sc);
              setRot(Math.sin(Math.PI * p) * -3);
              setMono(1 - clamp(0, 1, (p - 0.4) / 0.5)); // Scene 02's B&W → colour as he lands
              const flying = p > 0.001;
              if (flying !== wasFlying) {
                wasFlying = flying;
                // opacity, not visibility: Scene 02's own inline visibility would override it
                prevSlot.style.opacity = flying ? "0" : "";
                flyer.style.visibility = flying ? "visible" : "hidden";
              }
            };
            gsap.set(flyer, { transformOrigin: "0 0" });
            measure();
            apply();
            const flight = gsap.to(proxy, {
              p: 1,
              ease: "none",
              onUpdate: apply,
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top top",
                scrub: true,
                refreshPriority: -1,
                invalidateOnRefresh: true,
                onRefreshInit: () => {
                  wasFlying = null;
                  prevSlot.style.opacity = "";
                },
                onRefresh: () => {
                  measure();
                  apply();
                },
              },
            });
            cleanups.push(() => {
              flight.scrollTrigger?.kill();
              flight.kill();
              prevSlot.style.opacity = "";
              flyer.style.visibility = "";
              gsap.set(flyer, { clearProps: "transform,visibility" });
              gsap.set(mono, { clearProps: "opacity" });
            });
          }

          /* ── 2. THE 3D CORRIDOR ─────────────────────────────── */
          const stage = q("[data-stage]")[0];
          const items = q("[data-z]").map((el) => ({
            el,
            base: Number(el.dataset.z),
            z: gsap.quickSetter(el, "z", "px"),
            x: gsap.quickSetter(el, "x", "px"),
            y: gsap.quickSetter(el, "y", "px"),
            o: gsap.quickSetter(el, "opacity"),
            pe: null,
          }));
          q("[data-card]").forEach((el, i) => {
            const p = CARD_POSE[i];
            gsap.set(el, { yPercent: -50, x: p.x, y: p.y, rotationY: p.ry });
          });
          gsap.set(q("[data-titlecard]"), { yPercent: -50 });

          const floor = q("[data-floor]")[0];
          const fill = q("[data-track]").map((el) => gsap.quickSetter(el, "scaleX"));

          const words = CHAPTERS.map((_, i) => q(`[data-words="${i}"] [data-w]`));
          const wordSet = words.map((list) => list.map((w) => gsap.quickSetter(w, "opacity")));
          const counters = q("[data-count]");
          const days = q("[data-day]");
          const dayCount = q("[data-daycount]")[0];
          const setCalBar = gsap.quickSetter(q("[data-calbar]")[0], "scaleX");
          let lastDay = -1;
          const chips = q("[data-chip]");
          const setChip = chips.map((el) => gsap.quickSetter(el, "opacity"));
          const setChipY = chips.map((el) => gsap.quickSetter(el, "y", "px"));
          const markFill = q("[data-mark-fill]")[0];
          const glide = gsap.parseEase("power3.inOut");
          const HOLD = 0.55;
          let cur = -2;
          const lastCount = [];

          const render = (prog) => {
            // 4 stops (title + 3 chapters): hold, then glide to the next
            const seg = Math.min(3.9999, prog * 4);
            const s = Math.floor(seg);
            const f = seg - s;
            const move = s < 3 ? glide(clamp(0, 1, (f - HOLD) / (1 - HOLD))) : 0;
            const cam = (s + move) * DEPTH;

            items.forEach((it) => {
              const z = it.base + cam; // 0 = in focus, <0 far away, >0 passing the camera
              it.z(z);
              // once in front of the camera it slides away up and to the right
              const past = Math.max(0, z);
              it.x(past * 0.9);
              it.y(-past * 0.3);
              const o = z >= 0 ? clamp(0, 1, 1 - z / 260) : Math.pow(clamp(0, 1, 1 + z / 1150), 1.4);
              it.o(o);
              const pe = o > 0.6;
              if (pe !== it.pe) {
                it.pe = pe;
                it.el.style.pointerEvents = pe ? "" : "none";
              }
            });

            floor.style.transform = `translateX(-50%) rotateX(80deg) translateY(${((cam * 0.5) % 120).toFixed(1)}px)`;

            const focus = Math.round(cam / DEPTH) - 1;
            if (focus !== cur) {
              cur = focus;
              setChapter(focus);
            }

            // the story plays while each chapter is held in focus
            CHAPTERS.forEach((_, i) => {
              const stop = i + 1;
              const local = stop < s ? 1 : stop === s ? clamp(0, 1, f / HOLD) : 0;
              fill[i](local);
              const to = local * (words[i].length + 3);
              words[i].forEach((_, j) => wordSet[i][j](clamp(0.2, 1, to - j)));
              if (i === 0) {
                const v = clamp(0, 1, (local - 0.1) / 0.6);
                counters.forEach((el, k) => {
                  const val = Math.round(Number(el.dataset.count) * v);
                  if (lastCount[k] !== val) {
                    lastCount[k] = val;
                    el.textContent = String(val);
                  }
                });
              }
              if (i === 1) {
                const v = clamp(0, 1, (local - 0.05) / 0.75);
                setCalBar(v);
                // days tick off one by one; the next day gets a pulsing ring
                const done = Math.min(DAYS.length, Math.floor(v * DAYS.length + 0.0001));
                if (done !== lastDay) {
                  lastDay = done;
                  days.forEach((el, k) => {
                    el.dataset.on = k < done ? "1" : "0";
                    el.dataset.now = k === done ? "1" : "0";
                  });
                  dayCount.textContent = `Day ${Math.max(1, Math.min(done + 1, DAYS.length))} / ${DAYS.length}`;
                }
                chips.forEach((_, k) => {
                  const a = clamp(0, 1, (v - (k + 1) / 4) * 6);
                  setChip[k](a);
                  setChipY[k]((1 - a) * 14);
                });
              }
              if (i === 2) {
                const v = clamp(0, 1, (local - 0.1) / 0.6);
                markFill.style.clipPath = `inset(0 ${(100 - v * 100).toFixed(1)}% 0 0)`;
              }
            });
          };

          const story = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: () => "+=" + window.innerHeight * 4.2,
            pin: true,
            anticipatePin: 1,
            refreshPriority: -1,
            invalidateOnRefresh: true,
            onRefresh: (self) => render(self.progress),
            onUpdate: (self) => render(self.progress),
          });
          pinRef.current = story;
          render(0);

          cleanups.push(() => {
            story.kill(true);
            pinRef.current = null;
            setChapter(-1);
            markFill.style.clipPath = "";
            days.forEach((el) => {
              el.dataset.on = "1";
              el.dataset.now = "0";
            });
            if (dayCount) dayCount.textContent = `Day ${DAYS.length} / ${DAYS.length}`;
            gsap.set(q("[data-calbar]"), { clearProps: "transform" });
            floor.style.transform = "";
            counters.forEach((el) => (el.textContent = el.dataset.count));
            items.forEach((it) => (it.el.style.pointerEvents = ""));
            gsap.set([...items.map((i) => i.el), ...q("[data-w]"), ...chips], {
              clearProps: "transform,opacity",
            });
          });

          if (!motion) return () => cleanups.forEach((fn) => fn());

          /* ── 3. ENTRANCE + LIFE ─────────────────────────────── */
          const gyro = q("[data-gyro]");
          gsap.set(gyro, { opacity: 0, scale: 0.4 });
          gsap.set(q("[data-in]"), { opacity: 0, y: 30 });
          gsap.set(q("[data-title-line]"), { yPercent: 110, rotationX: -60 });
          const tl = gsap.timeline({
            defaults: { ease: "expo.out" },
            scrollTrigger: { trigger: section, start: "top 70%", once: true, refreshPriority: -1 },
          });
          tl.to(gyro, { opacity: 1, scale: 1, duration: 2, stagger: 0.15, ease: "expo.out" }, 0)
            .to(q("[data-title-line]"), { yPercent: 0, rotationX: 0, duration: 1.5, stagger: 0.12 }, 0.15)
            .to(q("[data-in]"), { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: "power3.out" }, 0.45);

          const life = [
            gsap.to(q("[data-ring-a]"), { rotationZ: 360, duration: 18, ease: "none", repeat: -1 }),
            gsap.to(q("[data-ring-b]"), { rotationZ: -360, duration: 26, ease: "none", repeat: -1 }),
            gsap.to(q("[data-ring-c]"), { rotationZ: 360, duration: 34, ease: "none", repeat: -1 }),
            gsap.to(q("[data-bob]"), { y: -10, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 }),
            gsap.to(q("[data-float]"), { y: -12, duration: 3.6, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.6 }),
          ];

          // the whole space tilts a little with the mouse
          const tiltY = gsap.quickTo(stage, "rotationY", { duration: 1.2, ease: "power3.out" });
          const tiltX = gsap.quickTo(stage, "rotationX", { duration: 1.2, ease: "power3.out" });
          const onMove = (e) => {
            tiltY((e.clientX / window.innerWidth - 0.5) * 6);
            tiltX((e.clientY / window.innerHeight - 0.5) * -4);
          };
          const onLeave = () => (tiltY(0), tiltX(0));
          section.addEventListener("mousemove", onMove);
          section.addEventListener("mouseleave", onLeave);

          cleanups.push(() => {
            life.forEach((t) => t.kill());
            section.removeEventListener("mousemove", onMove);
            section.removeEventListener("mouseleave", onLeave);
            gsap.set(stage, { clearProps: "transform" });
          });

          return () => cleanups.forEach((fn) => fn());
        }
      );

      // Scene 02 builds its pin in its own effect: refresh once everything exists
      const refresh = () => ScrollTrigger.refresh();
      timers.push(setTimeout(refresh, 250), setTimeout(refresh, 1200));
      if (document.readyState !== "complete") window.addEventListener("load", refresh, { once: true });
    };

    init();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      mm?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="story"
      aria-labelledby="story-title"
      className="relative z-10 w-full overflow-x-clip bg-[#050505] text-[#f6efe4] px-6 pt-24 pb-24 sm:px-10 max-lg:flex max-lg:flex-col lg:p-0 lg:h-screen lg:min-h-[700px]"
    >
      {/* ── ATMOSPHERE: horizon glow ── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-x-0 top-[38%] h-[30%] bg-[radial-gradient(ellipse_at_62%_50%,rgba(217,165,68,0.22)_0%,rgba(217,165,68,0.06)_40%,transparent_70%)]" />
        <div className="absolute inset-x-0 top-0 h-[40%] bg-[linear-gradient(to_bottom,#050505_10%,transparent_100%)]" />
      </div>

      {/* ── TOP BAR: label + chapter tabs ── */}
      <div
        data-in
        className="relative z-40 max-lg:order-1 flex items-center justify-between lg:absolute lg:left-[4.5%] lg:right-[4.5%] lg:top-[6%]"
      >
        <div className="flex items-center gap-4">
          <span className="text-[0.95rem] lg:text-[min(1.1vw,2vh)] tracking-[0.18em] text-[#d9a544]">03</span>
          <span className="block h-px w-14 lg:w-[5vw] bg-[#d9a544]" />
          <span className="text-[0.66rem] lg:text-[min(0.8vw,1.5vh)] tracking-[0.3em] uppercase text-[#f6efe4]/80">
            The story behind Socialsect
          </span>
        </div>
        <nav aria-label="Story chapters" className="hidden lg:flex gap-[1.6vw] w-[54.4%]">
          {CHAPTERS.map((c, i) => (
            <button
              key={c.n}
              type="button"
              onClick={() => goTo(i)}
              aria-current={chapter === i ? "step" : undefined}
              data-cursor-hover
              className={`group flex-1 text-left outline-none transition-colors duration-500 ${
                chapter === i ? "text-[#f6efe4]" : "text-[#f6efe4]/45 hover:text-[#f6efe4]/80"
              }`}
            >
              <span className="flex items-baseline gap-2 text-[min(0.82vw,1.55vh)] uppercase tracking-[0.2em]">
                <span className={`font-semibold ${chapter === i ? "text-[#d9a544]" : ""}`}>{c.n}</span>
                <span className="truncate group-focus-visible:underline underline-offset-4">{c.tab}</span>
              </span>
              <span className="mt-[1.2vh] block h-[2px] rounded-full overflow-hidden bg-[#f6efe4]/12">
                <span data-track className="block h-full origin-left scale-x-0 bg-[#d9a544] shadow-[0_0_10px_rgba(217,165,68,0.8)]" />
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* ── THE 3D SPACE ── */}
      <div className="relative max-lg:order-3 lg:absolute lg:inset-0 lg:[perspective:1100px] lg:[perspective-origin:70.75%_52%]">
        {/* streaming gold grid floor */}
        <div
          data-floor
          aria-hidden="true"
          className="hidden lg:block absolute left-1/2 bottom-[-6%] w-[320vw] h-[260vh] origin-bottom [transform:translateX(-50%)_rotateX(80deg)] bg-[linear-gradient(rgba(217,165,68,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(217,165,68,0.2)_1px,transparent_1px)] bg-[size:120px_120px] [mask-image:linear-gradient(to_top,black_0%,rgba(0,0,0,0.6)_30%,transparent_75%)] pointer-events-none"
        />

        <div data-stage className="relative lg:absolute lg:inset-0 lg:[transform-style:preserve-3d]">
          {/* the title — first thing in focus, first to rush past */}
          <div
            data-z="0"
            data-titlecard
            className="relative max-lg:order-2 lg:absolute lg:left-[46%] lg:top-[52%] lg:w-[49.5vw] [transform-style:preserve-3d] max-lg:mt-10"
          >
            <h2
              id="story-title"
              className="font-[family-name:var(--font-wide)] font-extrabold uppercase leading-[0.98] tracking-[-0.03em] text-[2.6rem] sm:text-[3.6rem] lg:text-[min(5.2vw,10vh)] [perspective:600px]"
            >
              <span className="block overflow-hidden">
                <span data-title-line className="block origin-bottom text-[#f6efe4]">
                  The story
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-title-line className="block origin-bottom text-[#050505] [-webkit-text-stroke:2.6px_rgba(217,165,68,0.85)] [paint-order:stroke_fill]">
                  behind
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.05em]">
                <span data-title-line className="block origin-bottom text-[#f6efe4] [text-shadow:0_20px_60px_rgba(0,0,0,0.9)]">
                  Socialsect<span className="text-[#d9a544]">.</span>
                </span>
              </span>
            </h2>
            <p data-in className="mt-5 lg:mt-[2.6vh] text-[0.72rem] lg:text-[min(0.95vw,1.75vh)] uppercase tracking-[0.4em] text-[#f6efe4]/80">
              A real problem. A bigger purpose.
            </p>
            <p data-in className="hidden lg:flex mt-[4vh] items-center gap-3 text-[min(0.8vw,1.5vh)] uppercase tracking-[0.3em] text-[#d9a544]">
              <span className="relative block w-[1px] h-[4vh] overflow-hidden bg-[#d9a544]/25">
                <span className="absolute inset-x-0 top-0 h-1/2 bg-[#d9a544] motion-safe:animate-[storyHint_1.6s_ease-in-out_infinite]" />
              </span>
              Scroll to step inside
            </p>
          </div>

          {/* the three chapter monoliths, deeper and deeper */}
          {CHAPTERS.map((c, i) => {
            const last = i === CHAPTERS.length - 1;
            return (
              <article
                key={c.n}
                id={`story-ch-${i}`}
                data-z={-(i + 1) * DEPTH}
                data-card
                data-words={i}
                aria-labelledby={`story-ch-${i}-t`}
                className="relative max-lg:order-4 max-lg:mt-10 lg:absolute lg:left-[46%] lg:top-[52%] lg:w-[49.5vw] lg:h-[min(66vh,34vw)] [transform-style:preserve-3d]"
              >
                <div data-float className="relative w-full h-full">
                  <div
                    className={`relative w-full h-full overflow-hidden rounded-[18px] p-7 sm:p-9 lg:p-[min(2.6vw,4.6vh)] flex flex-col bg-[linear-gradient(150deg,rgba(38,30,18,0.96)_0%,rgba(12,10,7,0.98)_70%)] text-[#f6efe4] border transition-[border-color,box-shadow] duration-[1000ms] ${
                      chapter === i
                        ? "border-[#d9a544]/70 shadow-[0_60px_140px_rgba(0,0,0,0.85),0_0_110px_rgba(217,165,68,0.22),inset_0_1px_0_rgba(255,230,170,0.3)]"
                        : "border-[#d9a544]/25 shadow-[0_60px_140px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,230,170,0.15)]"
                    }`}
                  >
                    {/* gold light runs across the top edge as the card lands in focus */}
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-0 h-[2px] w-full origin-left transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        chapter === i ? "scale-x-100" : "scale-x-0"
                      } bg-[linear-gradient(90deg,transparent,#f0c46c_30%,#d9a544_70%,transparent)] shadow-[0_0_14px_rgba(240,196,108,0.9)]`}
                    />
                    {/* glare + giant number */}
                    <div className="absolute -inset-[30%] pointer-events-none bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.07)_50%,transparent_60%)]" />
                    <span
                      aria-hidden="true"
                      className="absolute right-[3%] -bottom-[7%] font-[family-name:var(--font-wide)] font-extrabold leading-none text-[8rem] lg:text-[min(14vw,26vh)] tracking-[-0.05em] [paint-order:stroke_fill] text-[#120e09] [-webkit-text-stroke:2px_rgba(217,165,68,0.22)]"
                    >
                      {c.n}
                    </span>

                    <p className="relative text-[0.72rem] lg:text-[min(0.85vw,1.6vh)] font-semibold uppercase tracking-[0.28em] text-[#d9a544]">
                      Chapter {c.n} · {c.kicker}
                    </p>
                    <h3
                      id={`story-ch-${i}-t`}
                      className="relative mt-3 lg:mt-[1.6vh] font-[family-name:var(--font-wide)] font-extrabold uppercase leading-[1] tracking-[-0.02em] text-[1.7rem] sm:text-[2.2rem] lg:text-[min(2.5vw,4.6vh)]"
                    >
                      {c.title}
                    </h3>
                    <div className="relative mt-4 lg:mt-[2.2vh] space-y-3 lg:space-y-[1.4vh] max-w-[46ch] text-[1rem] lg:text-[min(1.08vw,2vh)] leading-[1.55]">
                      {c.paras.map((t, k) => (
                        <p key={k} className={last && k === c.paras.length - 1 ? "font-semibold text-[#d9a544]" : undefined}>
                          {t.split(" ").map((w, j) => (
                            <span key={j} data-w>
                              {w}{" "}
                            </span>
                          ))}
                        </p>
                      ))}
                    </div>

                    <div className="relative mt-6 lg:mt-auto">
                      {i === 0 && (
                        <div className="flex gap-10 lg:gap-[3vw]">
                          {[
                            { v: 2, label: ["agencies", "tried"] },
                            { v: 18, label: ["months without", "real support"] },
                          ].map((s) => (
                            <div key={s.v} className="flex items-end gap-3 lg:gap-[0.8vw]">
                              <span
                                data-count={s.v}
                                className="font-[family-name:var(--font-wide)] font-extrabold leading-[0.8] tabular-nums text-[3.6rem] lg:text-[min(5vw,9.4vh)] text-[#d9a544] [text-shadow:0_0_40px_rgba(217,165,68,0.3)]"
                              >
                                {s.v}
                              </span>
                              <span className="pb-1 text-[0.8rem] lg:text-[min(0.85vw,1.6vh)] leading-[1.3] text-[#f6efe4]/80">
                                {s.label[0]}
                                <br />
                                {s.label[1]}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {i === 1 && (
                        <div>
                          <div
                            data-show={chapter === 1 ? "1" : "0"}
                            className="group/cal w-full max-w-[420px] lg:max-w-[min(27vw,50vh)] rounded-[12px] border border-[#d9a544]/20 bg-[#0c0a07]/80 p-3 lg:p-[min(0.9vw,1.6vh)] shadow-[inset_0_1px_0_rgba(255,230,170,0.08)] transition-[translate,opacity,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:opacity-0 lg:translate-y-4 data-[show=1]:lg:opacity-100 data-[show=1]:lg:translate-y-0 data-[show=1]:shadow-[inset_0_1px_0_rgba(255,230,170,0.08),0_0_60px_rgba(217,165,68,0.12)]"
                            role="img"
                            aria-label="A two-week calendar: fourteen days spent with the practice"
                          >
                            <div className="flex items-center justify-between text-[0.62rem] lg:text-[min(0.68vw,1.25vh)] uppercase tracking-[0.18em]">
                              <span className="text-[#d9a544] font-semibold">14 days with the practice</span>
                              <span data-daycount className="tabular-nums text-[#f6efe4]/75">
                                Day 14 / 14
                              </span>
                            </div>
                            <div className="mt-2 lg:mt-[1vh] grid grid-cols-7 gap-1.5 lg:gap-[min(0.45vw,0.8vh)] text-center">
                              {["M", "T", "W", "T", "F", "S", "S"].map((d, k) => (
                                <span
                                  key={k}
                                  className={`text-[0.58rem] lg:text-[min(0.6vw,1.1vh)] font-semibold text-[#f6efe4]/40 transition-[opacity,translate] duration-500 ease-out lg:opacity-0 lg:-translate-y-2 group-data-[show=1]/cal:lg:opacity-100 group-data-[show=1]/cal:lg:translate-y-0 ${WAVE[k]}`}
                                >
                                  {d}
                                </span>
                              ))}
                              {DAYS.map((d, k) => (
                                <span
                                  key={d}
                                  className={`block transition-[opacity,scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:opacity-0 lg:scale-50 group-data-[show=1]/cal:lg:opacity-100 group-data-[show=1]/cal:lg:scale-100 ${WAVE[k + 7]}`}
                                >
                                <span
                                  data-day
                                  data-on="1"
                                  data-now="0"
                                  className="group/day relative grid place-items-center aspect-square rounded-full text-[0.7rem] lg:text-[min(0.78vw,1.45vh)] font-semibold tabular-nums transition-[background-color,color,box-shadow] duration-500 text-[#f6efe4]/35 shadow-[inset_0_0_0_1px_rgba(217,165,68,0.18)] data-[on=1]:bg-[#d9a544] data-[on=1]:text-[#140e05] data-[on=1]:shadow-[0_0_18px_rgba(217,165,68,0.45)] data-[on=1]:motion-safe:animate-[dayPop_0.55s_cubic-bezier(0.22,1,0.36,1)] data-[now=1]:text-[#f6efe4] data-[now=1]:shadow-[inset_0_0_0_2px_#d9a544]"
                                >
                                  {d}
                                  {/* tick once the day is done */}
                                  <svg
                                    viewBox="0 0 12 12"
                                    aria-hidden="true"
                                    className="absolute -right-[6%] -top-[6%] w-[38%] h-[38%] rounded-full bg-[#140e05] p-[12%] text-[#d9a544] opacity-0 scale-50 transition-[opacity,scale] duration-300 group-data-[on=1]/day:opacity-100 group-data-[on=1]/day:scale-100"
                                  >
                                    <path d="M2.5 6.3l2.2 2.2L9.5 3.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  {/* today: a soft pulsing ring */}
                                  <span
                                    aria-hidden="true"
                                    className="absolute inset-0 rounded-full border border-[#d9a544] opacity-0 group-data-[now=1]/day:opacity-100 group-data-[now=1]/day:motion-safe:animate-ping"
                                  />
                                </span>
                                </span>
                              ))}
                            </div>
                            {/* progress through the two weeks */}
                            <div className="relative mt-3 lg:mt-[1.4vh] h-[3px] rounded-full overflow-hidden bg-[#d9a544]/15">
                              <span
                                data-calbar
                                className="absolute inset-0 origin-left rounded-full bg-[linear-gradient(90deg,#b9852c,#f0c46c)] shadow-[0_0_12px_rgba(240,196,108,0.8)]"
                              />
                              <span
                                aria-hidden="true"
                                className="absolute inset-y-0 left-0 w-[30%] bg-[linear-gradient(90deg,transparent,rgba(255,244,214,0.9),transparent)] motion-safe:animate-[calShine_2.4s_ease-in-out_infinite]"
                              />
                            </div>
                          </div>
                          <ul className="mt-3 lg:mt-[1.6vh] flex flex-wrap gap-2 lg:gap-[0.5vw]">
                            {LEARNT.map((l) => (
                              <li
                                key={l}
                                data-chip
                                className="rounded-full bg-[#d9a544] px-4 py-1.5 lg:px-[0.9vw] lg:py-[0.6vh] text-[0.78rem] lg:text-[min(0.82vw,1.5vh)] font-semibold text-[#140e05]"
                              >
                                {l}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {i === 2 && (
                        <div className="relative w-fit font-[family-name:var(--font-wide)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-[2.8rem] sm:text-[3.8rem] lg:text-[min(5vw,9.4vh)]">
                          <span aria-hidden="true" className="block text-[#120e09] [-webkit-text-stroke:2.5px_rgba(217,165,68,0.45)] [paint-order:stroke_fill]">
                            Socialsect
                          </span>
                          <span data-mark-fill className="absolute inset-0 text-[#d9a544]">
                            Socialsect
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ── RAYANSH, inside a turning gold gyroscope ── */}
      <div className="relative z-30 max-lg:order-2 h-[115vw] max-h-[720px] sm:h-[88vw] max-lg:mt-8 lg:absolute lg:inset-0 lg:h-auto lg:max-h-none pointer-events-none">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[52%] w-[88%] aspect-square -translate-x-1/2 -translate-y-1/2 lg:left-[22%] lg:top-[56%] lg:w-[min(30vw,58vh)] [perspective:900px]"
        >
          <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgba(217,165,68,0.28)_0%,rgba(217,165,68,0.08)_45%,transparent_70%)]" />
          <div data-gyro className="absolute inset-0 [transform-style:preserve-3d] [transform:rotateX(72deg)]">
            <div data-ring-a className="absolute inset-0 rounded-full border-[2px] border-[#d9a544] shadow-[0_0_30px_rgba(217,165,68,0.55)]" />
          </div>
          <div data-gyro className="absolute inset-[7%] [transform-style:preserve-3d] [transform:rotateY(66deg)_rotateX(18deg)]">
            <div data-ring-b className="absolute inset-0 rounded-full border-[1.5px] border-dashed border-[#f0c46c]/70" />
          </div>
          <div data-gyro className="absolute inset-[14%] [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateY(-34deg)]">
            <div data-ring-c className="absolute inset-0 rounded-full border border-[#d9a544]/60 shadow-[0_0_18px_rgba(217,165,68,0.35)]" />
          </div>
        </div>

        <div
          ref={slotRef}
          data-principles-portrait
          className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[92%] aspect-[500/710] lg:left-[22%] lg:top-[17%] lg:bottom-auto lg:h-[80%]"
        >
          <div ref={flyerRef} className="relative w-full h-full will-change-transform [backface-visibility:hidden]">
            <div className="absolute inset-0 [perspective:900px]">
              <div data-pose className="absolute inset-0 origin-bottom will-change-transform">
                <div data-bob className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_82%,transparent_100%)]">
                  <Image
                    src="/rayansh-hero.png"
                    alt="Rayansh Singh"
                    width={500}
                    height={710}
                    quality={100}
                    className="absolute inset-0 w-full h-full object-contain object-[center_bottom] [filter:brightness(1.05)_contrast(1.06)]"
                  />
                  {/* B&W copy matching how he leaves Scene 02 — fades as he lands */}
                  <Image
                    data-mono
                    src="/rayansh-hero.png"
                    alt=""
                    aria-hidden="true"
                    width={500}
                    height={710}
                    quality={100}
                    className="absolute inset-0 w-full h-full object-contain object-[center_bottom] opacity-0 will-change-[opacity] [filter:grayscale(0.92)_sepia(0.18)_brightness(0.98)_contrast(1.12)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
