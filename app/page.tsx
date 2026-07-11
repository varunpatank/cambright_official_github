"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail, Sparkles, Volume2, VolumeX } from "lucide-react";
import Hero from "@/components/Hero";

function IntroVideo({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // Start unmuted directly — no toggling needed
    v.play().catch(() => {
      // If browser blocks unmuted autoplay, mute and retry
      v.muted = true;
      v.play().catch(() => {});
    });
  }, []);

  const finish = () => {
    setFading(true);
    setTimeout(onDone, 900);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999, background: "#000",
      opacity: fading ? 0 : 1,
      transition: fading ? "opacity 0.9s ease" : "none",
    }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        preload="auto"
        onEnded={finish}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
        src="/intro.mp4"
      />

      {/* vignette only */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)", zIndex: 1, pointerEvents: "none" }} />

      {/* skip button */}
      <div style={{ position: "absolute", bottom: 10, right: 28, zIndex: 10 }}>
        <button
          onClick={finish}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "7px 18px", color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}
        >
          Skip
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useUser();
  const [introDone, setIntroDone] = useState(() => {
    // Only play once per browser — check localStorage on init
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("cb_intro_played");
    }
    return false;
  });

  const handleIntroDone = () => {
    localStorage.setItem("cb_intro_played", "1");
    setIntroDone(true);
  };

  return (
    <>
      {!introDone && <IntroVideo onDone={handleIntroDone} />}

      <main className="min-h-screen text-white" style={{ zoom: "1.1" }}>
        <div className="relative mx-auto max-w-6xl px-4 pb-12 md:px-6">
          <Hero showThem={!user} />

          <section className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: "150ms", animationFillMode: "both" }}>

            <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-black/30 backdrop-blur-sm" style={{ boxShadow: "0 0 50px rgba(139,92,246,0.12)" }}>
              <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
              <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="relative z-10 flex items-center gap-2 px-6 pt-6">
                <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300/80">Our Tutors</span>
              </div>
              <div className="relative z-10 mx-6 mt-4 rounded-2xl overflow-hidden border border-white/10" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                <Image src="/tutor.png" alt="CamBright Tutors" width={600} height={360} className="w-full object-cover" style={{ maxHeight: "260px", objectPosition: "top" }} />
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
              <div className="relative z-10 px-6 py-5">
                <h3 className="text-xl font-black text-white leading-snug">World-class tutors.<br /><span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">Zero cost to students.</span></h3>
                <p className="mt-2 text-sm text-white/55 leading-relaxed">Every course on CamBright is created by vetted Cambridge tutors and posted free for all students.</p>
                <Link href="/tutoring-program" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(139,92,246,0.45)] transition hover:opacity-90">
                  Browse Courses <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-amber-400/20 bg-black/30 backdrop-blur-sm flex flex-col justify-between p-7" style={{ boxShadow: "0 0 50px rgba(251,191,36,0.08)" }}>
              <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-amber-500/12 blur-3xl" />
              <div className="pointer-events-none absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-orange-600/10 blur-3xl" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">We&apos;re Hiring Tutors</span>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold leading-tight text-white">Join our mission.<br /><span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">Teach thousands.</span></h3>
                  <p className="mt-3 text-sm text-white/60 leading-relaxed">Join the CamBright tutoring board. Your course will be seen by 2,000+ students, fully credited to you, and live forever &mdash; for free.</p>
                </div>
                <ul className="space-y-2">
                  {["Your course featured permanently","Full credit — your name and profile","Seen by thousands of Cambridge students daily","Zero fees. Zero catch."].map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-white/60"><span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />{item}</li>
                  ))}
                </ul>
              </div>
              <div className="relative z-10 mt-6 flex flex-col gap-3">
                <a href="mailto:blazerrryt@gmail.com?subject=Tutor%20Application%20%E2%80%94%20CamBright" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(251,191,36,0.35)] transition hover:opacity-90">
                  <Mail className="h-4 w-4" /> Email blazerrryt@gmail.com
                </a>
                <p className="text-center text-xs text-white/30">We reply within 48 hours &middot; No fees ever</p>
              </div>
            </div>
          </section>

          <footer className="flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-black/25 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Image src="/logo-clean.png" alt="CamBright" width={80} height={22} className="opacity-60" />
              <span className="text-xs text-white/30">v2.0</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-white/50">
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
