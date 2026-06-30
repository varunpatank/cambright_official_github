import Link from "next/link";
import { ArrowRight, Trophy, Sparkles, BookOpen, GraduationCap, Brain } from "lucide-react";

interface LandingBentoGridProps {
  isSignedIn: boolean;
}

const LandingBentoGrid = ({ isSignedIn }: LandingBentoGridProps) => {
  const ctaHref = isSignedIn ? "/dashboard" : "/sign-up";
  const ctaText = isSignedIn ? "Open Dashboard" : "Create account";

  return (
    <section className="pb-12" id="bento">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Bento Grid
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/50 p-6">
          <BookOpen className="h-6 w-6 text-cyan-300 mb-3" />
          <h3 className="text-xl font-semibold text-white">Past Papers</h3>
          <p className="text-sm text-white/75 mt-2">
            Cambridge papers with model answers and clean revision flow.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/50 p-6">
          <Brain className="h-6 w-6 text-violet-300 mb-3" />
          <h3 className="text-xl font-semibold text-white">Intelligence Tools</h3>
          <p className="text-sm text-white/75 mt-2">
            Study with CBI-generated prompts, flashcards, and focused practice.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/50 p-6">
          <GraduationCap className="h-6 w-6 text-emerald-300 mb-3" />
          <h3 className="text-xl font-semibold text-white">Structured Learning</h3>
          <p className="text-sm text-white/75 mt-2">
            Courses, notes, and exam tactics in one guided path.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/50 p-6">
          <Sparkles className="h-6 w-6 text-amber-300 mb-3" />
          <h3 className="text-xl font-semibold text-white">Always Improving</h3>
          <p className="text-sm text-white/75 mt-2">
            Constant updates to content quality and student outcomes.
          </p>
        </div>

        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-b from-black/40 to-black/70 p-6">
          <Trophy className="h-6 w-6 text-yellow-300 mb-3" />
          <h3 className="text-2xl font-semibold text-white">Leaderboard</h3>
          <p className="text-sm text-white/75 mt-2 max-w-xl">
            Track your progress with XP, compare against active students, and stay consistent.
          </p>
        </div>

        <div className="xl:col-span-2 rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-purple-700/70 via-purple-900/55 to-slate-950 p-6 shadow-[0_0_40px_rgba(34,211,238,0.18)]">
          <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            Start for free. Right now.
          </h3>
          <p className="mt-3 text-sm md:text-base bg-gradient-to-r from-cyan-300 via-violet-200 to-cyan-200 bg-clip-text text-transparent">
            Join CamBright and unlock past papers, CBI tools, and exam-ready workflows in minutes.
          </p>
          <div className="mt-6">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full border border-purple-300/40 bg-gradient-to-r from-purple-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.55)] transition hover:scale-[1.02]"
            >
              {ctaText} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingBentoGrid;
