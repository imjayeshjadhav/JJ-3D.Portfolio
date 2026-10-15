// All copy here is sourced from the résumé and the GitHub profile.
import leetcode from "../data/leetcode.json";

const profile = {
  name: "Jayesh Jadhav",
  email: "14jayeshjadhav@gmail.com",
  location: "Bengaluru, Karnataka, India",
  github: "https://github.com/imjayeshjadhav",
  linkedin: "https://www.linkedin.com/in/jayesh-jadhav-813b36291/",
  leetcode: "https://leetcode.com/u/14jayeshjadhav/",
  codechef: "https://www.codechef.com/users/jjayeshhz",
  resume: "/Jayesh_Jadhav_Resume.pdf",
};

const navLinks = [
  { name: "About", link: "#about" },
  { name: "Work", link: "#work" },
  { name: "Wins", link: "#wins" },
  { name: "Experience", link: "#experience" },
  { name: "Stack", link: "#stack" },
  { name: "Contact", link: "#contact" },
];

// The user's own words; keep verbatim.
const about = {
  paragraphs: [
    "I'm a curious mind with a passion for technology, problem-solving, and understanding how things work beneath the surface. My interests span Artificial Intelligence, Computer Fundamentals, and System Design, where I enjoy exploring not just how things work, but why they're built the way they are. I love connecting the dots between ideas, breaking down complex concepts, and turning curiosity into practical knowledge.",
    "For me, technology is more than just writing code—it's about understanding systems, thinking critically, and building solutions that make a difference. I'm constantly exploring new concepts, challenging my own understanding, and learning to see problems from different perspectives.",
    "I'm still evolving as a developer and as a person, but I believe in staying curious, thinking beyond the obvious, and growing a little every day. I don't aim to know everything; I aim to understand things deeply, build meaningful things, and become someone who can turn ideas into impact.",
  ],
  facts: [
    { term: "Based in", detail: "Bengaluru, Karnataka, India" },
    { term: "Now", detail: "SDE intern, Capillary Technologies" },
    { term: "Studying", detail: "B.Tech CSE, MIT Academy of Engineering" },
  ],
};

// Magma ramp stops, shared by the hero cloud and the pipeline diagrams.
const ramp = ["#3a2257", "#721f81", "#b5367a", "#f7845b", "#fcf3b0"];

const projects = [
  {
    id: "underwriteai",
    name: "UnderwriteAI",
    period: "Apr – Jul 2026",
    summary:
      "A risk assessment platform that scores insurance applicants with a stacked ML ensemble and explains every decision in plain language.",
    problem:
      "Manual underwriting takes weeks, and the reasoning behind a decision is hard for anyone to audit later.",
    built: [
      "A stacked ensemble — Random Forest and Gradient Boosting, with a Ridge meta-model trained via 5-fold CV — over 15+ engineered features from 6 data sources.",
      "An OCR pipeline that extracts applicant data from 8 document types.",
      "A RAG explanation layer (Llama 3.3 70B on Groq, LangChain + LangGraph) with fairness checks across gender and income groups.",
    ],
    result: "Risk scores in seconds, each one shipped with an explanation an auditor can read.",
    metric: { value: "15+", label: "engineered features from 6 data sources" },
    pipeline: ["Applicant data + OCR", "15+ features", "RF + GB", "Ridge meta-model", "RAG explainer"],
    stack: ["Next.js", "NextAuth", "MongoDB", "PyTorch", "XGBoost", "LangChain", "LangGraph", "Groq"],
    image: "/images/projects/underwriteai.webp",
    imageAlt: "UnderwriteAI landing page showing its five-stage system architecture: ingestion, feature engineering, stacked ensemble, explanation and output.",
    live: "https://the-debuggers-theta.vercel.app",
    source: "https://github.com/imjayeshjadhav/the-debuggers",
  },
  {
    id: "timetable",
    name: "Automated University Timetable Scheduler",
    shortName: "Timetable",
    award: "Smart India Hackathon 2025 — national winner",
    period: "Sep – Dec 2025",
    summary:
      "Generates clash-free timetables for five degree programmes, so coordinators review options instead of building schedules by hand.",
    problem:
      "Scheduling BSc, B.Ed, M.Ed, ITEP and FY programmes by hand means juggling faculty availability and rooms across every department.",
    built: [
      "A constraint-satisfaction engine on Google OR-Tools that handles faculty availability, room allocation and clash-free slots at institute scale.",
      "A role-based workflow from Institute Coordinator to Department Coordinator, built with Next.js 15 and Flask.",
      "Gemini-assisted generation of 3 timetable options per department, with Excel and PDF export.",
    ],
    result: "Cut manual scheduling effort by nearly 70%, and won first place among 481 teams.",
    metric: { value: "70%", label: "less manual scheduling effort" },
    pipeline: ["Faculty, rooms, courses", "Constraints", "OR-Tools solver", "3 options / dept", "Excel + PDF"],
    stack: ["Next.js 15", "React 18", "Tailwind v4", "Flask", "Google OR-Tools", "Gemini", "MongoDB", "NextAuth"],
    image: null,
    live: "https://sih-2025.vercel.app",
    source: null,
  },
  {
    id: "threatlens",
    name: "ThreatLens AI",
    period: "Feb – Apr 2026",
    summary:
      "Reads plain-English vulnerability descriptions and predicts their severity and CWE category.",
    problem:
      "Security teams triage thousands of CVEs by hand, and the free-text descriptions don't map neatly onto severity or weakness type.",
    built: [
      "Trained and benchmarked SecureBERT, BERT, CNN, LSTM and GRU on 126K+ NVD CVE records, using time-based splits so evaluation reflects future CVEs.",
      "A shared-model architecture that predicts severity and CWE category from one encoder.",
      "A FastAPI inference service behind a React frontend.",
    ],
    result: "About 8% higher F1 than training a separate model for each task.",
    metric: { value: "+8%", label: "F1 over separate models, on 126K+ CVEs" },
    pipeline: ["CVE description", "Tokenizer", "Shared encoder", "Severity + CWE heads", "FastAPI"],
    stack: ["PyTorch", "Hugging Face", "SecureBERT", "FastAPI", "React", "Scikit-learn", "Pandas"],
    image: "/images/projects/threatlens.webp",
    imageAlt: "ThreatLens landing page with the headline “Automating CVE triage with deep learning”.",
    live: "https://threat-lens-ai-iota.vercel.app",
    source: "https://github.com/imjayeshjadhav/ThreatLens-AI",
  },
];

const wins = [
  {
    rank: "1st",
    of: "of 481 teams",
    title: "Smart India Hackathon 2025",
    note: "Team lead. India’s largest government hackathon.",
  },
  {
    rank: "2nd",
    of: "worldwide",
    title: "NeoBIM Global Hackathon 2026",
    note: "Team lead. International construction-tech hackathon.",
  },
  {
    rank: "64th",
    of: "of 18,500+ teams",
    title: "Tata Elxsi Teleport S3",
    note: "Round 2, top 0.35%.",
  },
  {
    rank: String(leetcode.solved.all),
    of: "problems solved",
    title: "LeetCode",
    note: "Plus a 2-star CodeChef rating from regular Starters contests.",
  },
];

const experience = [
  {
    org: "Capillary Technologies",
    role: "Software Development Engineer Intern",
    period: "Sep 2026 – present",
    place: "Bangalore, onsite",
    logo: { src: "/images/experience/capillary.png", alt: "Capillary Technologies logo" },
    detail:
      "Building client-specific web and application features on top of Capillary’s products — custom AI workflows, API integrations and automation — with engineering and Professional Services teams.",
  },
  {
    org: "Kumar Infotech",
    role: "Website Developer Intern",
    period: "May – Aug 2025",
    place: "Mumbai, hybrid",
    monogram: "KI",
    detail:
      "Built features in React, Next.js and Node.js, integrated REST APIs and reusable components, and shipped customer-facing updates in an agile team.",
  },
  {
    org: "MIT Academy of Engineering",
    role: "B.Tech, Computer Science and Engineering",
    period: "2023 – 2027",
    place: "Pune",
    logo: { src: "/images/experience/mitaoe.svg", alt: "MIT Academy of Engineering logo", wide: true },
    detail: "CGPA 7.86 / 10, latest SGPA 8.43.",
  },
];

const skills = [
  {
    group: "AI and machine learning",
    short: "AI and ML",
    items: ["PyTorch", "TensorFlow", "Scikit-learn", "Hugging Face Transformers", "LangChain", "LangGraph", "RAG", "Vector databases", "MCP", "NLP and embeddings", "Fine-tuning", "Google OR-Tools"],
  },
  {
    group: "Web and app",
    short: "Web",
    items: ["React", "Next.js", "React Native", "Node.js", "Express", "FastAPI", "Flask", "GraphQL", "Tailwind CSS", "Redux / Zustand", "WebSockets", "SSR"],
  },
  {
    group: "Languages",
    short: "Languages",
    items: ["Java", "C++", "Python", "JavaScript", "SQL"],
  },
  {
    group: "Data, cloud and tools",
    short: "Tools",
    items: ["MongoDB", "Docker", "GitHub Actions", "JWT / OAuth", "REST APIs", "Postman", "Vercel", "Git"],
  },
  {
    group: "Foundations",
    short: "Foundations",
    items: ["Data structures and algorithms", "OOP", "DBMS", "Operating systems", "Computer networks"],
  },
];

// Shown as floating 3D icons in the Stack section (models live in src/scene/iconModels.js).
const stackIcons = [
  { id: "pytorch", label: "PyTorch", skill: "PyTorch" },
  { id: "tensorflow", label: "TensorFlow", skill: "TensorFlow" },
  { id: "huggingface", label: "Hugging Face", skill: "Hugging Face Transformers" },
  { id: "langchain", label: "LangChain", skill: "LangChain" },
  { id: "python", label: "Python", skill: "Python" },
  { id: "fastapi", label: "FastAPI", skill: "FastAPI" },
  { id: "react", label: "React", skill: "React" },
  { id: "nextjs", label: "Next.js", skill: "Next.js" },
  { id: "node", label: "Node.js", skill: "Node.js" },
  { id: "java", label: "Java", skill: "Java" },
  { id: "cpp", label: "C++", skill: "C++" },
  { id: "mongodb", label: "MongoDB", skill: "MongoDB" },
  { id: "docker", label: "Docker", skill: "Docker" },
  { id: "git", label: "Git", skill: "Git" },
];

const socials = [
  { name: "GitHub", url: "https://github.com/imjayeshjadhav" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/jayesh-jadhav-813b36291/" },
  { name: "LeetCode", url: "https://leetcode.com/u/14jayeshjadhav/" },
  { name: "CodeChef", url: "https://www.codechef.com/users/jjayeshhz" },
  { name: "Email", url: `mailto:${profile.email}` },
  { name: "Instagram", url: "https://www.instagram.com/jjayeshhz/" },
  { name: "X", url: "https://x.com/jjayeshhz" },
];

export { profile, navLinks, about, ramp, projects, wins, experience, skills, stackIcons, socials };
