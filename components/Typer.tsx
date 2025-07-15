// v0.0.01 salah

import { ReactTyped } from "react-typed";
import { AnimatedTestimonials } from "./ui/animated-testimonials";

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
    link: "/quizzer",
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
    <section id="typer">
      <div className="w-full py-20">
        <div className="text-4xl mx-auto font-medium text-neutral-600 text-center">
          <ReactTyped
            strings={[
              "Boost your IGCSE performance",
              "Ace your Alevels/AS",
              "Master subjects with expert help",
              "Join 1-on-1 FREE courses",
              "Join group FREE courses",
              "Join online studyhubs",
              "Compete with students worldwide",
              "Access top-quality resources",
              "Track progress effectively",
              "Enhance your study techniques",
              "Achieve top grades with our support",
              "Ask any question, in any subject, at anytime",
              "Get personalised learning plans & schedules",
              "Prepare with confidence and skill",
              "Excel in your exams with ease",
              "Join a community of successful students",
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
