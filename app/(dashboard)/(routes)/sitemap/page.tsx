// v0.0.01 salah
"use client";
import { ReactTyped } from "react-typed";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { BackgroundLines } from "@/components/ui/background-lines";
const testimonials = [
  {
    quote:
      "Use & edit ready-made templates or create custom Sprints to boost your progress by setting due dates for tasks",
    name: "Progress Tracker",
    designation: "Boost Productivity",
    src: "/progress.png",
    link: "/tracker/select-group",
  },
  {
    quote:
      "Sit online mock-exams at anytime just like real life, with timers, and auto-marking. It will tell you your level in each paper!",
    name: "Mock Exam",
    designation: "With Auto-Marking",
    src: "/mcq-solver.png",
    link: "mcq-solver",
  },
  {
    quote:
      "Enroll for Free Online Courses, 1-on-1 & group courses from expert verified tutors, with notes, recorded lessons, meetings, and Q&A sessions.",
    name: "Free Courses",
    designation: "Free Courses, Expert Tutors",
    src: "/courses.png",
    link: "/search-courses",
  },

  {
    quote:
      "Get free, comprehensive revision notes, designed to get the most information stuck in your head in the shortest time possible & written specific to the syllabus!",
    name: "Notes",
    designation: "Comprehensive Notes",
    src: "/notes.png",
    link: "/search-notes",
  },
  {
    quote:
      "Join our team, become a tutor? write notes? or make flashcards? help with marketing? anyways, you will get credit hours for everything and raise your GPA!",
    name: "Join Us",
    designation: "Have Your Contribution",
    src: "/salah.png",
    link: "/tutor-apply",
  },
  {
    quote:
      "Some amazing pages & tools are still under development, coming soon, but you can check them here!",
    name: "Coming Soon",
    designation: "Amazing Tools on their Way",
    src: "/quizzer.png",
    link: "/soon",
  },
  {
    quote:
      "Get free latest Past Papers, you can decide to have them blank and fresh or with model answers from expert solvers!",
    name: "Past Papers",
    designation: "With Model Answers",
    src: "/solved.png",
    link: "past-papers",
  },
  {
    quote:
      "1000+ Fully customizable Quick Flashcards to test your knowledge or add to it, for all subjects and all boards!",
    name: "Flashcards",
    designation: "Study Smarter",
    src: "/flash.png",
    link: "/flashcards",
  },
  {
    quote:
      "We believe that everyone has the right to learn, children in Gaza & Sudan have equal rights to everyone else on Earth to get high quality education, and of course lives come before education!",
    name: "Donate",
    designation: "Free Palestine & Sudan ♥️",
    src: "/gaza.png",
    link: "/donate",
  },
];

const Typer = () => {
  return (
    <div className="bg-gradient-to-br from-n-8 to-n-7 text-white min-h-screen flex flex-col">
      <BackgroundLines>
        <div className="relative z-20 px-6 py-10 md:px-12 md:py-20 lg:px-16 lg:py-32 lg:pt-20 md:pt-12 pt-8 flex-grow">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wide leading-tight mb-5">
              Sitemap
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-light mb-12 opacity-90">
              You can search for the page you want here :D{" "}
            </p>
          </div>
          <section id="typer">
            <div className="mb-6">
              <AnimatedTestimonials testimonials={testimonials} />
            </div>
          </section>
        </div>
      </BackgroundLines>
    </div>
  );
};

export default Typer;
