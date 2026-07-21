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
    bio: "Overseeing CamBright's course catalog, curriculum quality, and content rollout.",
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

// The wider volunteer base — moderators, marketing, notes/paper transcription,
// data and tutoring volunteers. These mirror our Discord staff role roster
// (not just the tutor accounts pulled live from the database) so the Staff
// section reflects the full team, not only founders/directors/board.
export const volunteers: User[] = [
  { name: "Hidan", role: "Marketing Volunteer", bio: "", tags: ["Marketing Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Darkiyah", role: "Marketing Volunteer", bio: "", tags: ["Marketing Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "AFA", role: "Marketing Volunteer", bio: "", tags: ["Marketing Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Nacl Glazer", role: "Marketing Volunteer", bio: "", tags: ["Marketing Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "keo", role: "Marketing Volunteer", bio: "", tags: ["Marketing Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Keosha", role: "Marketing Volunteer", bio: "", tags: ["Marketing Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Shravni", role: "Marketing Volunteer", bio: "", tags: ["Marketing Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Amera", role: "Marketing Volunteer", bio: "", tags: ["Marketing Volunteer"], socialLinks: {}, avatar: "/user1.png" },

  { name: "giana", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "kmd", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "wahhh", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Siddharth", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Nour", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Arjun_Daway", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "kat", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "dunno9thing", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Josh", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "silentrebel", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "nithisunk", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "reignofnight", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "monerus.", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "gulab jamun", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Yassin", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Navin", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Elsa", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },

  { name: "itrolode", role: "Paper Volunteer", bio: "", tags: ["Paper Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "ana :]", role: "Paper Volunteer", bio: "", tags: ["Paper Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Jude", role: "Paper Volunteer", bio: "", tags: ["Paper Volunteer"], socialLinks: {}, avatar: "/user1.png" },

  { name: "devil's blink", role: "Notes Volunteer", bio: "", tags: ["Notes Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "blizzzzzzz", role: "Notes Volunteer", bio: "", tags: ["Notes Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "vash1004", role: "Notes Volunteer", bio: "", tags: ["Notes Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Helena", role: "Notes Volunteer", bio: "", tags: ["Notes Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Deeiz", role: "Notes Volunteer", bio: "", tags: ["Notes Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "Iamyourdad", role: "Notes Volunteer", bio: "", tags: ["Notes Volunteer"], socialLinks: {}, avatar: "/user1.png" },

  { name: "SmartyPants2519", role: "Data Volunteer", bio: "", tags: ["Data Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "chesskat", role: "Data Volunteer", bio: "", tags: ["Data Volunteer"], socialLinks: {}, avatar: "/user1.png" },

  { name: "Zzz", role: "Advisor", bio: "", tags: ["Advisor"], socialLinks: {}, avatar: "/user1.png" },

  { name: "Synchronic", role: "Tech Team", bio: "", tags: ["Tech Team"], socialLinks: {}, avatar: "/user1.png" },

  { name: "meow", role: "Discord Mod", bio: "", tags: ["Discord Mod"], socialLinks: {}, avatar: "/user1.png" },

  { name: "Chicken Nugget", role: "Marketing Volunteer", bio: "", tags: ["Marketing Volunteer"], socialLinks: {}, avatar: "/user1.png" },
  { name: "astrogod", role: "Tutor Volunteer", bio: "", tags: ["Tutor Volunteer"], socialLinks: {}, avatar: "/user1.png" },
];

export const staffMembers: User[] = [...founders, ...directors, ...board, ...volunteers];

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