"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Bot, FileText, Calculator, BookOpen, Trophy, Layers, Target, CheckSquare } from "lucide-react";

const features = [
  {
    id: 1,
    icon: Bot,
    title: "CBI Tutor",
    description: "CamBright Intelligence (CBI) tutor — ask anything about your IGCSE subjects",
    color: "from-cyan-500 to-blue-500"
  },
  {
    id: 2,
    icon: FileText,
    title: "Past Papers",
    description: "Cambridge past papers with model answers for IGCSE, AS & A Level",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: 3,
    icon: BookOpen,
    title: "Revision Notes",
    description: "Premium revision notes covering all major IGCSE subjects",
    color: "from-blue-500 to-indigo-500"
  },
  {
    id: 4,
    icon: Layers,
    title: "Intelligence Flashcards",
    description: "Generate personalised flashcards instantly with CamBright Intelligence",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: 5,
    icon: Calculator,
    title: "Grade Predictor",
    description: "Predict your Cambridge grade using 10-year averaged thresholds",
    color: "from-orange-500 to-red-500"
  },
  {
    id: 6,
    icon: Target,
    title: "Question Quizzer",
    description: "CamBright Intelligence-generated practice questions tailored to your subject and topic",
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: 7,
    icon: CheckSquare,
    title: "MCQ Mock Exam",
    description: "Timed multiple-choice mock exams with instant automated marking",
    color: "from-teal-500 to-cyan-500"
  },
  {
    id: 8,
    icon: Trophy,
    title: "Leaderboard",
    description: "Earn XP, compete with students worldwide and rise through the ranks",
    color: "from-yellow-500 to-amber-500"
  },
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
    <section className="w-full py-12">
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
                className="flex-shrink-0 w-64 h-48 bg-gradient-to-br from-black-100 to-black-200 rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-white-200 text-sm leading-relaxed">
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
    </section>
  );
};

export default HorizontalFeatures;
