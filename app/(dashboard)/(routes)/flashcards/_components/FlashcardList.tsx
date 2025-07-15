import React, { useState, useEffect } from "react";
import FlashCard from "./FlashCard";
import { Cards } from "../data";

interface FlashcardListProps {
  selectedSubject: string;
  selectedTopics: string[];
  numCards: number;
  generateAll: boolean;
  bgColor: string;
  textColor: string;
  roundness: string;
  highlightColor: string;
}

const FlashcardList: React.FC<FlashcardListProps> = ({
  selectedSubject,
  selectedTopics,
  numCards,
  generateAll,
  bgColor,
  textColor,
  roundness,
  highlightColor,
}) => {
  const [cardsToShow, setCardsToShow] = useState<any[]>([]);

  useEffect(() => {
    const filteredCards = Cards.filter(
      (card) =>
        card.subject === selectedSubject &&
        (selectedTopics.length === 0 || selectedTopics.includes(card.topic))
    );

    const validNumCards = numCards > 0 ? numCards : filteredCards.length;

    if (generateAll) {
      setCardsToShow(filteredCards);
    } else {
      setCardsToShow(filteredCards.slice(0, validNumCards));
    }
  }, [selectedSubject, selectedTopics, numCards, generateAll]);

  return (
  <div className="w-full">
    <div className="pl-6 sm:pl-12 md:pl-24 lg:pl-28 transition-all duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cardsToShow.map((card) => (
          <FlashCard
            key={card.id}
            question={card.question}
            answer={card.answer}
            image={card.image}
            bgColor={bgColor}
            textColor={textColor}
            roundness={roundness}
            highlightColor={highlightColor}
          />
        ))}
      </div>
    </div>
  </div>
);



};

export default FlashcardList;
