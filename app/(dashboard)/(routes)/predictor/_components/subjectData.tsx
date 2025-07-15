// subjectData.tsx

import { IoLanguageSharp, IoFastFood } from "react-icons/io5";
import { SiEnterprisedb } from "react-icons/si";
import { FaMosque, FaFishFins, FaFlagUsa } from "react-icons/fa6";
import { Subject } from "@prisma/client";
import {
  FcCalculator,
  FcCurrencyExchange,
  FcLandscape,
  FcCommandLine,
  FcPanorama,
  FcCollaboration,
  FcGlobe,
  FcBiotech,
  FcBiomass,
  FcBusiness,
  FcBiohazard, 
  FcFilmReel,
  FcSimCard,
  FcBarChart,
  FcConferenceCall,
  FcFilm,
  FcMusic,
  FcSportsMode,
  FcReading,
  FcClapperboard,
  FcElectricalSensor,
  FcGraduationCap,
  FcMultipleSmartphones,
  FcCalendar,
} from "react-icons/fc";

// Paper inputs interface and data structure
interface PaperInfo {
  default: number;
  code: string;
  papers: string[];
}

interface PaperInputs {
  [key: string]: {
    Core: PaperInfo;
    Extended: PaperInfo;
  };
}

export const paperInputs: PaperInputs = {
  mathematics: {
    Core: {
      default: 60,
      code: "0980",
      papers: ["Paper 1", "Paper 3"],
    },
    Extended: {
      default: 60,
      code: "0980",
      papers: ["Paper 2", "Paper 4"],
    },
  },
  chemistry: {
    Core: {
      default: 60,
      code: "0971",
      papers: ["Paper 1", "Paper 3", "Paper 5"],
    },
    Extended: {
      default: 60,
      code: "0971",
      papers: ["Paper 2", "Paper 4", "Paper 6"],
    },
  },
  physics: {
    Core: {
      default: 60,
      code: "0975",
      papers: ["Paper 1", "Paper 3", "Paper 5"],
    },
    Extended: {
      default: 60,
      code: "0975",
      papers: ["Paper 2", "Paper 4", "Paper 6"],
    },
  },
  biology: {
    Core: {
      default: 60,
      code: "0970",
      papers: ["Paper 1", "Paper 3", "Paper 5"],
    },
    Extended: {
      default: 60,
      code: "0970",
      papers: ["Paper 2", "Paper 4", "Paper 6"],
    },
  },
};

// Icon mappings
import { IconType } from "react-icons/lib";

export const iconMap: Record<Subject["name"], IconType> = {
  "Accounting": FcCurrencyExchange,
  "Agriculture": FcLandscape,
  "ASL": IoLanguageSharp,
  "Arabic": FcCollaboration,
  "AFL": IoLanguageSharp,
  "Art & Design": FcPanorama,
  "Bahasa": IoLanguageSharp,
  "Biology": FcBiotech,
  "Business": FcBusiness,
  "Chemistry": FcBiomass,
  "Chinese CSL": IoLanguageSharp,
  "Chinese Mandarin": FcCollaboration,
  "Computer Science": FcCommandLine,
  "Co-ordinated Double Science": FcBiomass,
  "Combined Science": FcBiohazard,
  "Design & Tech": FcMultipleSmartphones,
  "Drama": FcFilmReel,
  "Economics": FcBarChart,
  "Enterprise": SiEnterprisedb,
  "English - EFL": IoLanguageSharp,
  "English Literature": FcReading,
  "ESL": FcCollaboration,
  "Environmental Management": FcLandscape,
  "Food & Nutrition": IoFastFood,
  "French - FFL": FcCollaboration,
  "Geography": FcGlobe,
  "German - GFL": IoLanguageSharp,
  "Global Perspectives": FcCollaboration,
  "Hindi - HFL": IoLanguageSharp,
  "Hindi - HSL": IoLanguageSharp,
  "History": FcFilm,
  "History - USA": FaFlagUsa,
  "IsiZulu - ISL": IoLanguageSharp,
  "Islmaiyat": FaMosque,
  "Italian - IFL": IoLanguageSharp,
  "Latin": IoLanguageSharp,
  "Malay": IoLanguageSharp,
  "Marine Sciences": FaFishFins,
  "Mathematics": FcCalculator,
  "Add Maths": FcCalculator,
  "International Maths": FcCalculator,
  "Music": FcMusic,
  "P.E": FcSportsMode,
  "Pakistan studies": FcReading,
  "Portuguese - PFL": IoLanguageSharp,
  "Religious Studies": FaMosque,
  "Sanskrit": IoLanguageSharp,
  "Setswana": IoLanguageSharp,
  "Sociology": FcConferenceCall,
  "Spanish": IoLanguageSharp,
  "Spanish Literature": FcReading,
  "Swahili": IoLanguageSharp,
  "Thai": IoLanguageSharp,
  "Turkish": IoLanguageSharp,
  "Urdu": IoLanguageSharp,
  "Vietnamese": IoLanguageSharp,
  "Travel & Tourism": FcGlobe,
  "World Literature": FcReading,
  "Physics": FcElectricalSensor,
  "ICT": FcSimCard,
};

// Other constants for subjects, sessions, years, and variants
export const subjectsList = [
  { id: 1, name: "Mathematics" },
  { id: 2, name: "Biology" },
  { id: 3, name: "Chemistry" },
  { id: 4, name: "Physics" },
];

export const sessionOptions = [
  { id: 1, name: "Feb/March" },
  { id: 2, name: "May/June" },
  { id: 3, name: "Oct/Nov" },
];

export const extendedCoreOptions = [
  { id: "Core", name: "Core" },
  { id: "Extended", name: "Extended" },
];

export const yearOptions = Array.from({ length: 9 }, (_, i) => 2016 + i).map(
  (year) => ({
    id: year,
    name: year.toString(),
  })
);

export const variantsOptions = [
  { id: "v1", name: "V1" },
  { id: "v2", name: "V2" },
  { id: "v3", name: "V3" },
];

export const gradingOptions = [
  { id: "9-1", name: "9-1" },
  { id: "A*-G", name: "A*-G" },
];
