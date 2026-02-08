"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
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
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { StarryBackground } from "@/components/ui/starry-background";
import { Cover } from "@/components/ui/cover";

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
    title: "Courses",
    description: "Access comprehensive IGCSE & A-Level courses",
    icon: BookOpen,
    href: "/dashboard/mycourses",
    color: "bg-blue-500",
    bgGradient: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-500/30"
  },
  {
    title: "Notes",
    description: "Study with premium revision notes",
    icon: FileText,
    href: "/dashboard/mynotes",
    color: "bg-green-500",
    bgGradient: "from-green-500/20 to-green-600/20",
    borderColor: "border-green-500/30"
  },
  {
    title: "Grade Predictor",
    description: "Predict your IGCSE grades accurately",
    icon: Calculator,
    href: "/predictor",
    color: "bg-purple-500",
    bgGradient: "from-purple-500/20 to-purple-600/20",
    borderColor: "border-purple-500/30"
  },
  {
    title: "Quiz Generator",
    description: "Generate practice questions with AI",
    icon: Target,
    href: "/quizzer",
    color: "bg-orange-500",
    bgGradient: "from-orange-500/20 to-orange-600/20",
    borderColor: "border-orange-500/30"
  },
  {
    title: "Progress Tracker",
    description: "Track your academic progress",
    icon: BarChart3,
    href: "/tracker/select-group",
    color: "bg-cyan-500",
    bgGradient: "from-cyan-500/20 to-cyan-600/20",
    borderColor: "border-cyan-500/30"
  },
  {
    title: "Schools",
    description: "Connect with CamBright schools",
    icon: School,
    href: "/schools",
    color: "bg-indigo-500",
    bgGradient: "from-indigo-500/20 to-indigo-600/20",
    borderColor: "border-indigo-500/30"
  },
  {
    title: "Profile",
    description: "Manage your account and achievements",
    icon: Users,
    href: "/profile",
    color: "bg-red-500",
    bgGradient: "from-red-500/20 to-red-600/20",
    borderColor: "border-red-500/30"
  }
];

export function DashboardClient({ userId, coursesData, notesData }: DashboardClientProps) {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="min-h-screen bg-black-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Starry Header Section */}
        <StarryBackground height="180px" intensity="medium" className="mt-4">
          <div className="flex items-center justify-center h-full py-8">
            <Cover className="inline-block px-8 py-6 bg-neutral-900/60 rounded-xl">
              <div className="text-center space-y-3">
                <h1 className="text-4xl md:text-5xl font-sora font-bold text-white">
                  Welcome Back, <span className="text-purple-400">{capitalizedName}</span>!
                </h1>
                <p className="text-lg md:text-xl text-gray-300 font-code">
                  Continue your educational journey with CamBright
                </p>
              </div>
            </Cover>
          </div>
        </StarryBackground>

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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{coursesData.inProgress}</p>
                  <p className="text-sm text-gray-300">Courses in Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{coursesData.completed}</p>
                  <p className="text-sm text-gray-300">Courses Completed</p>
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
                  <p className="text-sm text-gray-300">Notes in Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-orange-800/50 border-yellow-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{Math.round(progressPercentage)}%</p>
                  <p className="text-sm text-gray-300">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Stats */}
        {!isLoading && stats && (
          <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/30 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-white font-sora flex items-center justify-center space-x-2 text-xl">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
                <span>CamBright Community</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <Users className="w-8 h-8 text-cyan-400" />
                    <span className="text-3xl font-bold text-cyan-400">{stats.totalUsers > 2000 ? '2000+' : stats.totalUsers.toLocaleString()}</span>
                    <p className="text-sm text-gray-300 font-semibold">Students</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <Activity className="w-8 h-8 text-emerald-400" />
                    <AnimatedCounter 
                      baseValue={stats.activeUsers} 
                      className="text-3xl font-bold text-emerald-400"
                    />
                    <p className="text-sm text-gray-300 font-semibold">Active Users</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <School className="w-8 h-8 text-violet-400" />
                    <span className="text-3xl font-bold text-violet-400">{stats.totalSchools > 5 ? '5+' : stats.totalSchools}</span>
                    <p className="text-sm text-gray-300 font-semibold">Schools</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Tools & Resources Grid */}
        <Card className="bg-black/50 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white font-sora text-2xl flex items-center space-x-2">
              <Star className="w-6 h-6 text-yellow-400" />
              <span>Tools & Resources</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Access all CamBright educational tools and resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tools.map((tool) => (
                <Link key={tool.title} href={tool.href}>
                  <Card className={`bg-gradient-to-br ${tool.bgGradient} border ${tool.borderColor} hover:scale-105 transition-all duration-300 cursor-pointer group h-full`}>
                    <CardContent className="p-6 h-full flex flex-col justify-center">
                      <div className="text-center space-y-4">
                        <div className={`w-16 h-16 mx-auto ${tool.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <tool.icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg font-sora">{tool.title}</h3>
                          <p className="text-sm text-gray-300 mt-1 font-code">{tool.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
