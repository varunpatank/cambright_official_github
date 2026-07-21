export interface SocialLinks {
  instagram?: string;
  github?: string;
}

export interface User {
  name: string;
  role: string;
  bio: string;
  tags: string[];
  socialLinks: SocialLinks;
  avatar: string;
}

export const founders: User[] = [
  {
    name: "Varun Patankar",
    role: "Head of CamBright",
    bio: "Lifelong Football fan | Avid Badminton Coach & Player | App Development Enthusiast | Cambridge Glazer",
    tags: ["Co-Founder", "Head of CamBright"],
    socialLinks: {},
    avatar: "/varun.png",
  },
  {
    name: "Varram",
    role: "Head of Business",
    bio: "",
    tags: ["Co-Founder", "Business Strategist"],
    socialLinks: { github: "https://github.com/varram" },
    avatar: "/varram.png",
  },
  {
    name: "Salah",
    role: "Head of Tech",
    bio: "I'm an Arab Muslim developer with an interest in cardiology. I developed this website. 😁",
    tags: ["Co-Founder", "Head of Tech"],
    socialLinks: { github: "https://github.com", instagram: "https://www.instagram.com/sala7.dev" },
    avatar: "/salahx.png",
  },
  {
    name: "Ganna",
    role: "Recruiter & Designer",
    bio: "I craft visuals that define our brand and work to build a strong, united team that drives our success.",
    tags: ["Co-Founder", "Designer"],
    socialLinks: {},
    avatar: "/ellie.png",
  },
  {
    name: "Arunima",
    role: "Marketing",
    bio: "I love helping students reach their full potential! Outside of academia, I love animals and drawing!",
    tags: ["Co-Founder", "Marketing"],
    socialLinks: {},
    avatar: "/aru.webp",
  },
];

export const directors: User[] = [
  {
    name: "Vaishnav B",
    role: "Director of Technology",
    bio: "Leading CamBright's technical direction, product architecture, and platform execution.",
    tags: ["Director", "CTO"],
    socialLinks: {},
    avatar: "/user1.png",
  },
  {
    name: "Jonathan K",
    role: "Director of Courses",
    bio: "",
    tags: ["Director", "Courses Manager"],
    socialLinks: {},
    avatar: "/user1.png",
  },
];

export const board: User[] = [
  {
    name: "Vijay P.",
    role: "Video Editor",
    bio: "Avid chess player and video maker.",
    tags: ["Video Editor"],
    socialLinks: {},
    avatar: "/user1.png",
  },
  {
    name: "Daro",
    role: "Community Manager",
    bio: "I'm Daro, an aspiring medic with a passion for learning and teaching. My goal is to make students enjoy learning!",
    tags: ["Moderator", "Top Volunteer"],
    socialLinks: {},
    avatar: "/daru.png",
  },
];

export const staffMembers: User[] = [...founders, ...directors, ...board];

export const storyMilestones = [
  {
    title: "The Beginning",
    text: "CamBright started as a student-led effort to make high-quality IGCSE support accessible regardless of location, budget, or background.",
  },
  {
    title: "Building Momentum",
    text: "From a small volunteer circle, we expanded into a global learning community with revision notes, mock exams, and practical study tools.",
  },
  {
    title: "Mission-Driven Growth",
    text: "Every feature we ship is built around one promise: better outcomes for students through clarity, consistency, and free access.",
  },
  {
    title: "What Comes Next",
    text: "We are scaling CamBright Intelligence, deeper mock support, and smarter learning flows to help even more students hit top grades.",
  },
];