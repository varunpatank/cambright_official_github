"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bot,
  BookOpen,
  CheckSquare,
  FileText,
  GraduationCap,
  Layers,
  Sparkle,
  Target,
  Trophy,
} from "lucide-react";
import Hero from "@/components/Hero";

const TOOLS = [
  { icon: Bot,           label: "CBI Tutor",      sub: "Instant AI subject help",    href: "/tuto-ai",          ring: "border-cyan-400/30",    glow: "hover:shadow-cyan-500/30",   iconCol: "text-cyan-300",    bg: "hover:bg-cyan-500/8" },
  { icon: Target,        label: "Quizzer",         sub: "Adaptive practice sets",     href: "/quizzer",          ring: "border-orange-400/30",  glow: "hover:shadow-orange-500/30", iconCol: "text-orange-300",  bg: "hover:bg-orange-500/8" },
  { icon: Layers,        label: "Flashcards",      sub: "AI-generated card decks",    href: "/flashcards",       ring: "border-pink-400/30",    glow: "hover:shadow-pink-500/30",   iconCol: "text-pink-300",    bg: "hover:bg-pink-500/8" },
  { icon: FileText,      label: "Past Papers",     sub: "Papers + model answers",     href: "/past-papers",      ring: "border-emerald-400/30", glow: "hover:shadow-emerald-500/30",iconCol: "text-emerald-300", bg: "hover:bg-emerald-500/8" },
  { icon: BookOpen,      label: "Revision Notes",  sub: "Condensed exam-ready notes", href: "/search-notes",     ring: "border-blue-400/30",    glow: "hover:shadow-blue-500/30",   iconCol: "text-blue-300",    bg: "hover:bg-blue-500/8" },
  { icon: CheckSquare,   label: "MCQ Mock",        sub: "Timed with auto-marking",    href: "/mcq-solver",       ring: "border-teal-400/30",    glow: "hover:shadow-teal-500/30",   iconCol: "text-teal-300",    bg: "hover:bg-teal-500/8" },
  { icon: Trophy,        label: "Leaderboard",     sub: "Live rank every 5 seconds",  href: "/leaderboard",      ring: "border-amber-400/30",   glow: "hover:shadow-amber-500/30",  iconCol: "text-amber-300",   bg: "hover:bg-amber-500/8" },
  { icon: GraduationCap, label: "Tutoring",        sub: "List and teach your course", href: "/tutoring-program", ring: "border-violet-400/30",  glow: "hover:shadow-violet-500/30", iconCol: "text-violet-300",  bg: "hover:bg-violet-500/8" },
] as const;

const ACRONYM = [
  { letter: "B", word: "Beyond",       sub: "Beyond textbooks",      grad: "from-cyan-200 via-cyan-400 to-blue-500",       glow: "rgba(34,211,238,0.55)" },
  { letter: "R", word: "Revision",     sub: "Smarter revision",       grad: "from-green-200 via-emerald-400 to-teal-500",   glow: "rgba(52,211,153,0.55)" },
  { letter: "I", word: "Intelligent",  sub: "AI-powered tools",       grad: "from-violet-200 via-purple-400 to-indigo-500",  glow: "rgba(167,139,250,0.55)" },
  { letter: "G", word: "Grade",        sub: "Grade-focused prep",     grad: "from-pink-200 via-rose-400 to-pink-600",       glow: "rgba(251,113,133,0.55)" },
  { letter: "H", word: "Here",         sub: "Here for every student", grad: "from-amber-200 via-yellow-400 to-orange-500",  glow: "rgba(251,191,36,0.55)" },
  { letter: "T", word: "Tools",        sub: "Tools that work",        grad: "from-fuchsia-200 via-fuchsia-400 to-purple-600",glow: "rgba(232,121,249,0.55)" },
] as const;

export default function Page() {
  const { user } = useUser();

  return (
    <main className="min-h-screen text-white">
      <div className="relative mx-auto max-w-6xl px-4 pb-12 md:px-6">
        <Hero showThem={!user} />

        {/* ── BRIGHT ACRONYM STRIP ── */}
        <section className="mb-5 overflow-hidden rounded-3xl border border-white/[0.07] bg-black/30 backdrop-blur-sm">
          <div className="grid grid-cols-6 divide-x divide-white/[0.07]">
            {ACRONYM.map(({ letter, word, sub, grad, glow }, i) => (
              <div
                key={letter}
                className="group flex flex-col items-center py-7 px-2 text-center transition duration-300 hover:bg-white/[0.04] cursor-default"
              >
                <span
                  className={`bg-gradient-to-b ${grad} bg-clip-text text-6xl font-black text-transparent leading-none md:text-7xl lg:text-8xl`}
                  style={{ filter: `drop-shadow(0 0 18px ${glow}) drop-shadow(0 0 40px ${glow.replace('0.55','0.3')})`, transition: 'filter 0.3s' }}
                >
                  {letter}
                </span>
                <span className="mt-2.5 text-xs font-bold uppercase tracking-widest text-white/90">{word}</span>
                <span className="mt-0.5 text-[10px] text-white/45 leading-tight">{sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── TOOL GRID ── */}
        <section className="mb-5 overflow-hidden rounded-3xl border border-white/[0.07] bg-black/30 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
            <div className="flex items-center gap-2.5">
              <Image src="/logo-clean.png" alt="CamBright" width={100} height={26} className="opacity-90" />
              <span className="rounded-full border border-violet-400/40 bg-violet-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-violet-300">v2</span>
            </div>
            <span className="text-xs text-white/40">8 tools. Zero cost.</span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white/[0.07] md:grid-cols-4">
            {TOOLS.map(({ icon: Icon, label, sub, href, ring, glow, iconCol, bg }, i) => (
              <Link
                key={href}
                href={href}
                className={`group flex flex-col gap-2 bg-black/40 p-5 shadow-lg transition duration-200 hover:-translate-y-px ${bg} hover:shadow-lg ${glow}`}
                style={{animationDelay: `${i * 50}ms`}}
              >
                <div className={`${iconCol} transition-transform duration-200 group-hover:scale-110 group-hover:drop-shadow-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white leading-tight">{label}</div>
                  <div className="text-[11px] text-white/50 mt-0.5 leading-tight">{sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── BOTTOM ROW: LEADERBOARD + CTA ── */}
        <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* Leaderboard */}
          <Link
            href="/leaderboard"
            className="group relative overflow-hidden rounded-3xl border border-amber-400/20 bg-black/30 p-7 backdrop-blur-sm transition duration-300 hover:border-amber-400/40"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl transition duration-500 group-hover:bg-amber-500/25" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-48 rounded-full bg-yellow-600/10 blur-2xl" />
            <div className="relative z-10">
              <div className="mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-300" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300/80">Live Leaderboard</span>
              </div>
              <h3 className="text-2xl font-extrabold leading-tight text-white">Your rank.<br />Always visible.</h3>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">XP updates every 5 seconds. Your position sits at the top of every leaderboard page in v2.</p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold text-amber-200 transition group-hover:bg-amber-400/20">
                See rankings <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </Link>

          {/* CTA */}
          <div className="relative overflow-hidden rounded-3xl border border-violet-400/25 bg-black/30 p-7 backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-violet-600/20 blur-3xl" style={{animation:"pulse 6s ease-in-out infinite"}} />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-cyan-500/15 blur-2xl" />
            <div className="relative z-10">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-violet-300/70">Tutoring Program</div>
              <h3 className="text-3xl font-extrabold leading-tight text-white">
                Teach.<br />
                <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">Reach further.</span>
              </h3>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">List your Cambridge classes on CamBright. Free. Reach 2,000+ students who are already revising.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={user ? "/dashboard" : "/sign-up"}
                  className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.6)] transition hover:bg-violet-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.8)]"
                >
                  {user ? "Open Dashboard" : "Get started free"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/tutoring-program"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/12 hover:text-white"
                >
                  <Sparkle className="h-3.5 w-3.5" /> Explore Program
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-black/25 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo-clean.png" alt="CamBright" width={80} height={22} className="opacity-60" />
            <span className="text-xs text-white/30">v2.0</span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-white/50">
            {[
              ["Revision Notes", "/search-notes"],
              ["Quizzer", "/quizzer"],
              ["Past Papers", "/past-papers"],
              ["Leaderboard", "/leaderboard"],
              ["Tutoring", "/tutoring-program"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="transition hover:text-white">{label}</Link>
            ))}
          </div>
          <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} CamBright &mdash; 100% Free</p>
        </footer>
      </div>
    </main>
  );
}
