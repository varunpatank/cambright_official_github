// v.0.0.01 salah

"use client";
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
} from "react-icons/fc";
import { IoLanguageSharp, IoFastFood } from "react-icons/io5";
import { SiEnterprisedb } from "react-icons/si";
import { FaMosque, FaFishFins } from "react-icons/fa6";
import { IconType } from "react-icons/lib";
import { FaFlagUsa } from "react-icons/fa";
import SubjectItem from "./subject-item";

interface SubjectsProps {
  items: Subject[];
}
const iconMap: Record<Subject["name"], IconType> = {
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

const Subjects = ({ items }: SubjectsProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {items.map((item) => (
        <SubjectItem
          key={item.id}
          label={item.name}
          icon={iconMap[item.name]}
          value={item.id}
        />
      ))}{" "}
    </div>
  );
};

export default Subjects;
