"use client";

import { useState } from "react";
import { Mail, Star, ArrowRight, BookOpen, Sparkles, ExternalLink, Play } from "lucide-react";
import { StarsBackground } from "@/components/ui/shooting-stars";
import { StarryBackground } from "@/components/ui/starry-background";
import { Cover } from "@/components/ui/cover";
import Image from "next/image";
import Link from "next/link";
import { COURSES, ALL_VIDEOS_FOLDER, type CourseData } from "./_data";

function CourseCard({ course }: { course: CourseData }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/tutoring-program/${course.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col rounded-3xl overflow-hidden border border-white/10 bg-black/35 backdrop-blur-xl transition-all duration-500 hover:border-white/25 hover:-translate-y-1.5 cursor-pointer"
      style={{
        boxShadow: hovered
          ? `0 20px 60px rgba(${course.glowRgb},0.35), 0 0 0 1px rgba(255,255,255,0.07)`
          : `0 4px 30px rgba(${course.glowRgb},0.1)`,
        transition: "box-shadow 0.4s ease, transform 0.3s ease, border-color 0.3s",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px z-10"
        style={{ background: `linear-gradient(90deg, transparent, ${course.accentFrom}, ${course.accentTo}, transparent)`, opacity: hovered ? 1 : 0.4, transition: "opacity 0.3s" }}
      />

      <div className="relative w-full overflow-hidden rounded-t-3xl isolate" style={{ aspectRatio: "16/9" }}>
        <Image src={course.image} alt={course.title} fill className="object-cover scale-[1.02] transition-transform duration-700 ease-out group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300" style={{ opacity: hovered ? 1 : 0 }}>
          <div className="h-14 w-14 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20" style={{ background: `linear-gradient(135deg, ${course.accentFrom}cc, ${course.accentTo}cc)` }}>
            <Play className="h-6 w-6 text-white ml-0.5" />
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-block rounded-full border px-3 py-0.5 text-[10px] font-black tracking-widest ${course.tagStyle}`}>{course.tagLabel}</span>
          <span className="text-xs text-white/40">by {course.author}</span>
        </div>
        <div>
          <h3 className="text-xl font-black text-white leading-tight">{course.title}</h3>
          <p className="text-sm font-semibold mt-0.5" style={{ background: `linear-gradient(90deg, ${course.accentFrom}, ${course.accentTo})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{course.subtitle}</p>
        </div>
        <p className="text-sm text-white/55 leading-relaxed flex-1">{course.shortDescription}</p>
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <BookOpen className="h-3.5 w-3.5" />
            {course.chaptersCount} {course.chaptersCount === 1 ? "chapter" : "chapters"}
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: course.accentFrom }}>
            View Course <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function TutoringProgramPage() {
  return (
    <div className="min-h-screen text-white">
      <StarsBackground />

      <StarryBackground height="260px" intensity="medium" showMeteors={true} className="mb-0 rounded-none">
        <div className="relative z-10 flex flex-col items-center justify-center h-full pt-10 text-center px-4">
          <Cover className="inline-block px-8 py-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-3 font-sora text-center">
              Featured <span className="text-purple-400 drop-shadow-[0_0_20px_rgba(192,132,252,0.7)]">Courses.</span>
            </h1>
            <p className="text-gray-400 text-center text-sm max-w-md mx-auto">Cambridge IGCSE classes by top tutors — live sessions, recorded lessons and full study materials.</p>
          </Cover>
        </div>
      </StarryBackground>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-black text-white">Available Courses</h2>
            <p className="text-sm text-white/40 mt-0.5">{COURSES.length} courses · updated July 2026</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <BookOpen className="h-4 w-4" />
            Click any course to view chapters, videos &amp; materials
          </div>
        </div>

        {COURSES.filter((c) => c.isSpotlight).map((course) => (
          <div key={course.id} className="mb-6">
            <Link href={`/tutoring-program/${course.id}`} className="group relative flex flex-col md:flex-row rounded-3xl overflow-hidden border border-white/10 bg-black/35 backdrop-blur-xl transition-all duration-500 hover:border-white/25 hover:-translate-y-1 cursor-pointer" style={{ boxShadow: `0 8px 50px rgba(${course.glowRgb},0.2), 0 0 0 1px rgba(255,255,255,0.05)` }}>
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${course.accentFrom}, ${course.accentTo}, transparent)` }} />
              <div className="relative md:w-2/5 overflow-hidden rounded-t-3xl md:rounded-t-none md:rounded-l-3xl isolate" style={{ minHeight: "220px" }}>
                <Image src={course.image} alt={course.title} fill className="object-cover scale-[1.02] transition-transform duration-700 ease-out group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60 md:block hidden" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 md:hidden" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-16 w-16 rounded-full backdrop-blur flex items-center justify-center border border-white/30" style={{ background: `${course.accentFrom}cc` }}>
                    <Play className="h-7 w-7 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/15 px-3 py-1 text-[10px] font-black tracking-widest text-amber-300 backdrop-blur-sm">
                    <Sparkles className="h-3 w-3" /> SPOTLIGHT
                  </span>
                </div>
              </div>
              <div className="flex-1 p-7 flex flex-col justify-center space-y-4">
                <div>
                  <span className={`inline-block rounded-full border px-3 py-0.5 text-[10px] font-black tracking-widest ${course.tagStyle}`}>{course.tagLabel}</span>
                  <h3 className="text-3xl font-black text-white mt-2">{course.title}</h3>
                  <p className="text-base font-semibold mt-0.5" style={{ background: `linear-gradient(90deg, ${course.accentFrom}, ${course.accentTo})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{course.subtitle}</p>
                </div>
                <p className="text-sm text-white/60 leading-relaxed max-w-lg">{course.shortDescription}</p>
                <div className="flex items-center gap-4 pt-1">
                  <div className="inline-flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all" style={{ color: course.accentFrom }}>Explore Course <ArrowRight className="h-4 w-4" /></div>
                  <span className="text-xs text-white/30">{course.chaptersCount > 0 ? `${course.chaptersCount} chapters · ` : ""}by {course.author}</span>
                </div>
              </div>
            </Link>
          </div>
        ))}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {COURSES.filter((c) => !c.isSpotlight).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      <div className="border-t border-white/[0.08] bg-black/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Star className="h-4 w-4 text-amber-300 shrink-0" />
            <p className="text-sm text-white/70"><span className="font-semibold text-white">Want your course listed here?</span> It&apos;s free — seen by 2,000+ Cambridge students daily.</p>
          </div>
          <a href="mailto:blazerrryt@gmail.com?subject=Tutoring%20Program%20Submission&body=Hi%20CamBright%2C%0A%0AName%3A%0ASubject%3A%0ASession%20dates%20and%20times%3A%0ACourse%20description%3A%0AResource%20links%3A%0ACourse%20image%20description%3A%0AContact%20details%3A%0A%0AThank%20you." className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition whitespace-nowrap">
            <Mail className="h-4 w-4" /> Feature My Course <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
