"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { 
  BookOpen, 
  Brain, 
  Calculator, 
  FileText, 
  GraduationCap, 
  LineChart, 
  MessageSquare, 
  School, 
  Trophy, 
  Users, 
  Zap,
  Target,
  PenTool,
  BarChart3,
  Clock,
  CheckCircle,
  Star,
  Globe,
  MapPin,
  TrendingUp,
  Activity,
  Sparkles,
  Bot,
  FlaskConical,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { StarryBackground } from "@/components/ui/starry-background";
import { useConfettiStore } from "@/hooks/use-confetti-store";

interface DashboardClientProps {
  userId: string;
  coursesData: {
    completed: number;
    inProgress: number;
  };
  notesData: {
    completed: number;
    inProgress: number;
  };
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSchools: number;
  userSchools: Array<{
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    location: string | null;
  }>;
  userProfile: {
    XP: number;
    name: string;
    imageUrl: string | null;
    email: string;
  };
}

const tools = [
  {
    title: "Tuto",
    description: "CamBright Intelligence tutor for any IGCSE subject",
    icon: Bot,
    href: "/tuto-ai",
    color: "bg-cyan-500",
    bgGradient: "from-cyan-500/20 to-cyan-600/20",
    borderColor: "border-cyan-500/30"
  },
  {
    title: "Past Papers",
    description: "Cambridge past papers with model answers",
    icon: FileText,
    href: "/past-papers",
    color: "bg-green-500",
    bgGradient: "from-green-500/20 to-green-600/20",
    borderColor: "border-green-500/30"
  },
  {
    title: "Revision Notes",
    description: "Premium notes for all IGCSE subjects",
    icon: BookOpen,
    href: "/search-notes",
    color: "bg-blue-500",
    bgGradient: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-500/30"
  },
  {
    title: "Intelligence Flashcards",
    description: "Generate flashcards instantly with Gemini",
    icon: Layers,
    href: "/flashcards",
    color: "bg-pink-500",
    bgGradient: "from-pink-500/20 to-pink-600/20",
    borderColor: "border-pink-500/30"
  },
  {
    title: "Grade Predictor",
    description: "Cambridge-calibrated grade predictions",
    icon: Calculator,
    href: "/predictor",
    color: "bg-purple-500",
    bgGradient: "from-purple-500/20 to-purple-600/20",
    borderColor: "border-purple-500/30"
  },
  {
    title: "Question Quizzer",
    description: "CamBright Intelligence-generated practice questions",
    icon: Target,
    href: "/quizzer",
    color: "bg-orange-500",
    bgGradient: "from-orange-500/20 to-orange-600/20",
    borderColor: "border-orange-500/30"
  },
  {
    title: "MCQ Mock Exam",
    description: "Timed mock exams with auto marking",
    icon: Brain,
    href: "/mcq-mock",
    color: "bg-teal-500",
    bgGradient: "from-teal-500/20 to-teal-600/20",
    borderColor: "border-teal-500/30"
  },
  {
    title: "Leaderboard",
    description: "Earn XP and compete worldwide",
    icon: Trophy,
    href: "/leaderboard",
    color: "bg-yellow-500",
    bgGradient: "from-yellow-500/20 to-yellow-600/20",
    borderColor: "border-yellow-500/30"
  },
  {
    title: "Tutoring Program",
    description: "Join CamBright tutors and launch your course",
    icon: GraduationCap,
    href: "/tutoring-program",
    color: "bg-violet-500",
    bgGradient: "from-violet-500/20 to-fuchsia-600/20",
    borderColor: "border-violet-500/30"
  }
];

export function DashboardClient({ userId, coursesData, notesData }: DashboardClientProps) {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const confetti = useConfettiStore();

  useEffect(() => {
    // Fire confetti once ever per browser on v2 launch
    try {
      const key = "cambright_v2_welcomed";
      if (typeof window !== "undefined" && !localStorage.getItem(key)) {
        setTimeout(() => confetti.onOpen(), 1200);
        localStorage.setItem(key, "1");
      }
    } catch {}
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const firstName = user?.firstName || user?.username || stats?.userProfile?.name?.split(' ')[0] || 'Student';
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  const totalCourses = coursesData.completed + coursesData.inProgress;
  const totalNotes = notesData.completed + notesData.inProgress;
  const progressPercentage = totalCourses > 0 ? (coursesData.completed / totalCourses) * 100 : 0;

  return (
    <div className="h-[calc(100vh-80px)] overflow-y-auto overflow-x-hidden bg-black-100">
      <style>{`
        @keyframes logo-shine {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        @keyframes welcome-ambient {
          0%   { opacity: 0.28; transform: translateX(-3%) scale(1); }
          50%  { opacity: 0.48; transform: translateX(2%) scale(1.03); }
          100% { opacity: 0.28; transform: translateX(-3%) scale(1); }
        }

      `}</style>
      {/* Starry Header Section */}
      <StarryBackground height="270px" intensity="medium" showMeteors={false} className="rounded-none">
        <div className="relative z-10 h-full px-8 pt-7 pb-2">
          <div className="mx-auto grid h-full w-full max-w-7xl items-stretch gap-4 md:grid-cols-[minmax(0,0.62fr)_minmax(0,0.38fr)]">
            {/* left: welcome card */}
            <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-black/35 px-6 py-5 flex flex-col justify-center">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at 20% 50%, rgba(139,92,246,0.20), transparent 55%), radial-gradient(circle at 80% 40%, rgba(59,130,246,0.12), transparent 50%)",
                  animation: "welcome-ambient 8s ease-in-out infinite",
                }}
              />
              <div className="relative z-10 inline-flex w-fit items-center gap-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1 mb-3">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] font-semibold text-purple-300 tracking-widest uppercase">CamBright v2 - Now Live</span>
              </div>
              <h1 className="relative z-10 text-4xl md:text-5xl font-bold mb-2 font-sora text-left leading-tight">
                Welcome Back, <span className="text-purple-400">{capitalizedName}</span>!
              </h1>
              <p className="relative z-10 text-sm text-gray-400 text-left">Tuto &middot; Intelligence Flashcards &middot; Grade Predictor &middot; MCQ Mocks &middot; and more</p>
            </div>

            {/* right: logo card */}
            <div className="hidden md:flex h-full items-center">
              <div className="relative h-full w-full rounded-2xl border border-white/10 bg-black/35 px-5 py-5 flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo-clean.png"
                  alt="CamBright v2"
                  width={400}
                  height={96}
                  className="object-contain relative z-10 w-full"
                  priority
                  quality={100}
                  style={{ filter: "drop-shadow(0 0 18px rgba(139,92,246,0.4))" }}
                />
                <div
                  className="absolute inset-0 z-20 pointer-events-none"
                  style={{
                    background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
                    backgroundSize: "200% 100%",
                    animation: "logo-shine 8.5s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </StarryBackground>

      <div className="px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* User Profile Card */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt="Profile" 
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-white font-sora">
                  {user?.fullName || stats?.userProfile?.name || `${user?.firstName || 'Student'} ${user?.lastName || ''}`.trim()}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {stats?.userProfile?.email || user?.emailAddresses?.[0]?.emailAddress}
                </CardDescription>
                <div className="flex items-center space-x-2 mt-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">
                    {stats?.userProfile?.XP || 0} XP
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* ✨ What's New in v2 */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/40 via-n-7 to-blue-950/40 p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-300 tracking-widest uppercase">What&apos;s New in CamBright v2</span>
            </div>
            <p className="text-xs text-gray-500 -mt-2">The biggest update yet — CamBright Intelligence tools built for IGCSE success</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: Bot, label: "Tuto", desc: "CamBright Intelligence tutor", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
                { icon: FlaskConical, label: "Intelligence Flashcards", desc: "Generate with CamBright", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
                { icon: Target, label: "Question Quizzer", desc: "Intelligence practice Qs", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
                { icon: Calculator, label: "Grade Predictor", desc: "Cambridge thresholds", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
                { icon: Brain, label: "MCQ Mock Exams", desc: "Auto-marked mocks", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" },
              ].map(({ icon: Icon, label, desc, color, bg }) => (
                <div key={label} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${bg}`}>
                  <Icon className={`w-4 h-4 ${color} shrink-0`} />
                  <div className="text-left">
                    <p className={`text-xs font-semibold ${color}`}>{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats?.userProfile?.XP ?? 0}</p>
                  <p className="text-sm text-gray-300">XP Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/50 border-cyan-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Brain className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-2xl font-bold text-white">8</p>
                  <p className="text-sm text-gray-300">CamBright Intelligence Tools</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{notesData.inProgress}</p>
                  <p className="text-sm text-gray-300">Notes Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{notesData.completed}</p>
                  <p className="text-sm text-gray-300">Notes Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Schools */}
        {stats?.userSchools && stats.userSchools.length > 0 && (
          <Card className="bg-gradient-to-r from-green-900/50 to-teal-900/50 border-green-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-sora flex items-center space-x-2">
                <School className="w-6 h-6 text-green-400" />
                <span>Your Schools</span>
              </CardTitle>
              <CardDescription className="text-gray-300">
                Schools where you have admin access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.userSchools.map((school) => (
                  <Link key={school.id} href={`/schools/${school.id}`}>
                    <Card className="bg-white/10 border-green-500/20 hover:bg-white/20 transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                            <School className="w-6 h-6 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-sm">{school.name}</h3>
                            {school.location && (
                              <div className="flex items-center space-x-1 mt-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-400">{school.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
      </div>
    </div>
  );
}
