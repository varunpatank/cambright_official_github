"use client";

import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import { StarsBackground } from "@/components/ui/shooting-stars";

/* ─── full-page meteor background ───────────────────────── */
const MeteorLayer = () => {
  const meteors = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      top: `${5 + i * 9.5}%`,
      width: 480 + (i % 3) * 140,
      duration: 4 + (i % 4) * 1.2,
      delay: i * 0.9,
      repeatDelay: 3 + (i % 3) * 2,
    })), []
  );

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {meteors.map((m, i) => (
        <motion.div
          key={i}
          initial={{ x: "-120vw", opacity: 0 }}
          animate={{ x: "120vw", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            repeatDelay: m.repeatDelay,
            ease: "linear",
          }}
          className="absolute"
          style={{ top: m.top }}
        >
          <svg width={m.width} height="8" viewBox={`0 0 ${m.width} 8`} fill="none">
            <path
              d={`M0 4 H${m.width}`}
              stroke={`url(#mg-${i})`}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id={`mg-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(168,85,247,0)" />
                <stop offset="25%" stopColor="rgba(168,85,247,0.6)" />
                <stop offset="60%" stopColor="rgba(139,92,246,1)" />
                <stop offset="100%" stopColor="rgba(168,85,247,0)" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}
    </div>
  );
};
import {
  Bot, FileText, BookOpen, Layers,
  Calculator, Target, CheckSquare, Trophy,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

/* ─── feature data ──────────────────────────────────────── */
const bentoItems = [
  {
    icon: Bot,
    title: "Tuto",
    sub: "Intelligence Tutor",
    desc: "Ask anything. Get instant, subject-specific answers from CamBright Intelligence.",
    href: "/tuto-ai",
    accent: "#22d3ee",
    glow: "rgba(34,211,238,0.12)",
    span: "col-span-2 row-span-2",
    large: true,
  },
  {
    icon: FileText,
    title: "Past Papers",
    sub: "Cambridge Resources",
    desc: "Every IGCSE & A Level past paper, organised by subject and year.",
    href: "/past-papers",
    accent: "#4ade80",
    glow: "rgba(74,222,128,0.1)",
    span: "col-span-1 row-span-1",
    large: false,
  },
  {
    icon: BookOpen,
    title: "Revision Notes",
    sub: "Cambridge Resources",
    desc: "Syllabus-matched notes for every major subject.",
    href: "/notes",
    accent: "#60a5fa",
    glow: "rgba(96,165,250,0.1)",
    span: "col-span-1 row-span-1",
    large: false,
  },
  {
    icon: Layers,
    title: "Intelligence Flashcards",
    sub: "Intelligence Tool",
    desc: "Type a topic — CamBright Intelligence generates a full deck instantly.",
    href: "/flashcards",
    accent: "#c084fc",
    glow: "rgba(192,132,252,0.12)",
    span: "col-span-2 row-span-1",
    large: false,
  },
  {
    icon: Calculator,
    title: "Grade Predictor",
    sub: "Analytics",
    desc: "10-year Cambridge grade boundaries — predict your grade instantly.",
    href: "/grade-predictor",
    accent: "#fb923c",
    glow: "rgba(251,146,60,0.1)",
    span: "col-span-1 row-span-1",
    large: false,
  },
  {
    icon: Target,
    title: "Question Quizzer",
    sub: "Intelligence Tool",
    desc: "Practice questions generated for your exact topic.",
    href: "/question-quizzer",
    accent: "#facc15",
    glow: "rgba(250,204,21,0.1)",
    span: "col-span-1 row-span-1",
    large: false,
  },
  {
    icon: CheckSquare,
    title: "MCQ Mock Exam",
    sub: "Exam Practice",
    desc: "Timed full mock exams. Instant automated marking.",
    href: "/mcq-solver",
    accent: "#2dd4bf",
    glow: "rgba(45,212,191,0.1)",
    span: "col-span-2 row-span-1",
    large: false,
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    sub: "Community",
    desc: "Earn XP. Compete globally. Rise through the ranks.",
    href: "/leaderboard",
    accent: "#fbbf24",
    glow: "rgba(251,191,36,0.1)",
    span: "col-span-2 row-span-1",
    large: false,
    wide: false,
  },
];

/* ─── component ─────────────────────────────────────────── */
const Homepage = () => {
  const [showed, setShowed] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (!user) setShowed(true);
  }, [user]);

  return (
    <div className="bg-[#0E0C15] text-white min-h-screen overflow-x-hidden relative">
      <style>{`
        @keyframes word-shine {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .shine-word {
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: word-shine 3.5s linear infinite;
        }
      `}</style>
      {/* twinkling stars */}
      <StarsBackground starDensity={0.00022} className="fixed inset-0 z-0 pointer-events-none" />
      {/* moving meteor beams */}
      <MeteorLayer />
      {/* ── Hero ─────────────────────────────────────────── */}
      <Hero showThem={showed} />

      {/* ── Manifesto ────────────────────────────────────── */}
      <section className="relative z-10 px-4 md:px-8 pt-10 pb-6 border-b border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          {[
            { word: "FREE.", color: "#ffffff", note: "Every tool, every resource — no cost, ever." },
            { word: "CAMBRIDGE.", color: "#a78bfa", note: "Built for IGCSE, AS & A Level syllabuses." },
            { word: "INTELLIGENT.", color: "#67e8f9", note: "CamBright Intelligence powers your studying." },
            { word: "FOR STUDENTS.", color: "#86efac", note: "Built by students who needed it. For students who deserve it." },
            { word: "ALWAYS ON.", color: "#fbbf24", note: "Available 24/7, from anywhere in the world." },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="flex items-center gap-6 py-3 border-b border-white/[0.05] last:border-0"
            >
              <span
                className="shine-word text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none flex-shrink-0"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${m.color} 0%, #ffffff 40%, ${m.color} 60%, ${m.color} 100%)`,
                  animationDelay: `${i * 0.6}s`,
                }}
              >
                {m.word}
              </span>
              <span className="text-sm md:text-base text-gray-500 ml-auto hidden md:block text-right max-w-xs">{m.note}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Bento section ────────────────────────────────── */}
      <section className="relative z-10 px-4 md:px-8 pt-8 pb-8">

        {/* bento grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-4 auto-rows-[240px] gap-3">
          {bentoItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className={item.span}
              >
                <Link href={item.href} className="block h-full">
                  <motion.div
                    whileHover={{ scale: 1.015 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative h-full rounded-2xl overflow-hidden border border-white/[0.07] bg-[#13111D] group cursor-pointer"
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `radial-gradient(ellipse at 30% 50%, ${item.glow} 0%, transparent 70%)` }}
                    />

                    {item.wide ? (
                      /* wide leaderboard card */
                      <div className="relative z-10 h-full flex items-center justify-between px-8 md:px-12">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10" style={{ background: `${item.accent}15` }}>
                            <Icon className="w-7 h-7" style={{ color: item.accent }} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: item.accent }}>{item.sub}</p>
                            <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                          </div>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                          <p className="text-gray-300 text-base max-w-xs">{item.desc}</p>
                          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all">
                            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    ) : item.large ? (
                      /* large 2x2 tuto card */
                      <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
                        <div>
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 mb-4" style={{ background: `${item.accent}18` }}>
                            <Icon className="w-7 h-7" style={{ color: item.accent }} />
                          </div>
                          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: item.accent }}>{item.sub}</p>
                          <h3 className="text-3xl font-bold text-white leading-tight mb-2.5">{item.title}</h3>
                          <p className="text-gray-300 text-base leading-relaxed max-w-xs">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-white/40 group-hover:text-white/80 transition-colors">
                          Try it <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    ) : (
                      /* standard card */
                      <div className="relative z-10 h-full flex flex-col justify-between p-5">
                        <div>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/[0.08] mb-3" style={{ background: `${item.accent}15` }}>
                            <Icon className="w-5 h-5" style={{ color: item.accent }} />
                          </div>
                          <h3 className="font-bold text-white text-base mb-1.5">{item.title}</h3>
                          <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-white/25 group-hover:text-white/70 transition-colors mt-2">
                          Open <ArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}

          {/* CTA tile — col-span-2, same row as Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="col-span-2 row-span-1"
          >
            <Link href={showed ? "/sign-up" : "/dashboard"} className="block h-full">
              <motion.div
                whileHover={{ scale: 1.015 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative h-full rounded-2xl overflow-hidden group cursor-pointer"
                style={{ background: "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 50%, #0e0c15 100%)", border: "1px solid rgba(139,92,246,0.35)" }}
              >
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-[60px] pointer-events-none" style={{ background: "rgba(139,92,246,0.25)" }} />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full blur-[50px] pointer-events-none" style={{ background: "rgba(6,182,212,0.15)" }} />
                <div className="relative z-10 h-full flex flex-col justify-between p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2">Get started</p>
                    <h3 className="text-2xl font-black text-white leading-tight mb-2">
                      Start for free.<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Right now.</span>
                    </h3>
                    <p className="text-gray-400 text-sm">Join 2000+ students. No signup fee, ever.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 rounded-full text-sm font-bold text-white group-hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
                      {showed ? "Create account" : "Open Dashboard"} →
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <div className="relative z-10">
        <Footer signed={!showed} />
      </div>
    </div>
  );
};

export default Homepage;
