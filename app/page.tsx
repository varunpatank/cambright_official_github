"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Mail, Users, ArrowRight, FileText, Trophy, Brain, BookOpen, Sparkles, ChevronLeft, ChevronRight, Calculator, Atom, FlaskConical, Dna, Cpu, Languages, Landmark } from "lucide-react";
import Hero from "@/components/Hero";
import { COURSES, SPOTLIGHT_VIDEO_ID } from "./(dashboard)/(routes)/tutoring-program/_data";

// Preview video for each showcased course — kept here rather than imported
// from the course detail page's DETAILS map, since that's a route file, not
// a shared data module.
const SHOWCASE_VIDEO_IDS: Record<string, string> = {
  "addmaths-0606": SPOTLIGHT_VIDEO_ID,
  "biology-igcse": "1BW2YvuoStn5ePfDmTrlgfQZQ0XZbw7Oh",
  "chemistry-igcse": "1yGhT6VQFMkPM4-H9I46wfjOfQYcAB2xD",
};

const STEM_SUBJECTS = [
  { label: "Mathematics", icon: Calculator, color: "#22d3ee" },
  { label: "Additional Mathematics", icon: Calculator, color: "#a78bfa" },
  { label: "Physics", icon: Atom, color: "#60a5fa" },
  { label: "Chemistry", icon: FlaskConical, color: "#fb923c" },
  { label: "Biology", icon: Dna, color: "#34d399" },
  { label: "Computer Science", icon: Cpu, color: "#f472b6" },
];

const OTHER_SUBJECTS = [
  { label: "English & Literature", icon: BookOpen },
  { label: "Chinese (Mandarin)", icon: Languages },
  { label: "Economics & Business", icon: Landmark },
  { label: "Geography", icon: FileText },
];

function SubjectsSection() {
  return (
    <section className="mt-8 md:mt-10">
      <div className="mb-4 flex items-center gap-2 px-1">
        <Atom className="h-4 w-4 text-cyan-300" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Subjects We Cover</h2>
      </div>

      <div className="rounded-3xl border border-cyan-400/20 bg-black/30 p-5 md:p-7" style={{ boxShadow: "0 0 50px rgba(34,211,238,0.08)" }}>
        <div className="flex flex-wrap items-center gap-2 md:gap-2.5">
          <span className="mr-1 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-cyan-300">
            STEM Focus
          </span>
          {STEM_SUBJECTS.map((s) => (
            <span
              key={s.label}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold text-white/85"
              style={{ borderColor: `${s.color}44`, background: `${s.color}14` }}
            >
              <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
              {s.label}
            </span>
          ))}
        </div>

        <div className="my-5 h-px w-full bg-white/[0.07]" />

        <div className="flex flex-wrap items-center gap-2 md:gap-2.5">
          <span className="mr-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white/50">
            + More Subjects
          </span>
          {OTHER_SUBJECTS.map((s) => (
            <span
              key={s.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-semibold text-white/60"
            >
              <s.icon className="h-3.5 w-3.5 text-white/40" />
              {s.label}
            </span>
          ))}
        </div>

        <p className="mt-5 text-sm text-white/50">
          Deep, exam-focused STEM courses — Maths, Add. Maths, Physics, Chemistry, Biology, Computer Science —
          plus growing coverage across the humanities and languages, all under one free platform.
        </p>
      </div>
    </section>
  );
}

const FEATURE_CARDS = [
  { title: "Past Papers", desc: "Every session, every year.", href: "/past-papers", icon: FileText, color: "#38bdf8" },
  { title: "Leaderboard", desc: "See where you rank.", href: "/leaderboard", icon: Trophy, color: "#facc15" },
  { title: "Quizzer", desc: "Practice with instant feedback.", href: "/quizzer", icon: Brain, color: "#34d399" },
  { title: "Revision Notes", desc: "Concise notes, every topic.", href: "/search-notes", icon: BookOpen, color: "#f472b6" },
];

function SpotlightCourses() {
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
  const showcaseCourses = COURSES.filter((c) => c.id in SHOWCASE_VIDEO_IDS);
  const [active, setActive] = useState(0);

  if (showcaseCourses.length === 0) return null;

  const activeCourse = showcaseCourses[active];
  const goTo = (index: number) => {
    setActive((index + showcaseCourses.length) % showcaseCourses.length);
  };
  const markLoaded = (id: string) => setLoadedIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  return (
    <section className="mt-8 md:mt-10">
      <div className="mb-4 flex items-center gap-2 px-1">
        <Sparkles className="h-4 w-4 text-amber-300" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Spotlight Courses</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div
          className="relative overflow-hidden rounded-3xl border border-amber-400/20 bg-black/30"
          style={{ paddingTop: "56.25%", boxShadow: "0 0 50px rgba(251,191,36,0.12)" }}
        >
          {!loadedIds.has(activeCourse.id) && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 bg-black/80 backdrop-blur-sm">
              <div className="h-8 w-8 rounded-full border-2 border-white/15 border-t-amber-300 animate-spin" />
              <p className="text-sm font-bold text-white">Video loading…</p>
              <p className="text-xs text-white/40">This can take a few seconds</p>
            </div>
          )}
          {/* All previews are mounted at once (instead of swapped in/out) so
              they load in parallel in the background — once loaded, switching
              between them is instant instead of re-fetching from Drive. */}
          {showcaseCourses.map((c, i) => (
            <iframe
              key={c.id}
              src={`https://drive.google.com/file/d/${SHOWCASE_VIDEO_IDS[c.id]}/preview`}
              className="absolute inset-0 h-full w-full"
              style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none", zIndex: i === active ? 1 : 0 }}
              allow="autoplay"
              allowFullScreen
              title={`${c.title} preview`}
              onLoad={() => markLoaded(c.id)}
            />
          ))}

          {/* Swap between course previews */}
          <button
            onClick={() => goTo(active - 1)}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white hover:bg-black/90 transition"
            aria-label="Previous course preview"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => goTo(active + 1)}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white hover:bg-black/90 transition"
            aria-label="Next course preview"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {showcaseCourses.map((c, i) => (
              <button
                key={c.id}
                onClick={() => goTo(i)}
                aria-label={`Show ${c.title} preview`}
                className="h-1.5 rounded-full transition-all"
                style={{ width: i === active ? "20px" : "6px", background: i === active ? "#fbbf24" : "rgba(255,255,255,0.3)" }}
              />
            ))}
          </div>
        </div>

        <div className="flex h-full flex-col gap-3">
          {showcaseCourses.map((course, i) => (
            <div
              key={course.id}
              role="button"
              tabIndex={0}
              onClick={() => goTo(i)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") goTo(i); }}
              className="group relative flex flex-1 items-center gap-4 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 cursor-pointer"
              style={{
                borderColor: i === active ? course.accentFrom : `${course.accentFrom}33`,
                background: "rgba(0,0,0,0.3)",
                boxShadow: i === active ? `0 0 30px rgba(${course.glowRgb},0.25)` : `0 0 30px rgba(${course.glowRgb},0.1)`,
              }}
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10">
                <Image src={course.image} alt={course.title} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[10px] font-black text-amber-300">
                  <Sparkles className="h-2.5 w-2.5" /> SPOTLIGHT
                </span>
                <h3 className="mt-1 truncate font-black text-white">{course.title}</h3>
                <p className="truncate text-xs text-white/50">{course.subtitle}</p>
              </div>
              <Link
                href={`/tutoring-program/${course.id}`}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 rounded-full p-1.5 text-white/30 transition hover:bg-white/10 hover:text-white"
                aria-label={`View ${course.title} course page`}
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExploreCards({ keyPrefix }: { keyPrefix: string }) {
  return (
    <>
      <Link
        href="/tutoring-program"
        className="group relative flex shrink-0 flex-col overflow-hidden rounded-3xl border border-violet-400/20 bg-black/30 backdrop-blur-sm transition hover:border-violet-400/40"
        style={{ width: "320px", boxShadow: "0 0 40px rgba(139,92,246,0.1)" }}
      >
        <div className="relative h-44 w-full overflow-hidden">
          <Image src="/tutor.png" alt="CamBright Tutors" fill className="object-cover object-top transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
        <div className="flex flex-1 flex-col justify-between p-6">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-violet-300/80">Our Tutors</span>
            <h3 className="mt-2 text-xl font-black leading-snug text-white">World-class tutors. <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">Zero cost.</span></h3>
          </div>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-violet-300">Browse Courses <ArrowRight className="h-4 w-4" /></span>
        </div>
      </Link>

      <a
        href="mailto:blazerrryt@gmail.com?subject=Tutor%20Application%20%E2%80%94%20CamBright"
        className="group relative flex shrink-0 flex-col justify-between overflow-hidden rounded-3xl border border-amber-400/20 bg-black/30 backdrop-blur-sm p-6 transition hover:border-amber-400/40"
        style={{ width: "320px", boxShadow: "0 0 40px rgba(251,191,36,0.08)" }}
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Hiring Tutors</span>
          </div>
          <h3 className="mt-4 text-xl font-extrabold leading-tight text-white">Join our mission. <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">Teach thousands.</span></h3>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
            <Users className="h-5 w-5 shrink-0 text-amber-300" />
            <p className="text-sm text-white/60"><span className="font-bold text-white">2,000+</span> students will see your course</p>
          </div>
        </div>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-amber-300"><Mail className="h-4 w-4" /> Email Us</span>
      </a>

      {FEATURE_CARDS.map((f) => (
        <Link
          key={`${keyPrefix}-${f.href}`}
          href={f.href}
          className="group relative flex shrink-0 flex-col justify-between overflow-hidden rounded-3xl border bg-black/30 backdrop-blur-sm p-6 transition"
          style={{ width: "260px", borderColor: `${f.color}33`, boxShadow: `0 0 30px ${f.color}14` }}
        >
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${f.color}, ${f.color}aa)` }}>
              <f.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-xl font-black text-white">{f.title}</h3>
            <p className="mt-1.5 text-sm text-white/50">{f.desc}</p>
          </div>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: f.color }}>Explore <ArrowRight className="h-4 w-4" /></span>
        </Link>
      ))}
    </>
  );
}

type VideoStage = "hidden" | "video" | "leaving";
const INTRO_PLAYBACK_RATE = 1.25;

interface VideoOverlayProps {
  stage: VideoStage;
  videoRef: React.RefObject<HTMLVideoElement>;
  onFinish: () => void;
}

// The video element is always mounted (just invisible) so Launch can call
// videoRef.play() synchronously inside its own click handler — required for
// browsers (Safari especially) to allow audio.
function VideoOverlay({ stage, videoRef, onFinish }: VideoOverlayProps) {
  const active = stage !== "hidden";

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        zIndex: active ? 9999 : -1, background: "#020207", overflow: "hidden",
        opacity: stage === "leaving" || stage === "hidden" ? 0 : 1,
        pointerEvents: active ? "auto" : "none",
        transition: "opacity 0.9s ease",
      }}
    >
      <video
        ref={videoRef}
        playsInline
        preload="auto"
        onEnded={onFinish}
        onLoadedMetadata={(e) => { e.currentTarget.playbackRate = INTRO_PLAYBACK_RATE; }}
        className="object-contain md:object-cover"
        style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          opacity: active ? 1 : 0,
          transform: active ? "scale(1)" : "scale(1.04)",
          transition: "opacity 1.1s ease, transform 1.4s ease",
        }}
        src="/introvid.mp4"
      />

      {stage === "video" && (
        <>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)", zIndex: 1, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 10, right: 28, zIndex: 10 }}>
            <button
              onClick={onFinish}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "7px 18px", color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}
            >
              Skip
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stage, setStage] = useState<VideoStage>("hidden");

  const handleLaunch = () => {
    // play() is called synchronously inside this click handler so it carries
    // the click's user-activation — the browser will allow sound.
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.muted = false;
      v.playbackRate = INTRO_PLAYBACK_RATE;
      v.play().catch(() => {});
    }
    setStage("video");
  };

  const handleFinish = () => {
    setStage("leaving");
    setTimeout(() => {
      router.push(isLoaded && user ? "/dashboard" : "/sign-in");
    }, 900);
  };

  return (
    <>
      <VideoOverlay stage={stage} videoRef={videoRef} onFinish={handleFinish} />

      <main className="min-h-screen text-white">
        <div className="mx-auto max-w-6xl px-4 pb-12 md:px-6">

          <Hero onLaunch={handleLaunch} />

          <SubjectsSection />

          <SpotlightCourses />

          {/* Auto-scrolling marquee of feature cards — pauses on hover so cards are still clickable */}
          <section className="mt-8 md:mt-10">
            <h2 className="mb-4 px-1 text-sm font-bold uppercase tracking-widest text-white/40">Explore CamBright</h2>
            <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_4%,white_96%,transparent)]">
              <div
                className="flex w-max gap-4 animate-scroll will-change-transform hover:[animation-play-state:paused]"
                style={{ ["--animation-duration" as string]: "50s" } as CSSProperties}
              >
                <ExploreCards keyPrefix="a" />
                <ExploreCards keyPrefix="b" />
              </div>
            </div>
          </section>

          <footer className="mt-6 lg:mt-10 flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-black/25 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Image src="/logo-clean.png" alt="CamBright" width={80} height={22} className="opacity-60" />
              <span className="text-xs text-white/30">v2.0</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
              {[["Revision Notes","/search-notes"],["Quizzer","/quizzer"],["Past Papers","/past-papers"],["Leaderboard","/leaderboard"],["Tutoring","/tutoring-program"]].map(([label,href]) => (
                <Link key={href} href={href} className="transition hover:text-white">{label}</Link>
              ))}
            </div>
            <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} CamBright &mdash; 100% Free</p>
          </footer>
        </div>
      </main>
    </>
  );
}
