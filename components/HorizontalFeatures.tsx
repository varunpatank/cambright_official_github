"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Users, Trophy, FileText, Calculator, Lightbulb, Target, MessageCircle, Calendar } from "lucide-react";

const features = [
  {
    id: 1,
    icon: BookOpen,
    title: "Comprehensive Resources",
    description: "Access unlimited study materials and online courses for all IGCSE subjects",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    icon: Users,
    title: "Expert Tutors",
    description: "Get help from qualified tutors available 24/7 wherever you are",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    icon: FileText,
    title: "Latest Past Papers",
    description: "Practice with the most recent past papers and model answers",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: 4,
    icon: Calculator,
    title: "Mock Exams & Auto Marking",
    description: "Take realistic mock exams with instant automated grading",
    color: "from-orange-500 to-red-500"
  },
  {
    id: 5,
    icon: Trophy,
    title: "Leaderboards",
    description: "Compete with students worldwide and track your progress",
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: 6,
    icon: Target,
    title: "Progress Tracker",
    description: "Monitor your study progress and boost productivity",
    color: "from-indigo-500 to-purple-500"
  },
  {
    id: 7,
    icon: Lightbulb,
    title: "AI Study Assistant",
    description: "Get personalized study recommendations and instant help",
    color: "from-teal-500 to-green-500"
  },
  {
    id: 8,
    icon: MessageCircle,
    title: "Study Hubs",
    description: "Create and join study groups with fellow students",
    color: "from-pink-500 to-rose-500"
  },
  {
    id: 9,
    icon: Calendar,
    title: "Study Planner",
    description: "Schedule your studies and get automated reminders",
    color: "from-cyan-500 to-blue-500"
  }
];

const HorizontalFeatures = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      const currentScroll = scrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="w-full py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">
          <span className="text-purple-300">Powerful</span> Features for IGCSE Success
        </h2>
        <p className="text-white-200 text-lg max-w-2xl mx-auto">
          Everything you need to excel in your IGCSE exams, all in one platform
        </p>
      </div>

      <div className="relative">
        {/* Left scroll button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black-100/80 hover:bg-black-200/80 backdrop-blur-sm border border-white/10 rounded-full p-3 transition-all duration-300 hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        {/* Right scroll button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black-100/80 hover:bg-black-200/80 backdrop-blur-sm border border-white/10 rounded-full p-3 transition-all duration-300 hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Horizontal scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-12 py-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.id}
                className="flex-shrink-0 w-80 h-64 bg-gradient-to-br from-black-100 to-black-200 rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-white-200 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Gradient overlays for scroll indication */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black-100 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black-100 to-transparent pointer-events-none" />
      </div>

      {/* Stats section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-300 mb-2">2000+</div>
          <div className="text-white-200">Active Students</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-300 mb-2">5+</div>
          <div className="text-white-200">Partner Schools</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-300 mb-2">100%</div>
          <div className="text-white-200">Free Access</div>
        </div>
      </div>
    </section>
  );
};

export default HorizontalFeatures;
