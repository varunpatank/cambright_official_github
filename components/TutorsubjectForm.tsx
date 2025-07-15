const subjects: Option[] = [
  { label: "Biology", value: "Biology" },
  { label: "Chemistry", value: "Chemistry" },
  { label: "Physics", value: "Physics" },
  { label: "Mathematics", value: "Mathematics" },
  { label: "Business", value: "Business" },
  { label: "Accounting", value: "Accounting" },
  { label: "Agriculture", value: "Agriculture" },
  { label: "Art & Design", value: "Art & Design" },
  { label: "Computer Science", value: "Computer Science" },
  {
    label: "Co-ordinated Double Science",
    value: "Co-ordinated Double Science",
  },
  { label: "Combined Science", value: "Combined Science" },
  { label: "Design & Tech", value: "Design & Tech" },
  { label: "Drama", value: "Drama" },
  { label: "Economics", value: "Economics" },
  { label: "Enterprise", value: "Enterprise" },
  { label: "English - EFL", value: "English - EFL" },
  { label: "English Literature", value: "English Literature" },
  { label: "ESL", value: "ESL" },
  { label: "Environmental Management", value: "Environmental Management" },
  { label: "Food & Nutrition", value: "Food & Nutrition" },
  { label: "French - FFL", value: "French - FFL" },
  { label: "Geography", value: "Geography" },
  { label: "Islmaiyat", value: "Islmaiyat" },
  { label: "History", value: "History" },
  { label: "Music", value: "Music" },
  { label: "P.E", value: "P.E" },
  { label: "ICT", value: "ICT" },
  { label: "ASL", value: "ASL" },
  { label: "Arabic", value: "Arabic" },
  { label: "AFL", value: "AFL" },
  { label: "Bahasa", value: "Bahasa" },
  { label: "Chinese CSL", value: "Chinese CSL" },
  { label: "Chinese Mandarin", value: "Chinese Mandarin" },
  { label: "German - GFL", value: "German - GFL" },
  { label: "Global Perspectives", value: "Global Perspectives" },
  { label: "Hindi - HFL", value: "Hindi - HFL" },
  { label: "Hindi - HSL", value: "Hindi - HSL" },
  { label: "History - USA", value: "History - USA" },
  { label: "IsiZulu - ISL", value: "IsiZulu - ISL" },
  { label: "Italian - IFL", value: "Italian - IFL" },
  { label: "Latin", value: "Latin" },
  { label: "Malay", value: "Malay" },
  { label: "Marine Sciences", value: "Marine Sciences" },
  { label: "Add Maths", value: "Add Maths" },
  { label: "International Maths", value: "International Maths" },
  { label: "Travel & Tourism", value: "Travel & Tourism" },
  { label: "World Literature", value: "World Literature" },
  { label: "Pakistan studies", value: "Pakistan studies" },
  { label: "Portuguese - PFL", value: "Portuguese - PFL" },
  { label: "Religious Studies", value: "Religious Studies" },
  { label: "Sanskrit", value: "Sanskrit" },
  { label: "Setswana", value: "Setswana" },
  { label: "Sociology", value: "Sociology" },
  { label: "Spanish", value: "Spanish" },
  { label: "Spanish Literature", value: "Spanish Literature" },
  { label: "Swahili", value: "Swahili" },
  { label: "Thai", value: "Thai" },
  { label: "Turkish", value: "Turkish" },
  { label: "Urdu", value: "Urdu" },
  { label: "Vietnamese", value: "Vietnamese" },
];

const boards: Option[] = [
  { label: "IGCSE", value: "IGCSE" },
  { label: "GCSE (UK)", value: "GCSE (UK)" },
  // { label: "Edexcel", value: "Edexcel" },
  // { label: "A-Level", value: "A-Level" },
  // { label: "AS-Level", value: "AS-Level" },
  // { label: "O-Level", value: "O-Level" },
  // { label: "Other", value: "Other" },
];
import { Combobox } from "./ui/combobox";
import { Boardobox } from "./ui/boardobox";
import { Label } from "@/components/ui/customLabel";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface TutorsubjectFormProps {
  subject: string;
  board: string;
  onChange: (name: string, value: string) => void;
  onValid: (isValid: boolean) => void;
}

const TutorsubjectForm: React.FC<TutorsubjectFormProps> = ({
  subject,
  board,
  onChange,
  onValid,
}) => {
  const [errors, setErrors] = useState<{ subject?: string; board?: string }>(
    {}
  );

  // Validate fields whenever they change
  useEffect(() => {
    const validate = () => {
      const newErrors: { subject?: string; board?: string } = {};

      if (!subject) {
        newErrors.subject = "Please select a subject.";
      }

      if (!board) {
        newErrors.board = "Please select a board.";
      }

      setErrors(newErrors);
      onValid(Object.keys(newErrors).length === 0);
    };

    validate();
  }, [subject, board, onValid]);

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-100 text-center">
        What will you teach?{" "}
        <p className="text-muted-foreground text-sm text-center">
          You can change or add more later..
        </p>
      </h2>
      <div className="flex flex-col md:flex-row md:space-x-2 space-y-4 md:space-y-0 mr-2">
        <LabelInputContainer>
          <Label htmlFor="subject">Subject</Label>
          <Combobox
            options={subjects}
            value={subject}
            onChange={(value) => onChange("subject", value)}
          />
          {errors.subject && <p className="text-red-600">{errors.subject}</p>}
        </LabelInputContainer>
        <LabelInputContainer>
          <Label htmlFor="board">Board</Label>
          <Boardobox
            options={boards}
            value={board}
            onChange={(value) => onChange("board", value)}
          />
          {errors.board && <p className="text-red-600">{errors.board}</p>}
        </LabelInputContainer>
      </div>
    </>
  );
};

const LabelInputContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default TutorsubjectForm;
