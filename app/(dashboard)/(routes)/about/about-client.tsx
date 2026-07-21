"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import Footerer from "@/components/Footerer";
import { StarryBackground } from "@/components/ui/starry-background";
import { Cover } from "@/components/ui/cover";
import { Button } from "@/components/ui/button";
import { board, directors, founders, staffMembers, storyMilestones, type User } from "./team-data";

const tagColors: Record<string, string> = {
  "Co-Founder": "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  "Head of Tech": "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  Director: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
  CTO: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  "Head of Operations": "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  "Head of CamBright": "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  "Head of Business": "bg-green-500/20 text-green-300 border border-green-500/30",
  "Courses Manager": "bg-teal-500/20 text-teal-300 border border-teal-500/30",
  Designer: "bg-pink-500/20 text-pink-300 border border-pink-500/30",
  Marketing: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  Developer: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
  Moderator: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  "Top Member": "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  "Top Volunteer": "bg-rose-500/20 text-rose-300 border border-rose-500/30",
  Tutor: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  "Senior Tutor": "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30",
  "Admin Tutor": "bg-red-500/20 text-red-300 border border-red-500/30",
  Staff: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  "Board Member": "bg-sky-500/20 text-sky-300 border border-sky-500/30",
  "Marketing Volunteer": "bg-green-500/20 text-green-300 border border-green-500/30",
  "Tutor Volunteer": "bg-sky-500/20 text-sky-300 border border-sky-500/30",
  "Discord Mod": "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  "Paper Volunteer": "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  "Notes Volunteer": "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30",
  "Data Volunteer": "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  Advisor: "bg-rose-400/20 text-rose-200 border border-rose-400/30",
  "Tech Team": "bg-red-500/20 text-red-300 border border-red-500/30",
};

const getTagColor = (tag: string) =>
  tagColors[tag] ?? "bg-gray-500/20 text-gray-300 border border-gray-500/30";

const UserModal = ({ user, onClose }: { user: User; onClose: () => void }) => (
  <div
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
    onClick={onClose}
  >
    <div
      className="bg-n-7 border border-white/10 rounded-2xl p-8 max-w-md w-full relative shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all text-lg"
      >
        ✕
      </button>
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-2 ring-purple-500/60">
          <PhotoProvider>
            <PhotoView src={user.avatar}>
              <Image src={user.avatar} alt={user.name} width={96} height={96} className="object-cover w-full h-full" />
            </PhotoView>
          </PhotoProvider>
        </div>
        <h3 className="text-xl font-bold text-white">{user.name}</h3>
        <p className="text-sm text-purple-400 font-medium mt-0.5">{user.role}</p>
        {user.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            {user.tags.map((tag, index) => (
              <span key={`${user.name}-${tag}-${index}`} className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}>
                {tag}
              </span>
            ))}
          </div>
        )}
        {user.bio && <p className="text-sm text-gray-400 mt-4 leading-relaxed">{user.bio}</p>}
        <div className="flex gap-4 mt-5">
          {user.socialLinks.instagram && (
            <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
              <FaInstagram className="text-gray-400 text-xl hover:text-white transition-colors" />
            </a>
          )}
          {user.socialLinks.github && (
            <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer">
              <FaGithub className="text-gray-400 text-xl hover:text-white transition-colors" />
            </a>
          )}
        </div>
      </div>
    </div>
  </div>
);

const MemberCard = ({
  user,
  size = "md",
  onClick,
}: {
  user: User;
  size?: "lg" | "md" | "sm";
  onClick: () => void;
}) => {
  const avatarSize = size === "lg" ? "w-20 h-20" : size === "md" ? "w-16 h-16" : "w-12 h-12";
  const imgSize = size === "lg" ? 80 : size === "md" ? 64 : 48;

  return (
    <button
      onClick={onClick}
      className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] hover:border-purple-500/40 hover:bg-white/[0.08] transition-all group text-center hover:-translate-y-0.5"
    >
      <div
        className={`${avatarSize} rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-purple-500/60 transition-all flex-shrink-0`}
      >
        <Image
          src={user.avatar}
          alt={user.name}
          width={imgSize}
          height={imgSize}
          className="object-cover w-full h-full"
        />
      </div>
      <div>
        <p className="font-semibold text-white text-sm">{user.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{user.role}</p>
      </div>
    </button>
  );
};

// Bio and tags are rendered unconditionally with a fixed line-clamp / min-height
// (rather than only appearing when present) so every card in a row — e.g. the
// Directors tier — ends up the same height no matter how long one person's
// bio is or how many tags they have relative to the others.
const FeaturedMemberCard = ({ user, accent, onClick }: { user: User; accent: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex h-full w-full max-w-sm flex-col items-center rounded-2xl border ${accent} bg-white/[0.04] p-5 text-center transition-all hover:-translate-y-1 hover:bg-white/[0.06]`}
  >
    <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full ring-2 ring-white/15">
      <Image src={user.avatar} alt={user.name} width={96} height={96} className="h-full w-full object-cover" />
    </div>
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Featured Role</p>
    <h3 className="mt-2 text-xl font-bold text-white">{user.name}</h3>
    <p className="mt-1 text-sm font-medium text-cyan-300">{user.role}</p>
    <div className="mt-3 flex min-h-[2.25rem] flex-wrap content-start justify-center gap-1.5">
      {user.tags.map((tag, index) => (
        <span key={`${user.name}-featured-${tag}-${index}`} className={`h-fit px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}>
          {tag}
        </span>
      ))}
    </div>
    <p className="mt-4 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-gray-400">{user.bio}</p>
  </button>
);

const RosterGrid = ({
  title,
  description,
  users,
  onSelect,
}: {
  title: string;
  description: string;
  users: User[];
  onSelect: (user: User) => void;
}) => (
  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 md:p-5">
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-gray-300">
        {users.length} visible
      </span>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {users.map((user) => (
        <MemberCard key={`${title}-${user.name}-${user.role}`} user={user} size="md" onClick={() => onSelect(user)} />
      ))}
    </div>
  </div>
);

export default function AboutClient({ activeTutors }: { activeTutors: User[] }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const visibleTutors = useMemo(() => {
    const seen = new Set<string>();
    return activeTutors.filter((user) => {
      const key = `${user.name.toLowerCase()}-${user.role.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [activeTutors]);

  return (
    <div className="bg-black-100 text-white min-h-screen flex flex-col">
      <StarryBackground height="240px" intensity="medium" showMeteors={true} className="rounded-none mb-8">
        <div className="relative z-10 flex flex-col items-center justify-center h-full pt-8 text-center">
          <Cover className="inline-block px-8 py-6">
            <div className="inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1 mb-3">
              <span className="text-[10px] font-semibold text-purple-300 tracking-widest uppercase">CamBright Team</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-sora leading-tight">
              About <span className="text-purple-400 drop-shadow-[0_0_20px_rgba(192,132,252,0.7)]">CamBright</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Student-built. Community-powered. Helping learners worldwide reach top scores for free.
            </p>
          </Cover>
        </div>
      </StarryBackground>

      <div className="flex-grow px-8 py-10 max-w-7xl mx-auto w-full space-y-8">
        <section className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-n-7 to-blue-950/20 p-6 md:p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-purple-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">Founders</h2>
          </div>

          <div className="flex justify-center mb-4">
            <button
              onClick={() => setSelectedUser(founders[0])}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-purple-500/10 border border-purple-500/25 hover:bg-purple-500/15 hover:border-purple-500/40 transition-all group w-40 sm:w-44"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-purple-500/60 group-hover:ring-purple-400 transition-all">
                <Image
                  src={founders[0].avatar}
                  alt={founders[0].name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="text-center">
                <p className="font-bold text-white">{founders[0].name}</p>
                <p className="text-xs text-purple-400 font-medium mt-0.5">{founders[0].role}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Co-Founder
                </span>
              </div>
            </button>
          </div>

          <div className="flex flex-wrap items-stretch justify-center gap-3">
            {founders.slice(1).map((user) => (
              <div key={`founder-${user.name}`} className="w-32 sm:w-36">
                <MemberCard user={user} size="md" onClick={() => setSelectedUser(user)} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/25 via-n-7 to-purple-950/20 p-6 md:p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-indigo-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">Directors</h2>
          </div>
          <div className="flex flex-wrap items-stretch justify-center gap-4">
            {directors.map((user) => (
              <div key={`director-${user.name}`} className="w-full sm:w-80">
                <FeaturedMemberCard user={user} accent="border-indigo-500/30" onClick={() => setSelectedUser(user)} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 via-n-7 to-indigo-950/20 p-6 md:p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-cyan-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">Our Board</h2>
          </div>
          <div className="flex flex-wrap items-stretch justify-center gap-3">
            {board.map((user) => (
              <div key={`board-${user.name}`} className="w-32 sm:w-36">
                <MemberCard user={user} size="md" onClick={() => setSelectedUser(user)} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/25 via-n-7 to-violet-950/20 p-6 md:p-7">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 bg-emerald-500 rounded-full" />
                <h2 className="text-xl font-bold text-white">Staff & Tutors</h2>
              </div>
              <p className="mt-2 text-sm text-gray-400 max-w-2xl">
                Every staff and tutor account is visible here at once. No carousel, no hidden cards, no scrolling roster.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                {staffMembers.length} staff
              </span>
              <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                {visibleTutors.length} tutors
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <RosterGrid
              title="Staff"
              description="Founders, board members, and operational team accounts."
              users={staffMembers}
              onSelect={setSelectedUser}
            />
            <RosterGrid
              title="Tutors"
              description="Active tutor accounts currently registered in CamBright."
              users={visibleTutors}
              onSelect={setSelectedUser}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-950/20 via-n-7 to-amber-950/20 p-6 md:p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-orange-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">Our Story</h2>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 p-4 md:p-6">
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              CamBright was built by students who understood the pressure of IGCSE prep and wanted to make strong support available to everyone.
            </p>
            <div className="relative">
              <div className="absolute left-[10px] top-1 bottom-1 w-[2px] bg-gradient-to-b from-orange-400/70 via-purple-400/70 to-cyan-400/70" />
              <div className="space-y-4 md:space-y-5">
                {storyMilestones.map((milestone, index) => (
                  <div key={milestone.title} className="relative pl-8">
                    <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full border border-orange-300/60 bg-orange-500/20" />
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs font-semibold tracking-widest uppercase text-orange-300 mb-1">
                        Stage {index + 1}
                      </div>
                      <h3 className="text-base font-semibold text-white mb-1.5">{milestone.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{milestone.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-purple-950/30 to-blue-950/30 p-6 md:p-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-lg md:text-xl font-semibold text-white">Want to help students level up?</h3>
            <p className="text-sm text-gray-400 mt-1">Join our mission and build the future of free IGCSE support.</p>
          </div>
          <div className="flex justify-center gap-3 pt-1 md:pt-0">
            <Link href="/help#sendmsg" target="_blank" rel="noopener noreferrer">
              <Button className="px-5 py-2 rounded-full font-semibold">Contact Us</Button>
            </Link>
            <Link href="/help#sendmsg" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="px-5 py-2 rounded-full font-semibold border-white/20 text-white hover:bg-white/10"
              >
                Join Our Team
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      <Footerer />
    </div>
  );
}