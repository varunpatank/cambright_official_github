"use client";
import React, { useState } from "react";
import Modal from "./_components/Modal";
import FlashcardList from "./_components/FlashcardList";
import SubjectDrop from "./_components/SubjectDrop";
import "./_components/custom.css";
import { FaGear } from "react-icons/fa6";
import { StarsBackground } from "@/components/ui/shooting-stars";

const FlashcardsPage: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [numCards, setNumCards] = useState<string>("3");
  const [generateAll, setGenerateAll] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [bgColor, setBgColor] = useState<string>("n-6");
  const [textColor, setTextColor] = useState<string>("white");
  const [roundness, setRoundness] = useState<string>("lg");
  const [highlightColor, setHighlightColor] = useState<string>("[#75399b]");
  const [flashcardsGenerated, setFlashcardsGenerated] = useState<boolean>(false);

  const handleApplyStyles = (
    bg: string,
    text: string,
    round: string,
    highlight: string
  ) => {
    setBgColor(bg);
    setTextColor(text);
    setRoundness(round);
    setHighlightColor(highlight);
  };

  const handleGenerateClick = () => {
    setFlashcardsGenerated(true);
  };

  const handleNumCardsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") return setNumCards("");
    const parsed = Number(value);
    if (!isNaN(parsed) && parsed >= 0) {
      setNumCards(parsed.toString());
    }
  };

  return (
    <div className="min-h-screen bg-n-8 text-white p-6">
      <StarsBackground />

      {/* Title */}
      <div className="max-w-4xl mx-auto text-center pt-12 pb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide leading-tight">
          Flashcards.
        </h1>
      </div>

      {/* Controls */}
      <div className="max-w-5xl mx-auto flex flex-col space-y-6 px-4 sm:px-6 lg:px-8 w-full">

        {/* Subject Dropdown */}
        <div className="w-full lg:-ml-9">
  <SubjectDrop
    onSubjectChange={setSelectedSubject}
    onTopicsChange={setSelectedTopics}
  />
</div>


        {/* Number + Generate */}
        <div className="w-full flex flex-col sm:flex-row sm:space-x-4">
          <input
            type="number"
            value={numCards}
            onChange={handleNumCardsChange}
            className="w-full sm:w-1/2 p-3 rounded-lg text-lg bg-n-6 disabled:bg-n-5 disabled:text-muted-foreground"
            disabled={generateAll}
            min={1}
          />
          <button
            onClick={handleGenerateClick}
            className="w-full sm:w-1/2 mt-4 sm:mt-0 p-3 rounded-lg text-lg font-semibold bg-n-5 hover:bg-n-5/70 transition-all disabled:bg-n-6 disabled:text-muted-foreground"
            disabled={!selectedSubject}
          >
            Generate
          </button>
        </div>

        {/* Settings */}
        <button
          onClick={() => setModalOpen(true)}
          className="bg-n-5 hover:bg-n-6 transition-all text-white p-3 rounded-lg w-max"
        >
          <FaGear size={20} />
        </button>

        {/* Modal */}
        {modalOpen && (
          <Modal
            onClose={() => setModalOpen(false)}
            onApply={handleApplyStyles}
          />
        )}
      </div>

      {/* Flashcards Grid */}
      {flashcardsGenerated && (
        <div className="max-w-7xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
          <FlashcardList
            selectedSubject={selectedSubject}
            selectedTopics={selectedTopics}
            numCards={Number(numCards)}
            generateAll={generateAll}
            bgColor={bgColor}
            textColor={textColor}
            roundness={roundness}
            highlightColor={highlightColor}
          />
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
