"use client";
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  BookOpen, 
  ChevronDown, 
  Check, 
  Loader2,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Zap
} from "lucide-react";
import { Cover } from "@/components/ui/cover";
import { StarryBackground } from "@/components/ui/starry-background";
import { 
  generateFlashcards, 
  GeneratedFlashcard, 
  GenerationProgress,
  FLASHCARD_SUBJECTS 
} from "./services/flashcardService";

// Animated Flashcard Component
const AIFlashcard: React.FC<{
  card: GeneratedFlashcard;
  index: number;
}> = ({ card, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Determine if we need a larger card based on text length
  const needsLargerCard = card.question.length > 100 || card.answer.length > 120;
  const cardHeight = needsLargerCard ? "h-80" : "h-64";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="perspective-1000"
    >
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={`relative w-full ${cardHeight} cursor-pointer group`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/30 p-5 flex flex-col justify-center items-center text-center shadow-lg shadow-purple-500/10 group-hover:border-purple-500/50 transition-colors overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium max-w-[60%] truncate">
              {card.topic}
            </div>
            <BookOpen className="w-5 h-5 text-purple-400 mb-2 opacity-50 flex-shrink-0" />
            <p className="text-white text-base font-medium leading-relaxed line-clamp-5 overflow-hidden">
              {card.question}
            </p>
            <p className="text-purple-400/60 text-xs mt-3 flex-shrink-0">Click to reveal</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-purple-900/50 to-gray-900 border border-purple-500/50 p-5 flex flex-col justify-center items-center text-center shadow-lg shadow-purple-500/20 overflow-hidden"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <Zap className="w-5 h-5 text-purple-400 mb-2 flex-shrink-0" />
            <p className="text-white text-lg font-semibold leading-relaxed line-clamp-6 overflow-hidden">
              {card.answer}
            </p>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-1 w-16 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Subject Selector Component
const SubjectSelector: React.FC<{
  selectedSubject: string;
  onSelect: (subject: string) => void;
}> = ({ selectedSubject, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const subjects = Object.keys(FLASHCARD_SUBJECTS);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 rounded-xl bg-gray-900/80 border border-gray-700 hover:border-purple-500/50 transition-all flex items-center justify-between text-left group"
      >
        <span className={selectedSubject ? "text-white" : "text-gray-400"}>
          {selectedSubject || "Select a subject..."}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 py-2 rounded-xl bg-gray-900 border border-gray-700 shadow-xl shadow-black/50 max-h-64 overflow-y-auto"
          >
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => {
                  onSelect(subject);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-purple-500/20 transition-colors flex items-center gap-3"
              >
                {selectedSubject === subject && (
                  <Check className="w-4 h-4 text-purple-400" />
                )}
                <span className={selectedSubject === subject ? "text-purple-400" : "text-gray-300"}>
                  {subject}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Topic Pills Component
const TopicPills: React.FC<{
  topics: string[];
  selectedTopics: string[];
  onToggle: (topic: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}> = ({ topics, selectedTopics, onToggle, onSelectAll, onDeselectAll }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">Topics</span>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Select All
          </button>
          <span className="text-gray-600">|</span>
          <button
            onClick={onDeselectAll}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            Deselect All
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
        {topics.map((topic) => {
          const isSelected = selectedTopics.includes(topic);
          return (
            <button
              key={topic}
              onClick={() => onToggle(topic)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                  : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
              }`}
            >
              {topic}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Main Flashcards Page
const FlashcardsPage: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [numCards, setNumCards] = useState<number>(10);
  const [flashcards, setFlashcards] = useState<GeneratedFlashcard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const cardsPerPage = 8;

  // Get available topics for selected subject
  const availableTopics = selectedSubject 
    ? FLASHCARD_SUBJECTS[selectedSubject as keyof typeof FLASHCARD_SUBJECTS] || []
    : [];

  // Handle subject change
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    const topics = FLASHCARD_SUBJECTS[subject as keyof typeof FLASHCARD_SUBJECTS] || [];
    setSelectedTopics(topics); // Select all by default
    setFlashcards([]);
  };

  // Toggle topic selection
  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  // Generate flashcards
  const handleGenerate = async () => {
    if (!selectedSubject) return;
    
    setIsGenerating(true);
    setFlashcards([]);
    setCurrentPage(0);

    try {
      const cards = await generateFlashcards(
        selectedSubject,
        selectedTopics,
        numCards,
        setProgress
      );
      setFlashcards(cards);
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(flashcards.length / cardsPerPage);
  const currentCards = flashcards.slice(
    currentPage * cardsPerPage,
    (currentPage + 1) * cardsPerPage
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Starry Header */}
      <StarryBackground height="280px" intensity="high" showMeteors={true}>
        <div className="relative z-10 flex flex-col items-center justify-center h-full pt-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">AI-Powered</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Cover className="inline-block px-8 py-6">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                Flashcard <span className="text-purple-400">Generator</span>.
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Generate AI-powered flashcards tailored to your subjects and topics.
                Perfect for IGCSE, AS, and A-Level revision.
              </p>
            </Cover>
          </motion.div>
        </div>
      </StarryBackground>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 mb-8 space-y-6"
        >
          {/* Subject Selection */}
          <SubjectSelector
            selectedSubject={selectedSubject}
            onSelect={handleSubjectChange}
          />

          {/* Topics */}
          {availableTopics.length > 0 && (
            <TopicPills
              topics={availableTopics}
              selectedTopics={selectedTopics}
              onToggle={toggleTopic}
              onSelectAll={() => setSelectedTopics(availableTopics)}
              onDeselectAll={() => setSelectedTopics([])}
            />
          )}

          {/* Number of Cards & Generate */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-400 text-sm mb-2">
                Number of Cards (max 40)
              </label>
              <input
                type="number"
                value={numCards}
                onChange={(e) => setNumCards(Math.min(40, Math.max(1, parseInt(e.target.value) || 1)))}
                min={1}
                max={40}
                className="w-full px-4 py-3 rounded-xl bg-gray-900/80 border border-gray-700 focus:border-purple-500/50 focus:outline-none transition-colors text-white"
                placeholder="Enter number of cards..."
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={!selectedSubject || isGenerating}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-gray-700 disabled:to-gray-600 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Cards
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {isGenerating && progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{progress.status}</span>
                <span className="text-purple-400">{progress.percentage}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Flashcards Grid */}
        {flashcards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-gray-400">
                  <span className="text-white font-semibold">{flashcards.length}</span> cards generated
                </span>
                <button
                  onClick={() => setFlashcards([])}
                  className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-gray-400 text-sm">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentCards.map((card, index) => (
                <AIFlashcard key={card.id} card={card} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isGenerating && flashcards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Ready to generate flashcards
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Select a subject and topics above, then click Generate to create
              AI-powered flashcards for your revision.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsPage;
