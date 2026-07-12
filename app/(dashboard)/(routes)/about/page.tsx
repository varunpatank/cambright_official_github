"use client";
import { useState } from "react";
import Image from "next/image";
import { FaGithub } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import Footerer from "@/components/Footerer";
import Link from "next/link";
import { StarryBackground } from "@/components/ui/starry-background";
import { Cover } from "@/components/ui/cover";
import { Button } from "@/components/ui/button";

interface SocialLinks {
  instagram?: string;
  github?: string;
}

interface User {
  name: string;
  role: string;
  bio: string;
  tags: string[];
  socialLinks: SocialLinks;
  avatar: string;
}

const founders: User[] = [
  {
    name: "Varun Patankar",
    role: "Head of CamBright",
    bio: "Lifelong Football fan | Avid Badminton Coach & Player | App Development Enthusiast | Cambridge Glazer",
    tags: ["Co-Founder", "Head of CamBright"],
    socialLinks: { },
    avatar: "/varun.png",
  },
  {
    name: "Varram",
    role: "Head of Business",
    bio: "",
    tags: ["Co-Founder", "Business Strategist"],
    socialLinks: { github: "https://github.com/varram" },
    avatar: "/varram.png",
  },
  {
    name: "Salah",
    role: "Head of Tech",
    bio: "I'm an Arab Muslim developer with an interest in cardiology. I developed this website. 😁",
    tags: ["Co-Founder", "Head of Tech"],
    socialLinks: { github: "https://github.com", instagram: "https://www.instagram.com/sala7.dev" },
    avatar: "/salahx.png",
  },
  {
    name: "Ganna",
    role: "Recruiter & Designer",
    bio: "I craft visuals that define our brand and work to build a strong, united team that drives our success.",
    tags: ["Co-Founder", "Designer"],
    socialLinks: {},
    avatar: "/ellie.png",
  },
];

const board: User[] = [
  {
    name: "Jonathan K",
    role: "Courses Manager",
    bio: "",
    tags: ["Board Member", "Courses Manager"],
    socialLinks: {},
    avatar: "/user1.png",
  },
  {
    name: "Vaishnav B",
    role: "Tutor",
    bio: "",
    tags: ["Board Member", "Tutor"],
    socialLinks: {},
    avatar: "/user1.png",
  },
  {
    name: "Vijay P.",
    role: "Video Editor",
    bio: "Avid chess player and video maker.",
    tags: ["Video Editor"],
    socialLinks: {},
    avatar: "/user1.png",
  },
  {
    name: "Daro",
    role: "Community Manager",
    bio: "I'm Daro, an aspiring medic with a passion for learning and teaching. My goal is to make students enjoy learning!",
    tags: ["Moderator", "Top Volunteer"],
    socialLinks: { },
    avatar: "/daru.png",
  },
];

const volunteers: User[] = [
  { name: "Itrolode", role: "Paper Volunteer", bio: "", tags: ["Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Nour", role: "Volunteer", bio: "", tags: ["Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Yinzeus", role: "Paper Volunteer", bio: "", tags: ["Volunteer"], socialLinks: {}, avatar: "/user2.png" },
  { name: "Vashi", role: "Paper Volunteer", bio: "", tags: ["Volunteer"], socialLinks: {}, avatar: "/user1.png" },
];

const storyMilestones = [
  {
    title: "The Beginning",
    text: "CamBright started as a student-led effort to make high-quality IGCSE support accessible regardless of location, budget, or background.",
  },
  {
    title: "Building Momentum",
    text: "From a small volunteer circle, we expanded into a global learning community with revision notes, mock exams, and practical study tools.",
  },
  {
    title: "Mission-Driven Growth",
    text: "Every feature we ship is built around one promise: better outcomes for students through clarity, consistency, and free access.",
  },
  {
    title: "What Comes Next",
    text: "We are scaling CamBright Intelligence, deeper mock support, and smarter learning flows to help even more students hit top grades.",
  },
];

const tagColors: Record<string, string> = {
  "Co-Founder": "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  "Head of Tech": "bg-blue-500/20 text-blue-300 border border-blue-500/30",
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
            {user.tags.map((tag, i) => (
              <span key={i} className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}>{tag}</span>
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
      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] hover:border-purple-500/40 hover:bg-white/[0.08] transition-all group text-center w-full hover:-translate-y-0.5"
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

const AboutPage = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-purple-500/10 border border-purple-500/25 hover:bg-purple-500/15 hover:border-purple-500/40 transition-all group w-52"
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {founders.slice(1).map((user, i) => (
              <MemberCard key={i} user={user} size="md" onClick={() => setSelectedUser(user)} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 via-n-7 to-indigo-950/20 p-6 md:p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-cyan-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">Our Board</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {board.map((user, i) => (
              <MemberCard key={i} user={user} size="md" onClick={() => setSelectedUser(user)} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-950/20 via-n-7 to-emerald-950/20 p-6 md:p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-green-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">Volunteers</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {volunteers.map((user, i) => (
              <MemberCard key={i} user={user} size="sm" onClick={() => setSelectedUser(user)} />
            ))}
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
};

export default AboutPage;
