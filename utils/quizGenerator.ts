import {
  Question,
  MCQOption,
  MarkSchemeEntry,
  QuizQuestion,
  QuizSettings,
  Paper,
} from "@/types";

const biologyAnswers: { [key: string]: string } = {
  "which feature identifies the animal as a mammal": "C",
  "which characteristics of living things are demonstrated": "B",
  "which pair of animals have the most recent common ancestor": "C",
  "which level of organisation does the sample show": "D",
  "which arrow shows the direction of diffusion of carbon dioxide on a sunny day":
    "B",
  "which statement describes how the molecules will move": "A",
  "which element is found in proteins but not carbohydrates": "C",
  "which substances are used for photosynthesis": "B",
  "which term is defined as the taking of substances into the body through the mouth":
    "D",
  "which nutrient is deficient in the diet of a child with kwashiorkor": "C",
  "which is a description of translocation": "B",
  "which is a function of the lymphatic system": "C",
  "what is a common feature of both active and passive immunity": "D",
  "what are the products of anaerobic respiration in muscles": "D",
  "which substance remains in the blood as it passes through the kidney": "A",
  "which row shows the effects of increased adrenaline release": "D",
  "what is an advantage of asexual reproduction for a population of flowering plants":
    "B",
  "during sexual reproduction in plants, what will give rise to the greatest variation":
    "D",
  "which hormone is given to women undergoing fertility treatment": "B",
  "what is cell x": "B",
  "how many chromosomes does each of the resulting cells contain": "C",
  "which human phenotype is affected by environmental and genetic factors": "B",
  "which adaptation may be present in a xerophyte": "C",
  "what percentage of energy present in the producer is transferred to the secondary consumer":
    "C",
  "which process results in the loss of nitrates from soils": "C",
  "which characteristic applies to all forms of life": "B",
  "what does this indicate about these animals": "D",
  "which features does spirogyra share with plant cells": "A",
  "when a food substance is tested with iodine solution, which colour shows the presence of starch":
    "A",
  "what type of cell is found in layer x": "A",
  "which molecule contains magnesium": "A",
  "in which part of the body of a mammal does mechanical digestion occur": "C",
  "what is an advantage of a double circulatory system in mammals": "D",
  "in this reflex action, what is the effector": "C",
  "which description of how the pupil of the eye gets smaller is correct": "B",
  "a wind-pollinated plant has which features": "C",
  "which describes a human male gamete": "C",
  "which sex chromosomes in the egg and the sperm will produce a male child":
    "B",
  "which feature helps a xerophyte survive in its environment": "D",
  "which stage in the treatment of sewage removes large floating objects": "C",
  "what other four processes must organism x carry out to stay alive": "D",
  "what is a correct way of naming a species using the binomial system": "A",
  "what is structure x": "C",
  "which process can be carried out by only one of these cells": "C",
  "the root hair and the xylem are part of the same": "D",
  "when a frog is swimming in pond water, in which directions will there be a net diffusion":
    "C",
  "which process only involves the movement of water through the partially permeable membrane":
    "C",
  "which statement about biological molecules is correct": "A",
  "what would reduce the rate of production of amino acids": "B",
  "which is the substrate": "A",
  "which characteristic do all living organisms show": "B",
  "using the binomial naming system, the arctic fox is called vulpes lagopus":
    "B",
  "what is a characteristic of both insects and arachnids": "B",
  "what structures can be found in both plant and animal cells": "D",
  "a test was performed on a food substance": "C",
  "which statements are correct": "A",
  "which problems can be caused by malnutrition": "A",
};

const chemistryAnswers: { [key: string]: string } = {
  "which statement about atoms is correct": "B",
  "what is the chemical formula for water": "A",
  "which gas is produced when metals react with acids": "C",
  "what is the ph of a neutral solution": "B",
  "which element has the symbol na": "B",
  "what is the atomic number of carbon": "B",
  "which type of bonding occurs in sodium chloride": "A",
  "what is produced when an acid reacts with a base": "C",
  "which gas turns limewater milky": "B",
  "what is the formula for methane": "A",
  "which metal is most reactive": "A",
  "what happens during oxidation": "B",
  "which indicator turns red in acid": "A",
  "what is the molecular formula for glucose": "C",
  "which process separates mixtures based on boiling points": "B",
};

const physicsAnswers: { [key: string]: string } = {
  "what is the unit of force": "A",
  "which of the following is a vector quantity": "C",
  "what happens to the resistance of a wire when its length is doubled": "B",
  "which type of electromagnetic radiation has the highest frequency": "D",
  "what is the acceleration due to gravity on earth": "A",
  "what is the unit of energy": "B",
  "which law states that force equals mass times acceleration": "B",
  "what is the speed of light in a vacuum": "C",
  "which particle has no electric charge": "C",
  "what happens to the frequency of a wave when its wavelength increases": "A",
  "which type of current changes direction periodically": "B",
  "what is the unit of electric current": "A",
  "which material is the best conductor of electricity": "A",
  "what is the relationship between voltage, current, and resistance": "C",
  "which type of lens converges light rays": "A",
};

function getAnswerDatabase(subject: string): { [key: string]: string } {
  switch (subject.toLowerCase()) {
    case "biology":
      return biologyAnswers;
    case "chemistry":
      return chemistryAnswers;
    case "physics":
      return physicsAnswers;
    default:
      return biologyAnswers;
  }
}

function intelligentMCQAnswer(
  questionText: string,
  options: MCQOption[],
  subject: string
): string {
  const questionLower = questionText.toLowerCase();
  const answerDatabase = getAnswerDatabase(subject);

  for (const [pattern, answer] of Object.entries(answerDatabase)) {
    if (questionLower.includes(pattern)) {
      return answer;
    }
  }

  if (subject.toLowerCase() === "biology") {
    if (questionLower.includes("mammal") && questionLower.includes("feature")) {
      return (
        options.find(
          (opt) =>
            opt.optionText.toLowerCase().includes("fur") ||
            opt.optionText.toLowerCase().includes("hair")
        )?.optionLetter || "C"
      );
    }

    if (
      questionLower.includes("photosynthesis") &&
      questionLower.includes("substances")
    ) {
      return (
        options.find(
          (opt) =>
            opt.optionText.toLowerCase().includes("carbon dioxide") &&
            opt.optionText.toLowerCase().includes("water")
        )?.optionLetter || "B"
      );
    }

    if (
      questionLower.includes("protein") &&
      questionLower.includes("element")
    ) {
      return (
        options.find((opt) => opt.optionText.toLowerCase().includes("nitrogen"))
          ?.optionLetter || "C"
      );
    }
  } else if (subject.toLowerCase() === "chemistry") {
    if (questionLower.includes("water") && questionLower.includes("formula")) {
      return (
        options.find((opt) => opt.optionText.toLowerCase().includes("h2o"))
          ?.optionLetter || "A"
      );
    }

    if (questionLower.includes("neutral") && questionLower.includes("ph")) {
      return (
        options.find((opt) => opt.optionText.includes("7"))?.optionLetter || "B"
      );
    }

    if (
      questionLower.includes("metals") &&
      questionLower.includes("acids") &&
      questionLower.includes("gas")
    ) {
      return (
        options.find((opt) => opt.optionText.toLowerCase().includes("hydrogen"))
          ?.optionLetter || "C"
      );
    }
  } else if (subject.toLowerCase() === "physics") {
    if (questionLower.includes("force") && questionLower.includes("unit")) {
      return (
        options.find((opt) => opt.optionText.toLowerCase().includes("newton"))
          ?.optionLetter || "A"
      );
    }

    if (questionLower.includes("vector")) {
      return (
        options.find((opt) => opt.optionText.toLowerCase().includes("velocity"))
          ?.optionLetter || "C"
      );
    }

    if (
      questionLower.includes("gravity") &&
      questionLower.includes("acceleration")
    ) {
      return (
        options.find((opt) => opt.optionText.includes("9.8"))?.optionLetter ||
        "A"
      );
    }
  }

  return "A";
}

function getSecureRandom(): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  }
  return (Math.random() * Math.random() * Date.now()) % 1;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let pass = 0; pass < 3; pass++) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const entropy1 = getSecureRandom();
      const entropy2 = Math.random();
      const entropy3 = (Date.now() * Math.random()) % 1;
      const entropy4 = (performance.now() * Math.random()) % 1;

      const combinedEntropy = (entropy1 + entropy2 + entropy3 + entropy4) / 4;
      const j = Math.floor(combinedEntropy * (i + 1));

      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  }

  return shuffled;
}

function generateUniqueSeed(): number {
  const timestamp = Date.now();
  const performance =
    typeof window !== "undefined" && window.performance
      ? window.performance.now()
      : Math.random() * 1000;
  const random1 = Math.random();
  const random2 = Math.random();

  return (
    (timestamp * performance * random1 * random2) % Number.MAX_SAFE_INTEGER
  );
}

export function generateQuiz(
  questions: Question[],
  mcqOptions: MCQOption[],
  markScheme: MarkSchemeEntry[],
  papers: Paper[],
  settings: QuizSettings
): QuizQuestion[] {
  const uniqueSeed = generateUniqueSeed();
  console.log(`Generating quiz with unique seed: ${uniqueSeed}`);

  let availableQuestions = [...questions];

  if (settings.paper === "MCQ Only") {
    const questionsWithMCQ = availableQuestions.filter((q) => {
      const hasOptions = mcqOptions.some(
        (option) => option.questionId === q.id
      );
      return q.questionType === "MCQ" && hasOptions;
    });
    availableQuestions = questionsWithMCQ;
    console.log(
      `MCQ Only filter: ${availableQuestions.length} questions available`
    );
  } else if (settings.paper === "Theory Only") {
    availableQuestions = availableQuestions.filter(
      (q) => q.questionType === "FRQ" || q.questionType === "STRUCTURED_PART"
    );
    console.log(
      `Theory Only filter: ${availableQuestions.length} questions available`
    );
  }

  if (availableQuestions.length === 0) {
    console.log("No questions match the selected criteria");
    return [];
  }

  console.log(`Starting with ${availableQuestions.length} available questions`);

  availableQuestions = shuffleArray(availableQuestions);

  const timeBasedShuffle = availableQuestions.sort(() => {
    const entropy = (Date.now() * Math.random() * getSecureRandom()) % 1;
    return entropy - 0.5;
  });

  const performanceBasedShuffle = shuffleArray(timeBasedShuffle);

  const finalShuffled = shuffleArray(performanceBasedShuffle);

  const diagramKeywords = [
    "diagram",
    "graph",
    "chart",
    "figure",
    "image",
    "picture",
    "drawing",
    "illustration",
  ];
  const diagramQuestions = finalShuffled.filter((q) =>
    diagramKeywords.some((keyword) =>
      q.questionText.toLowerCase().includes(keyword)
    )
  );
  const nonDiagramQuestions = finalShuffled.filter(
    (q) =>
      !diagramKeywords.some((keyword) =>
        q.questionText.toLowerCase().includes(keyword)
      )
  );

  console.log(
    `Found ${diagramQuestions.length} diagram questions and ${nonDiagramQuestions.length} non-diagram questions`
  );

  const shuffledDiagramQuestions = shuffleArray(diagramQuestions);
  const shuffledNonDiagramQuestions = shuffleArray(nonDiagramQuestions);

  const maxDiagramQuestions = Math.floor(settings.numberOfQuestions * 0.2);
  const selectedDiagramQuestions = shuffledDiagramQuestions.slice(
    0,
    maxDiagramQuestions
  );
  const remainingSlots =
    settings.numberOfQuestions - selectedDiagramQuestions.length;
  const selectedNonDiagramQuestions = shuffledNonDiagramQuestions.slice(
    0,
    remainingSlots
  );

  const combinedQuestions = [
    ...selectedDiagramQuestions,
    ...selectedNonDiagramQuestions,
  ];
  const finalQuestions = shuffleArray(combinedQuestions).slice(
    0,
    settings.numberOfQuestions
  );

  console.log(
    `Selected ${finalQuestions.length} questions: ${selectedDiagramQuestions.length} diagram + ${selectedNonDiagramQuestions.length} non-diagram`
  );

  return finalQuestions.map((question, index) => {
    const quizQuestion: QuizQuestion = {
      question: {
        ...question,
        questionNumber: (index + 1).toString(),
      },
    };

    if (question.questionType === "MCQ") {
      const questionOptions = mcqOptions.filter(
        (option) => option.questionId === question.id
      );
      if (questionOptions.length > 0) {
        questionOptions.sort((a, b) =>
          a.optionLetter.localeCompare(b.optionLetter)
        );

        const hasCorrectAnswer = questionOptions.some(
          (opt) => opt.isCorrect === "1"
        );
        if (!hasCorrectAnswer) {
          const intelligentAnswer = intelligentMCQAnswer(
            question.questionText,
            questionOptions,
            settings.subject
          );
          const correctOption = questionOptions.find(
            (opt) => opt.optionLetter === intelligentAnswer
          );
          if (correctOption) {
            correctOption.isCorrect = "1";
          }
        }

        quizQuestion.options = questionOptions;
      }
    }

    let markSchemeEntry = markScheme.find(
      (ms) =>
        ms.questionId === question.id ||
        (ms.paperId === question.paperId &&
          ms.entryNumber === question.questionNumber)
    );

    if (markSchemeEntry) {
      quizQuestion.markScheme = markSchemeEntry;
    }

    const paper = papers.find((p) => p.id === question.paperId);
    if (paper) {
      quizQuestion.paper = paper;
    } else {
      quizQuestion.paper = {
        id: question.paperId,
        year: "2023",
        session: settings.subject,
        variant: "1",
        subject: settings.subject,
        paperType: question.questionType === "MCQ" ? "MCQ" : "Theory",
      };
    }

    return quizQuestion;
  });
}

export function extractKeywords(answerText: string): string[] {
  if (!answerText) return [];

  const keywords = answerText
    .toLowerCase()
    .split(/[,:;.\-\(\)\[\]\/\\]/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2)
    .filter(
      (term) =>
        ![
          "the",
          "and",
          "or",
          "but",
          "in",
          "on",
          "at",
          "to",
          "for",
          "of",
          "with",
          "by",
          "are",
          "is",
          "was",
          "were",
          "has",
          "have",
          "had",
        ].includes(term)
    )
    .map((term) => term.replace(/[^\w\s]/g, ""))
    .filter((term) => term.length > 0);

  return [...new Set(keywords)];
}

export function checkAnswer(
  userAnswer: string,
  question: QuizQuestion
): {
  isCorrect: boolean;
  marksAwarded: number;
  feedback: string;
  keywords?: string[];
} {
  if (!userAnswer || !userAnswer.trim()) {
    return {
      isCorrect: false,
      marksAwarded: 0,
      feedback: "No answer provided.",
    };
  }

  if (
    question.question.questionType === "MCQ" &&
    question.options &&
    question.options.length > 0
  ) {
    let correctOption = question.options.find((opt) => opt.isCorrect === "1");

    if (!correctOption) {
      const subject = question.paper?.subject || "Biology";
      const intelligentAnswer = intelligentMCQAnswer(
        question.question.questionText,
        question.options,
        subject
      );
      correctOption = question.options.find(
        (opt) => opt.optionLetter === intelligentAnswer
      );
      if (correctOption) {
        correctOption.isCorrect = "1";
      }
    }

    const selectedOption = question.options.find(
      (opt) => opt.optionLetter === userAnswer
    );
    const isCorrect = correctOption?.optionLetter === userAnswer;

    const selectedText = selectedOption?.optionText || "Selected option";
    const correctText =
      correctOption?.optionText || "Answer not available in database";
    const correctLetter = correctOption?.optionLetter || "Unknown";

    return {
      isCorrect,
      marksAwarded: isCorrect ? parseInt(question.question.marks || "1") : 0,
      feedback: isCorrect
        ? `Correct! ${selectedText}`
        : `Incorrect. The correct answer is ${correctLetter}: ${correctText}`,
    };
  } else {
    if (question.markScheme && question.markScheme.answerText) {
      const expectedAnswer = question.markScheme.answerText;
      const keywords = extractKeywords(expectedAnswer);
      const userAnswerLower = userAnswer.toLowerCase();

      const matchedKeywords = keywords.filter((keyword) =>
        userAnswerLower.includes(keyword.toLowerCase())
      );

      const matchPercentage =
        keywords.length > 0 ? matchedKeywords.length / keywords.length : 0;
      const maxMarks = parseInt(question.markScheme.marksAwarded) || 1;
      const marksAwarded = Math.round(matchPercentage * maxMarks);
      const isCorrect = marksAwarded > 0;

      return {
        isCorrect,
        marksAwarded,
        keywords: keywords,
        feedback: isCorrect
          ? `Good! You mentioned key terms: ${matchedKeywords.join(
              ", "
            )}. Expected answer: ${expectedAnswer}`
          : `You missed key terms. Expected answer: ${expectedAnswer}`,
      };
    }

    return {
      isCorrect: false,
      marksAwarded: 0,
      feedback: "No mark scheme available for this question.",
    };
  }
}
