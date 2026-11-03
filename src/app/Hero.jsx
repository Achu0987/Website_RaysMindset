"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Glide to Section 2 through Lenis (falls back to native smooth scroll)
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function goToAbout() {
  const el = document.getElementById("about");
  if (!el) return;
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(el, { duration: 1.8, easing: easeInOutCubic, lock: true });
  else el.scrollIntoView({ behavior: "smooth" });
}

export default function Hero() {
  const sectionRef = useRef(null);
  const overlayRef = useRef(null);
  const navRef = useRef(null);
  const portraitWrapRef = useRef(null);
  const portraitImgRef = useRef(null);
  const headlineRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const eyebrowRef = useRef(null);
  const bioRef = useRef(null);
  const metaRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const scrollTextRef = useRef(null);
  const spotlightRef = useRef(null);

  // Custom magnetic cursor refs
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);

  // Live Dubai time for editorial authenticity
  const [dubaiTime, setDubaiTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Dubai",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(new Date());
        setDubaiTime(timeStr);
      } catch {
        setDubaiTime("03:30 PM");
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let ctx;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const prefersReduced =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // ── WOW-LEVEL CUSTOM INTERACTIVE CURSOR ─────────────────────────
      const dot = cursorDotRef.current;
      const ring = cursorRingRef.current;

      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let ringX = mouseX;
      let ringY = mouseY;
      let isHovering = false;

      const onMouseMoveCursor = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (dot) {
          gsap.set(dot, { x: mouseX, y: mouseY, opacity: 1 });
        }
      };

      const onMouseEnterWindow = () => {
        if (dot) gsap.to(dot, { opacity: 1, duration: 0.2 });
        if (ring) gsap.to(ring, { opacity: 1, duration: 0.2 });
      };

      const onMouseLeaveWindow = () => {
        if (dot) gsap.to(dot, { opacity: 0, duration: 0.3 });
        if (ring) gsap.to(ring, { opacity: 0, duration: 0.3 });
      };

      // Smooth lag animation loop for the outer follower ring
      let animFrameId;
      const renderCursor = () => {
        // Linear interpolation for smooth trailing weight
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;

        if (ring) {
          gsap.set(ring, {
            x: ringX,
            y: ringY,
          });
        }
        animFrameId = requestAnimationFrame(renderCursor);
      };
      animFrameId = requestAnimationFrame(renderCursor);

      // Attach hover expansion to interactive elements
      const interactiveTargets = document.querySelectorAll(
        "a, button, [data-cursor-hover]"
      );

      const handleElementHover = () => {
        isHovering = true;
        if (ring) {
          gsap.to(ring, {
            scale: 2.3,
            borderColor: "rgba(237, 231, 220, 0.75)",
            backgroundColor: "rgba(237, 231, 220, 0.08)",
            duration: 0.35,
            ease: "power2.out",
          });
        }
        if (dot) {
          gsap.to(dot, {
            scale: 0.4,
            duration: 0.25,
            ease: "power2.out",
          });
        }
      };

      const handleElementLeave = () => {
        isHovering = false;
        if (ring) {
          gsap.to(ring, {
            scale: 1,
            borderColor: "rgba(237, 231, 220, 0.35)",
            backgroundColor: "transparent",
            duration: 0.35,
            ease: "power2.out",
          });
        }
        if (dot) {
          gsap.to(dot, {
            scale: 1,
            duration: 0.25,
            ease: "power2.out",
          });
        }
      };

      interactiveTargets.forEach((el) => {
        el.addEventListener("mouseenter", handleElementHover);
        el.addEventListener("mouseleave", handleElementLeave);
      });

      window.addEventListener("mousemove", onMouseMoveCursor);
      document.addEventListener("mouseenter", onMouseEnterWindow);
      document.addEventListener("mouseleave", onMouseLeaveWindow);

      if (prefersReduced) {
        gsap.set(
          [
            navRef.current,
            portraitWrapRef.current,
            line1Ref.current,
            line2Ref.current,
            eyebrowRef.current,
            bioRef.current,
            metaRef.current,
            scrollIndicatorRef.current,
            spotlightRef.current,
          ],
          { opacity: 1, y: 0 }
        );
        if (overlayRef.current) overlayRef.current.style.opacity = "0";
        return;
      }

      ctx = gsap.context(() => {
        // Initial hidden states
        gsap.set(overlayRef.current, { opacity: 1 });
        gsap.set(navRef.current, { opacity: 0, y: -24 });
        gsap.set(spotlightRef.current, { opacity: 0, scale: 0.85 });
        gsap.set(portraitWrapRef.current, { opacity: 0, y: 30 });
        gsap.set(portraitImgRef.current, { scale: 1.08 });
        gsap.set(line1Ref.current, { y: "115%", opacity: 0 });
        gsap.set(line2Ref.current, { y: "115%", opacity: 0 });
        gsap.set(eyebrowRef.current, { opacity: 0, y: 14 });
        gsap.set(bioRef.current, { opacity: 0, y: 18 });
        gsap.set(metaRef.current, { opacity: 0, y: 24 });
        gsap.set(scrollIndicatorRef.current, { opacity: 0, scale: 0.8 });

        // Master cinematic entrance timeline
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // 1. Black curtain dissolves
        tl.to(overlayRef.current, { opacity: 0, duration: 1.2 }, 0.1);

        // 2. Studio rim light / ambient spotlight blooms
        tl.to(
          spotlightRef.current,
          { opacity: 1, scale: 1, duration: 1.8, ease: "power2.out" },
          0.3
        );

        // 3. Navigation glides in
        tl.to(navRef.current, { opacity: 1, y: 0, duration: 1.0 }, 0.45);

        // 4. Portrait of Rayansh enters with studio clarity
        tl.to(
          portraitWrapRef.current,
          { opacity: 1, y: 0, duration: 1.4, ease: "expo.out" },
          0.6
        );
        tl.to(
          portraitImgRef.current,
          { scale: 1, duration: 1.8, ease: "power2.out" },
          0.6
        );

        // 5. Eyebrow badge reveals
        tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.9);

        // 6. Giant typography drops in with authoritative stagger
        tl.to(
          line1Ref.current,
          { y: "0%", opacity: 1, duration: 1.2, ease: "expo.out" },
          1.0
        );
        tl.to(
          line2Ref.current,
          { y: "0%", opacity: 1, duration: 1.2, ease: "expo.out" },
          1.18
        );

        // 7. Verified bio & context
        tl.to(bioRef.current, { opacity: 1, y: 0, duration: 0.9 }, 1.45);

        // 8. Bottom editorial metadata
        tl.to(
          metaRef.current,
          { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" },
          1.65
        );

        // 9. Scroll indicator badge
        tl.to(
          scrollIndicatorRef.current,
          { opacity: 1, scale: 1, duration: 0.8 },
          1.85
        );

        // Parallax on scroll
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
          onUpdate: (self) => {
            const p = self.progress;
            if (portraitWrapRef.current) {
              gsap.set(portraitWrapRef.current, { y: p * -90 });
            }
            if (headlineRef.current) {
              gsap.set(headlineRef.current, { y: p * 45 });
            }
          },
        });

      }, sectionRef);

      // Smooth auto-scroll from Hero to Section 2 on mouse wheel down
      let isAutoScrolling = false;
      const handleWheelAutoScroll = (e) => {
        if (isAutoScrolling) return;
        if (e.deltaY > 30 && window.scrollY < 80) {
          isAutoScrolling = true;
          goToAbout();
          setTimeout(() => {
            isAutoScrolling = false;
          }, 1900);
        }
      };
      window.addEventListener("wheel", handleWheelAutoScroll, { passive: true });

      return () => {
        window.removeEventListener("wheel", handleWheelAutoScroll);
        window.removeEventListener("mousemove", onMouseMoveCursor);
        document.removeEventListener("mouseenter", onMouseEnterWindow);
        document.removeEventListener("mouseleave", onMouseLeaveWindow);
        cancelAnimationFrame(animFrameId);
        interactiveTargets.forEach((el) => {
          el.removeEventListener("mouseenter", handleElementHover);
          el.removeEventListener("mouseleave", handleElementLeave);
        });
      };
    };

    init();

    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-dvh bg-[radial-gradient(circle_at_65%_35%,#13100b_0%,#080808_70%)] overflow-x-clip flex flex-col justify-between"
      aria-label="Rayansh Singh Portfolio Hero"
    >
      {/* ── WOW-LEVEL CUSTOM MAGNETIC CURSOR ── */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-[6px] h-[6px] bg-[#d9a544] rounded-full pointer-events-none z-[99999] [transform:translate(-50%,-50%)] opacity-0 will-change-[transform,opacity] shadow-[0_0_12px_rgba(217,165,68,0.95)] pointer-coarse:hidden!"
        aria-hidden="true"
      />
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 w-[38px] h-[38px] rounded-full border border-[rgba(217,165,68,0.45)] pointer-events-none z-[99998] [transform:translate(-50%,-50%)] opacity-0 will-change-[transform,opacity] transition-[width,height,border-color,background-color] duration-300 ease-[ease] pointer-coarse:hidden!"
        aria-hidden="true"
      />

      {/* Black opening curtain */}
      <div ref={overlayRef} className="absolute inset-0 bg-black z-[60] pointer-events-none" />

      {/* Dramatic Studio Spotlight behind Rayansh */}
      <div
        ref={spotlightRef}
        className="absolute top-0 right-0 w-[clamp(480px,58vw,950px)] h-[clamp(480px,85vh,1000px)] bg-[radial-gradient(ellipse_at_60%_45%,rgba(217,165,68,0.16)_0%,rgba(130,95,40,0.08)_42%,rgba(8,8,8,0.02)_70%,transparent_85%)] blur-[40px] pointer-events-none z-[2] will-change-[transform,opacity]"
      />

      {/* ── TOP NAVIGATION BAR ── */}
      <header
        ref={navRef}
        className="relative z-30 flex items-center justify-between py-[clamp(1rem,2.2vh,2rem)] px-[clamp(1.5rem,4vw,4.5rem)] shrink-0 will-change-[transform,opacity] mob:py-[1.2rem] mob:px-[1.4rem]"
      >
        {/* Left: Avatar Thumbnail + Identity */}
        <div className="flex items-center gap-[0.85rem]">
          <div
            data-cursor-hover
            className="relative w-[38px] h-[38px] rounded-full overflow-hidden border border-[rgba(217,165,68,0.35)] shadow-[0_4px_14px_rgba(0,0,0,0.6)] shrink-0"
          >
            <Image
              src="/rayansh-avatar.jpg"
              alt="Rayansh Singh"
              width={38}
              height={38}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div className="flex flex-col gap-[0.12rem]">
            <span className="text-[0.84rem] font-medium tracking-[0.03em] text-[#ede7dc] leading-[1.1]">
              Rayansh Singh
            </span>
            <span className="text-[0.58rem] font-semibold tracking-[0.22em] text-[#d9a544] uppercase leading-[1.1] opacity-[0.85]">
              FOUNDER & STRATEGIST
            </span>
          </div>
        </div>

        {/* Center: Live Availability Pill with Calm Indicator */}
        <div
          data-cursor-hover
          className="flex items-center gap-[0.55rem] py-[0.4rem] px-[1.05rem] bg-[rgba(255,255,255,0.03)] border border-[rgba(217,165,68,0.2)] rounded-[999px] backdrop-blur-[16px] tab:hidden"
        >
          <span className="w-[6px] h-[6px] rounded-full bg-[#22c55e] shadow-[0_0_10px_#22c55e]" />
          <span className="text-[0.62rem] tracking-[0.18em] font-medium uppercase text-[#ede7dc]">
            AVAILABLE FOR VENTURES & ADVISORY
          </span>
        </div>

        {/* Right: Minimal Navigation */}
        <nav className="flex items-center gap-[clamp(1.4rem,2.5vw,2.8rem)]" aria-label="Main menu">
          <a
            href="#work"
            className="text-[0.68rem] tracking-[0.2em] font-medium text-[rgba(237,231,220,0.65)] no-underline uppercase transition-[color] duration-[250ms] ease-[ease] hover:text-[#d9a544] mob:hidden"
          >
            WORK
          </a>
          <a
            href="#about"
            className="text-[0.68rem] tracking-[0.2em] font-medium text-[rgba(237,231,220,0.65)] no-underline uppercase transition-[color] duration-[250ms] ease-[ease] hover:text-[#d9a544] mob:hidden"
          >
            ABOUT
          </a>
          <a
            href="#contact"
            className="text-[0.68rem] tracking-[0.2em] font-medium text-[rgba(237,231,220,0.65)] no-underline uppercase transition-[color] duration-[250ms] ease-[ease] hover:text-[#d9a544] mob:hidden"
          >
            CONTACT
          </a>
          <div className="flex flex-col justify-center gap-[5px] w-[24px] h-[24px] p-0" aria-hidden="true">
            <span className="w-full h-[1.5px] bg-[#d9a544]" />
            <span className="w-full h-[1.5px] bg-[#d9a544]" />
          </div>
        </nav>
      </header>

      {/* ── CINEMATIC PORTRAIT ── */}
      <div
        ref={portraitWrapRef}
        className="absolute top-0 right-[clamp(1rem,4.5vw,6rem)] h-full w-[clamp(360px,48vw,720px)] flex items-end justify-center pointer-events-none z-10 will-change-[transform,opacity] tab:right-0 tab:w-[55vw] tab:opacity-[0.85] mob:right-[-5%] mob:w-[75vw] mob:opacity-[0.65]"
        aria-hidden="true"
      >
        <div
          data-cursor-hover
          data-hero-portrait
          className="relative w-full h-[clamp(480px,78vh,880px)] mb-[clamp(2rem,5vh,5rem)] flex items-end justify-center mob:h-[55vh] mob:mb-[2rem]"
        >
          <Image
            ref={portraitImgRef}
            src="/rayansh-hero.png"
            alt="Rayansh Singh"
            width={500}
            height={710}
            priority
            quality={100}
            className="w-auto! h-full! max-w-full object-contain! object-[center_bottom]! [filter:drop-shadow(0_20px_50px_rgba(0,0,0,0.9))_brightness(1.05)_contrast(1.06)] will-change-transform"
          />
          {/* Subtle bottom fade so his crossed arms melt smoothly into the canvas */}
          <div className="absolute bottom-0 left-0 right-0 h-[clamp(40px,8vh,90px)] bg-[linear-gradient(to_top,#080808_0%,rgba(8,8,8,0.85)_40%,transparent_100%)] pointer-events-none z-[12]" />
          {/* Subtle left-side feather so the massive text breathes */}
          <div className="absolute top-0 bottom-0 left-0 w-[15%] bg-[linear-gradient(to_right,rgba(8,8,8,0.45)_0%,transparent_100%)] pointer-events-none z-[12]" />
        </div>
      </div>

      {/* ── MAIN EDITORIAL CONTENT ── */}
      <div className="relative z-20 px-[clamp(1.5rem,4vw,4.5rem)] flex flex-col justify-center items-start flex-1 max-w-[clamp(580px,68vw,1100px)] my-[clamp(0.5rem,1.5vh,2rem)] mx-0 mob:py-[1.5rem] mob:px-[1.4rem] mob:max-w-full">
        {/* Eyebrow Label */}
        <div
          ref={eyebrowRef}
          className="flex items-center gap-[0.65rem] mb-[clamp(0.4rem,1vh,0.85rem)] will-change-[transform,opacity]"
        >
          <span className="w-[6px] h-[6px] rounded-full bg-[#d9a544] shadow-[0_0_10px_rgba(217,165,68,0.85)] shrink-0" />
          <span className="text-[length:clamp(0.6rem,0.72vw,0.74rem)] tracking-[0.26em] font-semibold text-white uppercase opacity-[0.92]">
            FOUNDER · SOCIALSECT
          </span>
        </div>

        {/* Monumental Headline: RAYANSH SINGH */}
        <div
          ref={headlineRef}
          data-cursor-hover
          className="inline-flex flex-col items-center w-fit mb-[clamp(0.8rem,1.6vh,1.8rem)] will-change-transform mob:items-start"
          aria-label="Rayansh Singh"
        >
          <div className="overflow-hidden leading-[0.88] w-full flex py-[0.05em] mob:justify-start">
            <h1
              ref={line1Ref}
              className="font-[family-name:var(--font-display)] text-[length:clamp(4.6rem,14.8vw,17.5rem)] font-normal leading-[0.85] text-[#d9a544] uppercase tracking-[-0.015em] block text-center will-change-[transform,opacity] [text-shadow:0_10px_40px_rgba(0,0,0,0.95),0_0_70px_rgba(217,165,68,0.25)] tab:text-[length:clamp(3.8rem,13vw,8.5rem)] mob:text-[length:clamp(3.2rem,17vw,5.8rem)] mob:text-left"
            >
              RAYANSH
            </h1>
          </div>
          <div className="overflow-hidden leading-[0.88] w-full flex py-[0.05em] mob:justify-start">
            <h1
              ref={line2Ref}
              className="font-[family-name:var(--font-display)] text-[length:clamp(4.6rem,14.8vw,17.5rem)] font-normal leading-[0.85] text-[#d9a544] uppercase tracking-[-0.015em] block text-center will-change-[transform,opacity] [text-shadow:0_10px_40px_rgba(0,0,0,0.95),0_0_70px_rgba(217,165,68,0.25)] tab:text-[length:clamp(3.8rem,13vw,8.5rem)] mob:text-[length:clamp(3.2rem,17vw,5.8rem)] mob:text-left"
            >
              SINGH
            </h1>
          </div>
        </div>

        {/* Verified Editorial Bio */}
        <p
          ref={bioRef}
          className="text-[length:clamp(0.74rem,0.9vw,0.94rem)] leading-[1.68] text-[rgba(237,231,220,0.65)] tracking-[0.03em] max-w-[42ch] will-change-[transform,opacity] mob:text-[0.78rem] mob:max-w-[34ch]"
        >
          Entrepreneur & growth strategist behind Socialsect —
          building patient acquisition ecosystems across India, the US, UK and Dubai.
          Host of <em className="italic text-[#d9a544] font-medium">One Day with Ray</em>.
        </p>
      </div>

      {/* ── BOTTOM EDITORIAL METADATA BAR ── */}
      <footer
        ref={metaRef}
        className="relative z-[25] flex items-end justify-between py-[clamp(1rem,2vh,1.8rem)] px-[clamp(1.5rem,4vw,4.5rem)] pb-[clamp(1.2rem,2.5vh,2.2rem)] border-t border-[rgba(237,231,220,0.08)] shrink-0 mt-auto will-change-[transform,opacity] mob:py-[1.2rem] mob:px-[1.4rem] mob:pb-[1.8rem]"
      >
        <div className="flex items-end gap-[clamp(1.8rem,4.5vw,6.2rem)] tab:gap-[clamp(1.5rem,3.5vw,3.5rem)] mob:gap-[1.6rem]">
          <div className="flex flex-col gap-[0.3rem]">
            <span className="text-[length:clamp(0.5rem,0.58vw,0.6rem)] tracking-[0.22em] text-[rgba(217,165,68,0.7)] uppercase font-semibold leading-none">
              Selected Works
            </span>
            <span className="text-[length:clamp(0.66rem,0.78vw,0.8rem)] tracking-[0.05em] font-normal text-[#ede7dc] leading-[1.2]">
              Socialsect · Media
            </span>
          </div>
          <div className="flex flex-col gap-[0.3rem]">
            <span className="text-[length:clamp(0.5rem,0.58vw,0.6rem)] tracking-[0.22em] text-[rgba(217,165,68,0.7)] uppercase font-semibold leading-none">
              Currently Operating in
            </span>
            <span className="text-[length:clamp(0.66rem,0.78vw,0.8rem)] tracking-[0.05em] font-normal text-[#ede7dc] leading-[1.2]">
              Dubai, UAE · {dubaiTime || "Live"}
            </span>
          </div>
          <div className="flex flex-col gap-[0.3rem] mob:hidden">
            <span className="text-[length:clamp(0.5rem,0.58vw,0.6rem)] tracking-[0.22em] text-[rgba(217,165,68,0.7)] uppercase font-semibold leading-none">
              Focus & Identity
            </span>
            <span className="text-[length:clamp(0.66rem,0.78vw,0.8rem)] tracking-[0.05em] font-normal text-[#ede7dc] leading-[1.2]">
              Growth Strategist & Host
            </span>
          </div>
        </div>

        {/* Rotating Circular Scroll Indicator Stamp with Auto-Scroll to Section 2 */}
        <div
          ref={scrollIndicatorRef}
          data-cursor-hover
          className="group relative w-[clamp(94px,8.5vw,112px)] h-[clamp(94px,8.5vw,112px)] flex items-center justify-center cursor-pointer rounded-full border border-[rgba(217,165,68,0.45)] bg-[rgba(217,165,68,0.04)] backdrop-blur-[10px] shadow-[0_4px_24px_rgba(0,0,0,0.6),0_0_30px_rgba(217,165,68,0.12)] shrink-0 will-change-[transform,opacity] transition-[border-color,box-shadow,transform] duration-300 ease-[ease] hover:border-[rgba(217,165,68,0.85)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.8),0_0_40px_rgba(217,165,68,0.25)] hover:[transform:scale(1.04)] mob:w-[82px] mob:h-[82px]"
          role="button"
          tabIndex={0}
          aria-label="Scroll to next section"
          onClick={goToAbout}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              goToAbout();
            }
          }}
        >
          <svg
            viewBox="0 0 120 120"
            className="absolute inset-0 w-full h-full overflow-visible origin-center animate-hero-scroll will-change-transform group-hover:[animation-duration:9s]"
            aria-hidden="true"
          >
            <defs>
              {/* Perfectly concentric path: radius 39 with ample buffer inside 60-radius container */}
              <path
                id="heroScrollCirclePath"
                d="M 60,60 m -39,0 a 39,39 0 1,1 78,0 a 39,39 0 1,1 -78,0"
              />
            </defs>
            <text className="text-[7.8px] tracking-[0.2em] fill-[#d9a544] uppercase font-[family-name:var(--font-body)] font-semibold pointer-events-none">
              <textPath href="#heroScrollCirclePath" startOffset="0%">
                ✦ SCROLL ✦ SCROLL ✦ SCROLL ✦{" "}
              </textPath>
            </text>
          </svg>
          <span
            className="absolute top-1/2 left-1/2 [transform:translate(-50%,-50%)] text-[15px] font-medium text-[#d9a544] leading-none pointer-events-none z-[2] transition-[transform] duration-300 ease-[ease] group-hover:[transform:translate(-50%,-35%)]"
            aria-hidden="true"
          >
            ↓
          </span>
        </div>
      </footer>
    </section>
  );
}
