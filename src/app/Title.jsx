"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ─────────────────────────────────────────────────────────────
   SECTION 02 — THE PERSON BEHIND THE WORK
   The hero portrait travels into this section on scroll: the
   image below IS the landing slot; on desktop a scrubbed
   transform carries it from the hero's exact position to here.
   ───────────────────────────────────────────────────────────── */

const COLLAGE = [
  {
    key: "mountain",
    role: 2,
    src: "/mood/collage-mountain.jpg",
    alt: "Rayansh standing before a mountain peak",
    w: 145,
    h: 165,
    depth: 0.6,
    speed: -14,
    from: { x: -60, y: -40, rotation: -9 },
    pos: "left-[2%] top-[0%] w-[44%] h-[36%] z-10 lg:left-[35.6%] lg:top-[7.4%] lg:w-[14.4%] lg:h-[29.3%]",
  },
  {
    key: "book",
    role: 1,
    src: "/mood/collage-book.jpg",
    alt: "A Suitcase of Memories, the book by Rayansh Singh",
    w: 88,
    h: 130,
    depth: 1,
    speed: -22,
    from: { x: 70, y: -30, rotation: 8 },
    pos: "left-[70%] top-[4%] w-[28%] h-[30%] z-10 lg:left-[54.7%] lg:top-[19.7%] lg:w-[8.7%] lg:h-[21.9%]",
  },
  {
    key: "gloves",
    role: 3,
    src: "/mood/collage-gloves.jpg",
    alt: "Boxing gloves hanging on a wall",
    w: 75,
    h: 95,
    depth: 1.3,
    speed: -8,
    from: { x: 80, y: 10, rotation: 6 },
    pos: "left-[72%] top-[38%] w-[26%] h-[24%] z-10 lg:left-[55.3%] lg:top-[43.6%] lg:w-[9.3%] lg:h-[18.6%]",
  },
  {
    key: "london",
    role: 2,
    src: "/mood/collage-london.jpg",
    alt: "Big Ben and Westminster Bridge, London",
    w: 80,
    h: 95,
    depth: 0.9,
    speed: 10,
    from: { x: 60, y: 50, rotation: -5 },
    pos: "left-[0%] top-[42%] w-[24%] h-[24%] z-10 lg:left-[56.2%] lg:top-[62.2%] lg:w-[8.1%] lg:h-[17.5%]",
  },
  {
    key: "passport",
    role: 2,
    src: "/mood/collage-passport.jpg",
    alt: "A passport resting on a world map",
    w: 165,
    h: 115,
    depth: 1.6,
    speed: 16,
    from: { x: -40, y: 70, rotation: -14 },
    pos: "left-[4%] top-[80%] w-[46%] h-[20%] z-10 -rotate-[4deg] lg:left-[38%] lg:top-[78%] lg:w-[16.2%] lg:h-[22%]",
  },
];

const ROLES = [
  {
    n: "01",
    title: "The Founder",
    src: "/mood/thumb-founder.jpg",
    alt: "Rayansh working on a laptop",
    body: "I founded Socialsect to help private medical practices grow through the right strategy, marketing, technology, and creative solutions.",
  },
  {
    n: "02",
    title: "The Author",
    src: "/mood/thumb-author.jpg",
    alt: "The book A Suitcase of Memories",
    body: "I wrote A Suitcase of Memories, a book inspired by the people, places, and experiences that shape who we become.",
  },
  {
    n: "03",
    title: "The Traveller",
    src: "/mood/thumb-traveller.jpg",
    alt: "Sunset over the clouds from an aeroplane window",
    body: "Building Socialsect across India, the US, and the UK has taught me that understanding people matters more than simply understanding markets.",
  },
  {
    n: "04",
    title: "The Boxer",
    src: "/mood/thumb-boxer.jpg",
    alt: "Rayansh in boxing gloves",
    body: "Boxing taught me discipline, resilience, and the importance of overcoming personal challenges.",
  },
];

const PORTRAIT_RATIO = 500 / 710;

export default function Title() {
  const sectionRef = useRef(null);
  const slotRef = useRef(null);
  const flyerRef = useRef(null);
  // -1 = no story running (everything lit); 0..3 = the role being told
  const [step, setStep] = useState(-1);
  const on = (i) => step === -1 || step === i;

  useEffect(() => {
    let mm;
    let cancelled = false;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const q = (sel) => gsap.utils.toArray(sel, section);
      mm = gsap.matchMedia(section);

      mm.add(
        {
          desktop: "(min-width: 1024px)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { desktop, motion } = ctx.conditions;
          if (!motion) return;

          /* ── 1. THE FLIGHT: hero portrait → this section ───────── */
          let removeFlight = () => {};
          const heroStage = document.querySelector("[data-hero-portrait]");
          const flyer = flyerRef.current;

          if (desktop && heroStage && flyer) {
            const heroWrap = heroStage.parentElement;
            const proxy = { p: 0 };
            let m = { dx: 0, dy: 0, s: 1 };
            const easeX = gsap.parseEase("power2.inOut");
            const easeS = gsap.parseEase("power1.inOut");

            const measure = () => {
              const sy = window.scrollY;
              const wrapY = Number(gsap.getProperty(heroWrap, "y")) || 0;
              const r = heroStage.getBoundingClientRect();
              // the hero image is object-contain, bottom-centred inside its stage
              const w = Math.min(r.width, r.height * PORTRAIT_RATIO);
              const h = w / PORTRAIT_RATIO;
              const hx = r.left + (r.width - w) / 2;
              const hy = r.top + sy - wrapY + (r.height - h);
              const s = slotRef.current.getBoundingClientRect();
              m = { dx: hx - s.left, dy: hy - (s.top + sy), s: h / s.height };
            };

            // Per frame only transform + opacity change (compositor-only, no repaint):
            // the colour and graded layers carry static filters and simply crossfade.
            const grade = flyer.querySelector("[data-grade]");
            const setX = gsap.quickSetter(flyer, "x", "px");
            const setY = gsap.quickSetter(flyer, "y", "px");
            // "scale" is an alias quickSetter cannot expand: drive both axes explicitly
            const setSX = gsap.quickSetter(flyer, "scaleX");
            const setSY = gsap.quickSetter(flyer, "scaleY");
            const setScale = (v) => {
              setSX(v);
              setSY(v);
            };
            const setRot = gsap.quickSetter(flyer, "rotation", "deg");
            const setGrade = gsap.quickSetter(grade, "opacity");
            let wasFlying = null;

            const apply = () => {
              const p = proxy.p;
              setX(m.dx * (1 - easeX(p)));
              setY(m.dy * (1 - p));
              setScale(m.s + (1 - m.s) * easeS(p));
              setRot(Math.sin(Math.PI * p) * -3);
              setGrade(gsap.utils.clamp(0, 1, (p - 0.3) / 0.6));
              const flying = p > 0.001;
              if (flying !== wasFlying) {
                wasFlying = flying;
                heroStage.style.visibility = flying ? "hidden" : "";
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
                start: 0,
                end: "top top",
                scrub: true,
                invalidateOnRefresh: true,
                onRefreshInit: () => {
                  wasFlying = null;
                  heroStage.style.visibility = "";
                },
                onRefresh: () => {
                  measure();
                  apply();
                },
              },
            });

            removeFlight = () => {
              flight.scrollTrigger?.kill();
              flight.kill();
              heroStage.style.visibility = "";
              flyer.style.visibility = "";
              gsap.set(flyer, { clearProps: "all" });
              gsap.set(grade, { clearProps: "opacity" });
            };
          }

          /* ── 1b. THE STORY: pin the section, walk through the 4 roles ─ */
          let removeStory = () => {};
          if (desktop) {
            const fills = q("[data-fill]");
            const setFill = fills.map((f) => gsap.quickSetter(f, "scaleX"));
            let cur = -2;
            const go = (sIdx) => {
              if (sIdx !== cur) {
                cur = sIdx;
                setStep(sIdx);
              }
            };
            const reset = () => {
              go(-1);
              setFill.forEach((f) => f(1));
            };
            const n = ROLES.length;
            const story = ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: () => "+=" + window.innerHeight * 3.2,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (!self.isActive) return;
                const prog = self.progress * n;
                const sIdx = Math.min(n - 1, Math.floor(prog));
                const local = Math.min(1, prog - sIdx);
                go(sIdx);
                setFill.forEach((f, i) => f(i < sIdx ? 1 : i === sIdx ? local : 0));
              },
              onLeave: reset,
              onLeaveBack: reset,
            });
            removeStory = () => {
              story.kill(true);
              reset();
            };
          }

          /* ── 2. ENTRANCE: the collage assembles as he lands ────── */
          const lines = q("[data-line]");
          const fades = q("[data-fade]");
          const rules = q("[data-rule]");
          const pieces = q("[data-piece-inner]");
          const rows = q("[data-row]");
          const thumbs = q("[data-thumb]");
          const script = q("[data-script]");
          const stroke = q("[data-stroke]");

          gsap.set(lines, { yPercent: 110 });
          gsap.set(fades, { opacity: 0, y: 24 });
          gsap.set(rules, { scaleX: 0, transformOrigin: "0 50%" });
          pieces.forEach((el, i) => {
            gsap.set(el, { ...COLLAGE[i].from, opacity: 0, scale: 0.86 });
          });
          gsap.set(rows, { opacity: 0, x: 40 });
          gsap.set(thumbs, { clipPath: "inset(0 100% 0 0)" });
          // generous inset box so the script swashes are never cropped
          gsap.set(script, { clipPath: "inset(-40% 100% -40% -25%)" });
          stroke.forEach((p) => {
            const len = p.getTotalLength();
            gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
          });

          const tl = gsap.timeline({
            defaults: { ease: "expo.out" },
            scrollTrigger: { trigger: section, start: "top 55%", once: true },
          });
          tl.to(rules, { scaleX: 1, duration: 1.1, stagger: 0.06, ease: "power3.inOut" }, 0)
            .to(lines, { yPercent: 0, duration: 1.2, stagger: 0.1 }, 0.05)
            .to(fades, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "power3.out" }, 0.35)
            .to(
              pieces,
              { x: 0, y: 0, rotation: 0, opacity: 1, scale: 1, duration: 1.5, stagger: 0.09 },
              0.15
            )
            .to(rows, { opacity: 1, x: 0, duration: 1.1, stagger: 0.12, ease: "power3.out" }, 0.4)
            .to(thumbs, { clipPath: "inset(0 0% 0 0)", duration: 1.2, stagger: 0.12, ease: "power3.inOut" }, 0.45)
            .to(
              script,
              {
                clipPath: "inset(-40% -25% -40% -25%)",
                duration: 1.6,
                ease: "power2.inOut",
                onComplete: () => gsap.set(script, { clearProps: "clipPath" }),
              },
              0.9
            )
            .to(stroke, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 1.7);

          /* ── 3. DEPTH: scroll parallax + mouse drift on the collage ─ */
          const outers = q("[data-piece]");
          outers.forEach((el, i) => {
            gsap.to(el, {
              yPercent: COLLAGE[i].speed,
              ease: "none",
              scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
            });
          });

          let removeMouse = () => {};
          if (desktop) {
            const mids = q("[data-piece-mid]");
            const movers = mids.map((el) => ({
              x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
              y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
            }));
            const onMove = (e) => {
              const r = section.getBoundingClientRect();
              const nx = (e.clientX - r.left) / r.width - 0.5;
              const ny = (e.clientY - r.top) / r.height - 0.5;
              movers.forEach((mv, i) => {
                mv.x(nx * 26 * COLLAGE[i].depth);
                mv.y(ny * 18 * COLLAGE[i].depth);
              });
            };
            const onLeave = () => movers.forEach((mv) => (mv.x(0), mv.y(0)));
            section.addEventListener("mousemove", onMove);
            section.addEventListener("mouseleave", onLeave);
            removeMouse = () => {
              section.removeEventListener("mousemove", onMove);
              section.removeEventListener("mouseleave", onLeave);
            };
          }

          const onLoad = () => ScrollTrigger.refresh();
          if (document.readyState !== "complete") window.addEventListener("load", onLoad, { once: true });

          return () => {
            removeFlight();
            removeStory();
            removeMouse();
            window.removeEventListener("load", onLoad);
          };
        }
      );
    };

    init();
    return () => {
      cancelled = true;
      mm?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="about-title"
      className="relative z-10 w-full overflow-x-clip bg-[radial-gradient(ellipse_at_42%_60%,#14100a_0%,#070605_55%,#050505_100%)] text-[#ede7dc] px-6 pt-20 pb-24 sm:px-10 lg:p-0 lg:h-screen lg:min-h-[700px]"
    >
      {/* ── LEFT: statement ── */}
      <div className="relative z-30 lg:absolute lg:left-[4%] lg:top-[7%] lg:w-[31%]">
        <div className="flex items-center gap-4 lg:gap-[1.6vw]" data-fade>
          <span className="text-[0.95rem] lg:text-[min(1.1vw,2vh)] tracking-[0.18em] text-[#ede7dc]">02</span>
          <span data-rule className="block h-px w-14 lg:w-[5vw] bg-[#d9a544]" />
          <span className="text-[0.62rem] lg:text-[min(0.78vw,1.45vh)] tracking-[0.32em] uppercase text-[#ede7dc]/85">
            The person behind the work
          </span>
        </div>

        <h2
          id="about-title"
          className="mt-8 lg:mt-[6vh] font-[family-name:var(--font-display)] uppercase font-normal text-[3.4rem] sm:text-[4.6rem] lg:text-[min(6.4vw,11.6vh)] leading-[0.95] tracking-[-0.005em] text-[#f4efe6] [text-shadow:0_10px_40px_rgba(0,0,0,0.9)]"
        >
          <span className="block overflow-hidden pb-[0.04em]">
            <span data-line className="block">I&rsquo;m more</span>
          </span>
          <span className="block overflow-hidden pb-[0.04em]">
            <span data-line className="block">
              than a <span className="text-[#d9a544]">title.</span>
            </span>
          </span>
        </h2>

        <span data-rule className="mt-7 lg:mt-[4.2vh] block h-[2px] w-12 lg:w-[3.6vw] bg-[#d9a544]" />

        <div className="mt-6 lg:mt-[3vh] max-w-[40ch] space-y-5 lg:space-y-[2.6vh] text-[1rem] lg:text-[min(1.08vw,2vh)] leading-[1.55] text-[#ede7dc]">
          <p data-fade>
            I&rsquo;m Rayansh Singh — founder of Socialsect, a writer, a traveller, and a boxer.
          </p>
          <p data-fade>
            I believe the best work starts with understanding people, staying curious, and having
            the courage to do things differently.
          </p>
        </div>

        <div className="relative mt-10 ml-4 lg:mt-[9vh] lg:ml-[2.4vw] w-fit -rotate-[9deg] origin-left">
          <p
            data-script
            className="font-[family-name:var(--font-script)] text-[#d9a544] text-[2.6rem] lg:text-[min(3vw,5.6vh)] leading-[0.95] whitespace-nowrap"
          >
            Different paths.
            <br />
            <span className="pl-[0.4em]">Same purpose.</span>
          </p>
          <svg
            viewBox="0 0 220 30"
            className="absolute -left-[6%] -bottom-[18%] w-[112%] h-auto overflow-visible"
            aria-hidden="true"
          >
            <path
              data-stroke
              d="M2 26 C 60 14, 140 6, 218 2"
              fill="none"
              stroke="#d9a544"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* ── CENTRE: collage + the portrait that lands from the hero ── */}
      <div className="relative mt-16 h-[125vw] max-h-[760px] sm:h-[100vw] lg:mt-0 lg:absolute lg:inset-0 lg:h-auto lg:max-h-none">
        {COLLAGE.map((c) => (
          <div key={c.key} data-piece className={`absolute will-change-transform ${c.pos}`}>
            <div data-piece-mid className="w-full h-full">
              <div
                data-piece-inner
                data-cursor-hover
                className="group relative w-full h-full overflow-hidden bg-[#111] shadow-[0_18px_40px_rgba(0,0,0,0.7)]"
              >
                <Image
                  src={c.src}
                  alt={c.alt}
                  width={c.w}
                  height={c.h}
                  sizes="(min-width: 1024px) 16vw, 45vw"
                  className={`w-full h-full object-cover transition-[transform,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07] group-hover:[filter:grayscale(0.2)_sepia(0.1)_brightness(1.05)] ${
                    step === c.role
                      ? "scale-[1.1] [filter:saturate(1.35)_brightness(1.12)_contrast(1.08)]"
                      : "[filter:grayscale(0.85)_sepia(0.2)_brightness(0.92)]"
                  }`}
                />
                {/* warm colour grade: tints the (monochrome) photo into the gold palette */}
                <div
                  className={`absolute inset-0 pointer-events-none mix-blend-color bg-[linear-gradient(160deg,#e9b75a_0%,#b8742e_55%,#5e3a1c_100%)] transition-opacity duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    step === c.role ? "opacity-[0.62]" : "opacity-0"
                  }`}
                />
                {/* light sweep across the picture as it comes alive */}
                <div
                  className={`absolute inset-y-0 left-0 w-[70%] pointer-events-none bg-[linear-gradient(100deg,transparent_0%,rgba(255,232,180,0.38)_50%,transparent_100%)] ${
                    step === c.role
                      ? "translate-x-[180%] transition-[translate] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                      : "-translate-x-[110%] transition-none"
                  }`}
                />
                {/* gold edge on the lit picture */}
                <div
                  className={`absolute inset-0 pointer-events-none shadow-[inset_0_0_0_1px_rgba(217,165,68,0.75),inset_0_0_40px_rgba(217,165,68,0.18)] transition-opacity duration-[900ms] ${
                    step === c.role ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Landing slot — same aspect ratio as the hero cutout */}
        <div
          ref={slotRef}
          data-story-portrait
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[94%] aspect-[500/710] z-20 pointer-events-none lg:left-[43%] lg:h-[84%]`}
        >
          <div
            ref={flyerRef}
            className="relative w-full h-full will-change-transform [backface-visibility:hidden]"
          >
            {/* colour layer — matches the hero grade; hidden while another role is told */}
            <div
              className={`absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                step >= 1 ? "opacity-0" : "opacity-100"
              }`}
            >
            <Image
              src="/rayansh-hero.png"
              alt="Rayansh Singh"
              width={500}
              height={710}
              quality={100}
              className="absolute inset-0 w-full h-full object-contain object-[center_bottom] [filter:brightness(1.05)_contrast(1.06)]"
            />
            </div>
            {/* monochrome layer — fades in as he lands; lifts away while The Founder is told */}
            <div
              className={`absolute inset-0 transition-opacity duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                step === 0 ? "opacity-0" : "opacity-100"
              }`}
            >
            <Image
              data-grade
              src="/rayansh-hero.png"
              alt=""
              aria-hidden="true"
              width={500}
              height={710}
              quality={100}
              className="absolute inset-0 w-full h-full object-contain object-[center_bottom] will-change-[opacity] [filter:grayscale(0.92)_sepia(0.18)_brightness(0.98)_contrast(1.12)]"
            />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[14%] bg-[linear-gradient(to_top,#050505_0%,rgba(5,5,5,0.85)_40%,transparent_100%)]" />
          </div>
        </div>
      </div>

      {/* ── RIGHT: the four roles ── */}
      <ol className="relative z-30 mt-20 flex flex-col gap-10 lg:mt-0 lg:gap-0 lg:absolute lg:left-[67.3%] lg:top-[11%] lg:bottom-[13%] lg:w-[29%] lg:justify-between">
        {ROLES.map((r, i) => (
          <li
            key={r.n}
            data-row
            data-cursor-hover
            aria-current={step === i ? "step" : undefined}
            className="group flex items-start gap-5 lg:gap-[1.3vw]"
          >
            <div
              data-thumb
              className={`relative shrink-0 w-[38%] max-w-[180px] aspect-[170/150] overflow-hidden bg-[#111] transition-[opacity,box-shadow] duration-700 lg:w-auto lg:max-w-none lg:h-[min(16vh,9vw)] ${
                step === i ? "shadow-[0_0_0_1px_rgba(217,165,68,0.7),0_18px_50px_rgba(217,165,68,0.18)]" : ""
              }`}
            >
              <Image
                src={r.src}
                alt={r.alt}
                width={95}
                height={95}
                sizes="(min-width: 1024px) 11vw, 38vw"
                className={`w-full h-full object-cover transition-[transform,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08] ${
                  step === i
                    ? "scale-[1.1] [filter:brightness(1.08)_contrast(1.04)]"
                    : step === -1
                      ? "[filter:sepia(0.25)_brightness(0.9)]"
                      : "[filter:grayscale(1)]"
                }`}
              />
            </div>
            <div
              className={`pt-1 lg:pt-[1vh] lg:-ml-[0.4vw] min-w-0 transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                step === i ? "lg:translate-x-[0.6vw]" : ""
              } ${on(i) ? "opacity-100" : "opacity-[0.5]"}`}
            >
              <div className="flex items-center gap-4 lg:gap-[1.4vw]">
                <span
                  className={`text-[1rem] lg:text-[min(1.1vw,2.1vh)] tracking-[0.12em] transition-colors duration-500 ${
                    step === i ? "text-[#d9a544]" : "text-[#ede7dc]"
                  }`}
                >
                  {r.n}
                </span>
                {/* progress track: fills while this role is being told */}
                <span className="relative block h-px w-12 lg:w-[3.8vw] overflow-hidden bg-[#d9a544]/25">
                  <span data-fill className="absolute inset-0 bg-[#d9a544] origin-left" />
                </span>
              </div>
              <h3
                className={`mt-2 lg:mt-[1.2vh] text-[1.05rem] lg:text-[min(1.15vw,2.15vh)] font-semibold uppercase tracking-[0.08em] transition-colors duration-500 group-hover:text-[#d9a544] ${
                  step === i ? "text-[#d9a544]" : "text-[#f4efe6]"
                }`}
              >
                {r.title}
              </h3>
              <p className="mt-2 lg:mt-[0.9vh] max-w-[34ch] text-[0.95rem] lg:text-[min(0.86vw,1.62vh)] leading-[1.45] text-[#ede7dc]/85">
                {r.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* ── BOTTOM RIGHT: closing line ── */}
      <div
        data-fade
        className="relative z-30 mt-16 flex items-start gap-5 lg:mt-0 lg:absolute lg:left-[55%] lg:top-[89.5%] lg:gap-[1.2vw]"
      >
        <span data-rule className="mt-[0.5em] block h-[2px] w-12 lg:w-[3.4vw] shrink-0 bg-[#d9a544]" />
        <p className="text-[0.66rem] lg:text-[min(0.72vw,1.35vh)] uppercase tracking-[0.24em] leading-[1.9] text-[#ede7dc]">
          Different experiences.
          <br />
          One way of thinking. A belief in building something that matters.
        </p>
      </div>
    </section>
  );
}
