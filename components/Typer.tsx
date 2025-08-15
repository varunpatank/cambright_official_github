// v0.0.01 salah

import { ReactTyped } from "react-typed";
import { AnimatedTestimonials } from "./ui/animated-testimonials";

const testimonials = [
  {
    quote: "Ready-made templates and custom Sprints with due dates to boost productivity",
    name: "Progress Tracker",
    designation: "Boost Productivity",
    src: "/progress.png",
    link: "/tracker/select-group",
  },
  {
    quote: "Online mock exams with timers and auto-marking to assess your level",
    name: "Mock Exam",
    designation: "Auto-Marking System",
    src: "/mcq-solver.png",
    link: "mcq-solver",
  },
  {
    quote: "Free online courses from verified tutors with notes and live sessions",
    name: "Free Courses",
    designation: "Expert Tutors",
    src: "/courses.png",
    link: "/search-courses",
  },
  {
    quote: "Comprehensive revision notes designed for maximum retention",
    name: "Study Notes",
    designation: "Syllabus-Specific",
    src: "/notes.png",
    link: "/search-notes",
  },
  {
    quote: "Latest past papers with model answers from expert solvers",
    name: "Past Papers",
    designation: "With Solutions",
    src: "/solved.png",
    link: "past-papers",
  },
  {
    quote: "1000+ customizable flashcards for all subjects and boards",
    name: "Flashcards",
    designation: "Study Smarter",
    src: "/flash.png",
    link: "/flashcards",
  }
];

const Typer = () => {
  return (
    <section id="typer">
      <div className="w-full py-20">
        <div className="text-4xl mx-auto font-medium text-neutral-600 text-center">
          <ReactTyped
            strings={[
              "Boost your IGCSE performance",
              "Ace your A-levels with confidence",
              "Master subjects with expert help",
              "Access top-quality resources",
              "Track progress effectively",
              "Achieve A* grades consistently",
              "Join a community of top students",
            ]}
            typeSpeed={50}
            backSpeed={60}
            backDelay={1000}
            startDelay={500}
            loop
            className="inline-block text-gradient text-white"
          />
          <br />
          with <span className="text-purple-gradient">CamBright.</span>
        </div>
      </div>
      <div className="mb-6">
        <AnimatedTestimonials testimonials={testimonials} />
      </div>
    </section>
  );
};

export default Typer;
