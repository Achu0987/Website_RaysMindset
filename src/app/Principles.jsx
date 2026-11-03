"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ─────────────────────────────────────────────────────────────
   SECTION 04 — THE WAY I THINK  (3D ring carousel)
   A tilted ring of glass cards circles Rayansh. Scrolling turns
   the ring: each principle swings to the front, lights up, and
   is explained on the left — then the ring turns to the next.
   ───────────────────────────────────────────────────────────── */

const PRINCIPLES = [
  {
    keep: "Honesty",
    img: "/principles/honesty-latour.jpg",
    alt: "The Penitent Magdalen by Georges de La Tour, a woman lit by a single candle",
    join: "before",
    over: "comfort",
    body: "I’d rather tell you what you need to hear than what you want to hear. If something isn’t working, you’ll hear it from me early — not discover it in a report months later. Comfortable conversations feel good. Honest ones move things forward.",
  },
  {
    keep: "Results",
    img: "/principles/results-bruegel.jpg",
    alt: "The Harvesters by Pieter Bruegel the Elder, golden wheat being gathered",
    join: "over",
    over: "reports",
    body: "A polished dashboard means nothing if the diary is still empty. I judge the work by what actually changes in the business — not by how impressive the numbers look on a slide.",
  },
  {
    keep: "Depth",
    img: "/principles/depth-rembrandt.jpg",
    alt: "Aristotle with a Bust of Homer by Rembrandt, a man deep in thought",
    join: "over",
    over: "volume",
    body: "Every practice has its own patients, its own market and its own ambitions. I would rather understand one business properly than hand the same answer to a hundred. Depth takes longer. It is also what lasts.",
  },
  {
    keep: "Partnership",
    img: "/principles/partnership-caravaggio.jpg",
    alt: "The Musicians by Caravaggio, four young men making music together",
    join: "over",
    over: "transaction",
    body: "I’m not here for quick wins and short contracts. Good work comes from people who trust each other over years. I treat a client’s business as something I’m responsible for protecting, not something I’m billing for.",
  },
  {
    keep: "Curiosity",
    img: "/principles/curiosity-adam-salomon.jpg",
    alt: "A bearded man examining a manuscript through a magnifying glass, by Antoine-Samuel Adam-Salomon",
    join: "over",
    over: "assumption",
    body: "Assumptions are expensive. Before I suggest anything, I ask — about the patients, the team, what has worked and what hasn’t. The most useful answer usually starts with the question nobody thought to ask.",
  },
];

const N = 10; // cards on the ring: the five principles, twice round
const STEP = 360 / N;
const TILT = "rotateX(-13deg) rotateZ(-6deg)";
const pad = (n) => String(n).padStart(2, "0");

export default function Principles() {
  const sectionRef = useRef(null);
  const ringRef = useRef(null);
  const slotRef = useRef(null);
  const flyerRef = useRef(null);
  const [active, setActive] = useState(0);

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
      const ring = ringRef.current;
      const q = (sel) => gsap.utils.toArray(sel, section);
      const clamp = gsap.utils.clamp;
      mm = gsap.matchMedia(section);

      mm.add(
        { desktop: "(min-width: 1024px)", motion: "(prefers-reduced-motion: no-preference)" },
        (ctx) => {
          const { desktop, motion } = ctx.conditions;
          if (!desktop) return;
          const handoff = [];

          /* ── THE HAND-OFF: Scene 03's portrait flies into the ring ── */
          const prevSlot = document.querySelector("[data-principles-portrait]");
          const prevSection = prevSlot?.closest("section");
          const flyer = flyerRef.current;
          const flying3 = motion && prevSlot && prevSection;
          if (flying3) {
            const proxy = { p: 0 };
            let m = { dx: 0, dy: 0, s: 1 };
            const easeX = gsap.parseEase("power2.inOut");
            const easeS = gsap.parseEase("power1.inOut");
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
            let was = null;
            const apply = () => {
              const pr = proxy.p;
              const sc = m.s + (1 - m.s) * easeS(pr);
              setX(m.dx * (1 - easeX(pr)));
              setY(m.dy * (1 - pr));
              setSX(sc);
              setSY(sc);
              setRot(Math.sin(Math.PI * pr) * 3);
              const on = pr > 0.001;
              if (on !== was) {
                was = on;
                prevSlot.style.opacity = on ? "0" : "";
                flyer.style.visibility = on ? "visible" : "hidden";
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
                refreshPriority: -2,
                invalidateOnRefresh: true,
                onRefreshInit: () => {
                  was = null;
                  prevSlot.style.opacity = "";
                },
                onRefresh: () => {
                  measure();
                  apply();
                },
              },
            });
            handoff.push(() => {
              flight.scrollTrigger?.kill();
              flight.kill();
              prevSlot.style.opacity = "";
              flyer.style.visibility = "";
              gsap.set(flyer, { clearProps: "transform,visibility" });
            });
          }

          const cards = q("[data-ringcard]");
          const setO = cards.map((el) => {
            const faces = [...el.querySelectorAll("[data-face]")].map((f) => gsap.quickSetter(f, "opacity"));
            return (v) => faces.forEach((set) => set(v));
          });
          const rail = gsap.quickSetter(q("[data-rail]")[0], "scaleX");
          const glide = gsap.parseEase("power3.inOut");
          const HOLD = 0.5;
          const state = { t: 0, spin: motion ? -220 : 0, alpha: motion ? 0 : 1 };
          let cur = -1;

          const draw = () => {
            const theta = -state.t * STEP + state.spin;
            ring.style.transform = `${TILT} rotateY(${theta.toFixed(2)}deg)`;
            cards.forEach((_, i) => {
              // how much this card faces the viewer: 1 front, -1 back
              const face = Math.cos(((i * STEP + theta) * Math.PI) / 180);
              setO[i]((0.28 + 0.72 * Math.pow((face + 1) / 2, 1.5)) * state.alpha);
            });
          };

          const render = (prog) => {
            const n = PRINCIPLES.length;
            const seg = Math.min(n - 0.0001, prog * n);
            const s = Math.floor(seg);
            const f = seg - s;
            const move = s < n - 1 ? glide(clamp(0, 1, (f - HOLD) / (1 - HOLD))) : 0;
            state.t = s + move;
            draw();
            const a = Math.round(state.t);
            if (a !== cur) {
              cur = a;
              setActive(a);
            }
            rail(prog);
          };

          const st = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: () => "+=" + window.innerHeight * 3.4,
            pin: true,
            anticipatePin: 1,
            refreshPriority: -2,
            invalidateOnRefresh: true,
            onRefresh: (self) => render(self.progress),
            onUpdate: (self) => render(self.progress),
          });
          render(0);

          const cleanups = [
            ...handoff,
            () => {
              st.kill(true);
              ring.style.transform = "";
              gsap.set(q("[data-face]"), { clearProps: "opacity" });
              setActive(0);
            },
          ];

          if (motion) {
            gsap.set(q("[data-line]"), { yPercent: 110 });
            gsap.set(q("[data-in]"), { opacity: 0, y: 24 });
            if (!flying3) gsap.set(q("[data-person]"), { opacity: 0, y: 60 });
            const tl = gsap.timeline({
              defaults: { ease: "expo.out" },
              scrollTrigger: { trigger: section, start: "top 70%", once: true, refreshPriority: -2 },
            });
            if (!flying3) tl.to(q("[data-person]"), { opacity: 1, y: 0, duration: 1.6 }, 0);
            tl.to(state, { spin: 0, alpha: 1, duration: 2.8, ease: "expo.out", onUpdate: draw }, 0.1)
              .to(q("[data-line]"), { yPercent: 0, duration: 1.3, stagger: 0.12 }, 0.2)
              .to(q("[data-in]"), { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "power3.out" }, 0.5);
            const bob = gsap.to(q("[data-bob]"), { y: -8, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
            cleanups.push(() => {
              tl.scrollTrigger?.kill();
              bob.kill();
            });
          }

          return () => cleanups.forEach((fn) => fn());
        }
      );

      // earlier sections build their pins in their own effects: refresh once all exist
      const refresh = () => ScrollTrigger.refresh();
      timers.push(setTimeout(refresh, 400), setTimeout(refresh, 1500));
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
      id="principles"
      aria-labelledby="principles-title"
      className="relative z-10 w-full overflow-x-clip bg-[#050505] text-[#f6efe4] px-6 pt-24 pb-24 sm:px-10 lg:p-0 lg:h-screen lg:min-h-[700px]"
    >
      {/* light */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_66%_45%,rgba(217,165,68,0.16)_0%,rgba(217,165,68,0.05)_35%,transparent_65%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[linear-gradient(to_top,#050505_15%,transparent_100%)]" />
      </div>

      {/* ── LEFT COLUMN ── */}
      <div className="relative z-30 lg:absolute lg:left-[4.5%] lg:top-[6%] lg:bottom-[14%] lg:w-[36%] flex flex-col">
        <div data-in className="flex items-center gap-4">
          <span className="text-[0.95rem] lg:text-[min(1.1vw,2vh)] tracking-[0.18em] text-[#d9a544]">04</span>
          <span className="block h-px w-14 lg:w-[5vw] bg-[#d9a544]" />
          <span className="text-[0.66rem] lg:text-[min(0.8vw,1.5vh)] tracking-[0.3em] uppercase text-[#f6efe4]/80">The way I think</span>
        </div>

        <h2
          id="principles-title"
          className="mt-10 lg:mt-[8vh] font-[family-name:var(--font-wide)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-[3rem] sm:text-[4rem] lg:text-[min(5.4vw,10vh)]"
        >
          <span className="block overflow-hidden">
            <span data-line className="block">
              The way
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.05em]">
            <span data-line className="block">
              I think<span className="text-[#d9a544]">.</span>
            </span>
          </span>
        </h2>
        <p data-in className="mt-5 lg:mt-[2.6vh] max-w-[42ch] text-[1rem] lg:text-[min(1.05vw,1.95vh)] leading-[1.6] text-[#f6efe4]/80">
          I don’t work from a playbook. I work from a handful of principles that decide what I say yes to, how I give
          advice, and who I build with. They’re simple to write down. Keeping them is the real work.
        </p>

        {/* the principle at the front of the ring */}
        <div data-in className="relative mt-12 lg:mt-auto lg:h-[min(30vh,17vw)] space-y-14 lg:space-y-0">
          {PRINCIPLES.map((p, i) => {
            const on = active === i;
            return (
              <article
                key={p.keep}
                aria-labelledby={`principle-${i}`}
                className={`lg:absolute lg:inset-x-0 lg:bottom-0 transition-[opacity,translate,filter] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  on ? "lg:opacity-100 lg:translate-y-0 lg:blur-0" : "lg:opacity-0 lg:translate-y-6 lg:blur-[6px] lg:pointer-events-none"
                }`}
              >
                <div className="lg:hidden relative mb-5 aspect-[16/10] overflow-hidden rounded-[12px] border border-[#d9a544]/30">
                  <Image src={p.img} alt={p.alt} fill sizes="100vw" className="object-cover [filter:sepia(0.3)_contrast(1.05)]" />
                </div>
                <p className="text-[0.72rem] lg:text-[min(0.8vw,1.5vh)] font-semibold uppercase tracking-[0.3em] text-[#d9a544]">
                  Principle {pad(i + 1)} / {pad(PRINCIPLES.length)}
                </p>
                <h3 id={`principle-${i}`} className="mt-3 lg:mt-[1.4vh] flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-[family-name:var(--font-wide)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-[2.4rem] lg:text-[min(3.6vw,6.8vh)] text-[#d9a544] [text-shadow:0_0_40px_rgba(217,165,68,0.3)]">
                    {p.keep}
                  </span>
                  <span className="font-[family-name:var(--font-script)] text-[#f0c46c] text-[2rem] lg:text-[min(2.4vw,4.4vh)] leading-none">
                    {p.join}
                  </span>
                  <span className="relative font-[family-name:var(--font-wide)] font-extrabold uppercase leading-none tracking-[-0.02em] text-[1.5rem] lg:text-[min(2vw,3.8vh)] text-[#050505] [-webkit-text-stroke:1.3px_rgba(246,239,228,0.5)] [paint-order:stroke_fill]">
                    {p.over}
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 origin-left rounded-full bg-[#d9a544] shadow-[0_0_12px_rgba(217,165,68,0.8)] transition-transform duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] delay-200 ${
                        on ? "scale-x-100" : "lg:scale-x-0"
                      }`}
                    />
                  </span>
                </h3>
                <p className="mt-3 lg:mt-[1.8vh] max-w-[46ch] text-[1rem] lg:text-[min(1.02vw,1.9vh)] leading-[1.6] text-[#f6efe4]/90">{p.body}</p>
              </article>
            );
          })}
        </div>
      </div>

      {/* ── THE RING AROUND HIM ── */}
      <div
        aria-hidden="true"
        className="relative mt-16 h-[120vw] max-h-[720px] lg:mt-0 lg:absolute lg:left-[38%] lg:right-0 lg:inset-y-0 lg:h-auto lg:max-h-none [perspective:1500px] [perspective-origin:50%_40%]"
      >
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {/* Rayansh — a flat plane at the centre, so cards sort in front of / behind him */}
          <div
            ref={slotRef}
            data-person
            className="absolute left-1/2 bottom-0 h-[86%] aspect-[500/710] -translate-x-1/2 [transform:translateZ(0px)]"
          >
            <div ref={flyerRef} className="absolute inset-0 will-change-transform [backface-visibility:hidden]">
              <div data-bob className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]">
                <Image
                  src="/rayansh-hero.png"
                  alt=""
                  width={500}
                  height={710}
                  quality={100}
                  className="w-full h-full object-contain object-[center_bottom] [filter:brightness(1.05)_contrast(1.06)]"
                />
              </div>
            </div>
          </div>

          {/* the ring */}
          <div
            ref={ringRef}
            className="max-lg:hidden absolute left-1/2 top-[45%] w-0 h-0 [transform-style:preserve-3d] [transform:rotateX(-13deg)_rotateZ(-6deg)]"
          >
            {Array.from({ length: N }, (_, i) => {
              const p = PRINCIPLES[i % PRINCIPLES.length];
              const k = i % PRINCIPLES.length;
              const on = active === k && i < PRINCIPLES.length;
              return (
                <div
                  key={i}
                  data-ringcard
                  className={`absolute left-0 top-0 w-[44vw] h-[56vw] lg:w-[min(11.2vw,19.6vh)] lg:h-[min(15vw,26.2vh)] -ml-[22vw] -mt-[28vw] lg:-ml-[min(5.6vw,9.8vh)] lg:-mt-[min(7.5vw,13.1vh)] [transform-style:preserve-3d] ${
                    [
                      "[transform:rotateY(0deg)_translateZ(min(28vw,50vh))]",
                      "[transform:rotateY(36deg)_translateZ(min(28vw,50vh))]",
                      "[transform:rotateY(72deg)_translateZ(min(28vw,50vh))]",
                      "[transform:rotateY(108deg)_translateZ(min(28vw,50vh))]",
                      "[transform:rotateY(144deg)_translateZ(min(28vw,50vh))]",
                      "[transform:rotateY(180deg)_translateZ(min(28vw,50vh))]",
                      "[transform:rotateY(216deg)_translateZ(min(28vw,50vh))]",
                      "[transform:rotateY(252deg)_translateZ(min(28vw,50vh))]",
                      "[transform:rotateY(288deg)_translateZ(min(28vw,50vh))]",
                      "[transform:rotateY(324deg)_translateZ(min(28vw,50vh))]",
                    ][i]
                  }`}
                >
                  <div
                    data-face
                    className={`absolute inset-0 overflow-hidden rounded-[12px] border p-[9%] flex flex-col bg-[#0a0806] [backface-visibility:hidden] transition-[border-color,box-shadow] duration-700 ${
                      on
                        ? "border-[#d9a544] shadow-[0_0_70px_rgba(217,165,68,0.45),inset_0_1px_0_rgba(255,230,170,0.5)]"
                        : "border-[#d9a544]/25 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                    }`}
                  >
                    {/* the photograph, in one black-and-gold grade */}
                    <Image
                      src={p.img}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 14vw, 50vw"
                      className={`object-cover transition-[filter,scale] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        on
                          ? "scale-[1.06] [filter:sepia(0.3)_saturate(1.05)_brightness(1.08)_contrast(1.05)]"
                          : "[filter:grayscale(0.75)_sepia(0.45)_brightness(0.6)_contrast(1.08)]"
                      }`}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,5,5,0.95)_0%,rgba(5,5,5,0.55)_42%,rgba(5,5,5,0.1)_70%,rgba(5,5,5,0.35)_100%)]" />
                    <div className="absolute -inset-[40%] bg-[linear-gradient(115deg,transparent_42%,rgba(255,255,255,0.08)_50%,transparent_58%)]" />
                    <span className="relative self-start rounded-full border border-[#d9a544]/50 bg-[#050505]/60 px-[0.6em] py-[0.2em] text-[0.8rem] lg:text-[min(0.66vw,1.2vh)] font-semibold tracking-[0.2em] text-[#d9a544]">
                      {pad(k + 1)}
                    </span>
                    <span
                      className={`relative mt-auto font-[family-name:var(--font-wide)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-[1.6rem] lg:text-[min(1.25vw,2.2vh)] ${
                        on ? "text-[#f0c46c]" : "text-[#f6efe4]"
                      }`}
                    >
                      {p.keep}
                    </span>
                    <span className="relative mt-[6%] text-[0.85rem] lg:text-[min(0.72vw,1.3vh)] text-[#f6efe4]/75">
                      <span className="font-[family-name:var(--font-script)] text-[#d9a544] text-[1.3em]">{p.join}</span> {p.over}
                    </span>
                    <span className={`relative mt-[8%] block h-[2px] rounded-full origin-left transition-transform duration-700 bg-[#d9a544] ${on ? "scale-x-100" : "scale-x-25"}`} />
                  </div>
                  {/* the back of the card, seen through the ring */}
                  <div
                    data-face
                    className="absolute inset-0 grid place-items-center rounded-[10px] border border-[#d9a544]/20 bg-[linear-gradient(200deg,rgba(28,23,15,0.95)_0%,rgba(9,8,6,0.97)_70%)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
                  >
                    <span className="font-[family-name:var(--font-wide)] font-extrabold text-[min(1.4vw,2.5vh)] tracking-[0.1em] text-[#d9a544]/45">RS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── PROGRESS ── */}
      <div className="hidden lg:block absolute z-30 left-[4.5%] right-[4.5%] bottom-[5.5%]">
        <div className="relative h-[2px] rounded-full bg-[#f6efe4]/10 overflow-hidden">
          <span data-rail className="absolute inset-0 origin-left scale-x-0 bg-[linear-gradient(90deg,#b9852c,#f0c46c)] shadow-[0_0_10px_rgba(240,196,108,0.7)]" />
        </div>
        <ol className="mt-[1.6vh] flex justify-between" aria-label="Principles">
          {PRINCIPLES.map((p, i) => (
            <li
              key={p.keep}
              aria-current={active === i ? "step" : undefined}
              className={`flex items-center gap-2 text-[min(0.78vw,1.45vh)] uppercase tracking-[0.2em] transition-colors duration-500 ${
                active === i ? "text-[#f6efe4]" : i < active ? "text-[#f6efe4]/60" : "text-[#f6efe4]/30"
              }`}
            >
              <span className={`font-semibold ${i <= active ? "text-[#d9a544]" : "text-[#d9a544]/40"}`}>{pad(i + 1)}</span>
              {p.keep}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
