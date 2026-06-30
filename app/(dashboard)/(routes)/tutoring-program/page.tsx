import { Mail, Star, CheckCircle2, ArrowRight } from "lucide-react";
import { StarsBackground } from "@/components/ui/shooting-stars";
import { StarryBackground } from "@/components/ui/starry-background";
import { Cover } from "@/components/ui/cover";

export default function TutoringProgramPage() {
  return (
    <div className="text-white">
      <StarsBackground />

      {/* BANNER — matches leaderboard style */}
      <StarryBackground height="300px" intensity="high" showMeteors={true} className="mb-8 rounded-none">
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center" style={{paddingTop:"50px"}}>
          <Cover className="inline-block px-8 py-5 mx-auto" noSparkles>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-purple-300">
              <Star className="h-2.5 w-2.5" /> For Tutors &amp; Teachers
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 font-sora text-center">
              Feature your course<span className="text-purple-400">.</span>
            </h1>
            <p className="text-gray-400 text-base text-center max-w-lg mx-auto">
              Get your Cambridge classes listed on CamBright for free — seen by 2,000+ students every day.
            </p>
          </Cover>
        </div>
      </StarryBackground>

      <div className="max-w-4xl mx-auto px-6 pb-14 space-y-6">

        {/* HONOUR CALLOUT */}
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/8 px-6 py-4 flex gap-4 items-center">
          <Star className="h-5 w-5 text-amber-300 shrink-0" />
          <div>
            <p className="font-bold text-white">Being listed here is a big deal.</p>
            <p className="text-sm text-white/60 mt-0.5">Your course is permanently featured on this page — free, credited to you, visible to thousands of Cambridge students.</p>
          </div>
        </div>

        {/* TWO COLUMN */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* What to send */}
          <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm p-7">
            <h2 className="text-xl font-bold text-white mb-5">What to include in your email</h2>
            <ul className="space-y-4">
              {[
                "Your name and subject",
                "Session dates, times & frequency",
                "A short course description",
                "Syllabus or resource links",
                "A course image",
                "Your contact details",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-base text-white/80">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="relative overflow-hidden rounded-2xl border border-purple-400/30 bg-black/30 backdrop-blur-sm p-7 flex flex-col justify-between">
            <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-purple-500/25 blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-2">Ready to be listed?</h2>
              <p className="text-base text-white/60 mb-6 leading-relaxed">
                Send your details and we&apos;ll have your course live on this page within 48 hours. No fees, no catch.
              </p>
              <a
                href="mailto:blazerrryt@gmail.com?subject=Tutoring%20Program%20Submission&body=Hi%20CamBright%2C%0A%0AName%3A%0ASubject%3A%0ASession%20dates%20and%20times%3A%0ACourse%20description%3A%0AResource%20links%3A%0ACourse%20image%20description%3A%0AContact%20details%3A%0A%0AThank%20you."
                className="inline-flex items-center gap-3 rounded-xl bg-purple-600 hover:bg-purple-500 px-6 py-4 text-base font-bold text-white shadow-[0_0_28px_rgba(139,92,246,0.55)] transition hover:shadow-[0_0_40px_rgba(139,92,246,0.75)]"
              >
                <Mail className="h-5 w-5" />
                Email blazerrryt@gmail.com
                <ArrowRight className="h-5 w-5" />
              </a>
              <p className="mt-4 text-sm text-white/40">We&apos;ll reply within 48 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
