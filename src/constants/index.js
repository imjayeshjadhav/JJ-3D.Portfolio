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
  { name: "Capillary", link: "#capillary" },
  { name: "Work", link: "#work" },
  { name: "About", link: "#about" },
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
    { term: "Leading", detail: "AI and campus digitalization, MIT AOE" },
    { term: "Studying", detail: "B.Tech CSE, MIT Academy of Engineering" },
  ],
};

// Champagne ramp stops (graphite bronze → ivory), shared by the particle
// cloud and the pipeline diagrams.
const ramp = ["#3a3328", "#6b5536", "#8c6a3f", "#c9a96e", "#f4efe4"];

// Capillary internship, from the résumé. No internal data beyond it.
const capillary = {
  org: "Capillary Technologies",
  role: "Software Development Engineer Intern",
  period: "Sep 2026 – present",
  place: "Bangalore, onsite",
  project: "Client Health Monitor",
  lead: "One 0–10 health score for hundreds of enterprise clients, built from five systems that never used to talk to each other.",
  points: [
    "Combined New Relic, Jira, ServiceNow, Databricks and NPS data into a single 0–10 health score per client, with Python jobs loading into BigQuery and 11 Cloud Run jobs for SLA alerts.",
    "Added Claude-based issue triage and client summaries in production. The model returns structured JSON, and every flagged issue passes a 3-step validation whose rules were set by backtesting on past data, because a false alarm here is costly.",
    "Built “Ask CHM”, a chat interface for asking about client health in plain English, with multi-turn context and streamed responses.",
    "Tuned a nightly LLM job for recurring failures with dual-run comparisons, cutting flagged issues from 48 to 35.",
    "Access is secured with IAP roles; the codebase has 2,200+ automated tests and deploys through CI/CD.",
  ],
  metrics: [
    { value: "0–10", label: "health score for every enterprise client" },
    { value: "11", label: "Cloud Run jobs watching SLAs" },
    { value: "27%", label: "fewer flagged issues (48 → 35)" },
    { value: "2,200+", label: "automated tests, shipped through CI/CD" },
  ],
  stack: ["Claude", "Python", "BigQuery", "Databricks", "GCP Cloud Run", "IAP", "CI/CD"],
};

const projects = [
  {
    id: "university",
    name: "University Automation Platform",
    shortName: "University platform",
    award: "Smart India Hackathon 2025 — national winner, team lead",
    period: "Sep 2025 – present",
    summary:
      "A role-based platform that builds clash-free timetables for five degree programmes, and keeps growing into the university’s AI assistant.",
    problem:
      "Scheduling BSc, B.Ed, M.Ed, ITEP and FY programmes by hand means juggling faculty availability and rooms for every department, and redoing it whenever anything changes.",
    built: [
      "Led the team that built the web app (Next.js 15, React 18, Flask) on Google OR-Tools, generating clash-free timetables from faculty availability and rooms.",
      "A Gemini-powered coordinator-to-department workflow that gives each department 3 timetable options, with Excel and PDF export.",
      "A rescheduling recommender that ranks free rooms at a given time, to move a lecture, swap faculty or shift a whole class.",
      "Now: a RAG chatbot (embeddings + FAISS) that answers syllabus, exam and department questions from university documents, being tested on edge cases and cost.",
    ],
    result: "Manual scheduling work dropped by about 70%, and the platform won first place among 481 teams.",
    metric: { value: "70%", label: "less manual scheduling work" },
    pipeline: ["Faculty, rooms, courses", "OR-Tools solver", "3 options / dept", "Rescheduling", "RAG assistant"],
    stack: ["Next.js 15", "React 18", "Flask", "Google OR-Tools", "Gemini", "FAISS", "MongoDB"],
    image: "/images/projects/university.webp",
    imageAlt: "The University Automation Platform live site: an automated timetable scheduler with a sample weekly timetable marked 100% conflict free, 3 options.",
    live: "https://sih-2025.vercel.app",
    source: null,
  },
  {
    id: "campuscompass",
    name: "CampusCompass",
    award: "AI and campus digitalization, MIT AOE — technical lead",
    period: "2026",
    summary:
      "One connected platform for a whole college: automatic timetables, a walkable 3D campus, and the announcements, clubs and calendars that used to live in spreadsheets and group chats.",
    problem:
      "A college runs on ten disconnected tools. Timetables take days to build by hand, and new students can’t find their way around a large campus.",
    built: [
      "A timetable service in FastAPI on a CP-SAT solver (Google OR-Tools): upload one spreadsheet of faculty, subjects and rooms, get a full conflict-free weekly timetable by room, faculty or division.",
      "An explorable 3D campus in Three.js with search, walking navigation and pathfinding between buildings and rooms.",
      "Student, teacher and admin dashboards with announcements and polls, clubs, group chat, a faculty directory and a shared academic calendar.",
    ],
    result: "Timetables that took a person days now come back conflict-free in minutes.",
    metric: { value: "Minutes", label: "for a full weekly timetable, down from days" },
    pipeline: ["Excel upload", "CP-SAT solver", "Timetable API", "Dashboards", "3D campus"],
    stack: ["Next.js 16", "Three.js", "FastAPI", "Google OR-Tools", "MongoDB", "NextAuth", "Tailwind CSS"],
    image: null,
    live: null,
    source: null,
    privateNote: "Built for MIT AOE with a team of four; the code is private to the college.",
  },
  {
    id: "threatlens",
    name: "ThreatLens AI",
    period: "Feb – Apr 2026",
    summary:
      "A cybersecurity NLP framework that reads plain-English vulnerability descriptions and predicts their severity and CWE category.",
    problem:
      "Security teams triage thousands of CVEs by hand, and the free-text descriptions don’t map neatly onto severity or weakness type.",
    built: [
      "Trained and compared SecureBERT, BERT, CNN, LSTM and GRU on 126K+ NVD CVE records, with time-based splits to avoid data leakage, preprocessing in Pandas and NumPy, and Scikit-learn for evaluation.",
      "Moved to one shared multi-task model that predicts severity and CWE category from a single encoder.",
      "Served it with FastAPI (PyTorch, Hugging Face Transformers) behind a React frontend for CVE triage.",
    ],
    result: "About 8% higher F1 than separate per-task models.",
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
  { rank: "1st", of: "of 481 teams", title: "Smart India Hackathon 2025", note: "Team lead. India’s largest government hackathon." },
  { rank: "2nd", of: "worldwide", title: "NeoBIM Global Hackathon 2026", note: "Team lead. International construction-tech hackathon." },
  { rank: "64th", of: "of 18,500+ teams", title: "Tata Elxsi Teleport S3", note: "Round 2, top 0.35%." },
  {
    rank: String(leetcode.solved.all),
    of: "problems solved",
    title: "LeetCode",
    note: "Graphs, DP, trees and greedy. Plus a 2-star CodeChef rating from regular Starters contests.",
  },
];

const leadership = [
  {
    title: "Project Lead, AI and Campus Digitalization",
    org: "MIT Academy of Engineering, current",
    detail:
      "Leading a cross-team student group on the university’s wider suite: syllabus and calendar planners, a campus engagement platform and a 3D college model. I handle planning, task allocation and delivery.",
  },
  {
    title: "Class Representative",
    org: "B.Tech Computer Science and Engineering, current",
    detail: "The link between my class and the department, from timetables to exams.",
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
      "Building Client Health Monitor: one 0–10 health score for hundreds of enterprise clients, Claude-based issue triage with backtested validation, and the “Ask CHM” chat.",
    link: { href: "#capillary", label: "Read the Capillary case study" },
  },
  {
    org: "Kumar Infotech",
    role: "Website Developer Intern",
    period: "May – Aug 2025",
    place: "Mumbai, hybrid",
    monogram: "KI",
    detail: "Worked on customer-facing features in React.js, Next.js and Node.js, connected to REST APIs, in an agile team.",
  },
  {
    org: "MIT Academy of Engineering",
    role: "B.Tech, Computer Science and Engineering",
    period: "2023 – 2027",
    place: "Pune",
    logo: { src: "/images/experience/mitaoe.svg", alt: "MIT Academy of Engineering logo", wide: true },
    detail: "CGPA 7.86 / 10, latest SGPA 8.43. Project Lead for AI and campus digitalization, and Class Representative.",
  },
];

const skills = [
  {
    group: "LLMs, agents and retrieval",
    short: "LLMs and agents",
    items: ["Claude / Gemini / Groq APIs", "Prompt engineering", "Tool use and function calling", "Structured outputs", "LangChain", "LangGraph", "MCP", "RAG", "Embeddings and semantic search", "FAISS", "Streaming", "LLM evaluation"],
  },
  {
    group: "Backend, data and cloud",
    short: "Backend and cloud",
    items: ["Python", "FastAPI", "Flask", "Node.js / Express", "REST APIs", "SQL", "BigQuery", "Databricks", "MongoDB", "Docker", "GCP Cloud Run", "GitHub Actions", "Pytest", "Backtesting", "JWT / OAuth"],
  },
  {
    group: "Machine learning and NLP",
    short: "ML and NLP",
    items: ["PyTorch", "Hugging Face Transformers", "Scikit-learn", "TensorFlow", "CNN, RNN, Transformers", "Fine-tuning", "Model evaluation (F1, precision / recall)"],
  },
  {
    group: "Languages and frontend",
    short: "Languages and frontend",
    items: ["Python", "SQL", "JavaScript", "Java", "C++", "React.js", "Next.js", "React Native", "Tailwind CSS", "WebSockets"],
  },
  {
    group: "CS fundamentals",
    short: "Fundamentals",
    items: ["Data structures and algorithms", "OOP", "Operating systems", "Computer networks", "DBMS", "System design"],
  },
];

// Shown as 3D icons on the Stack ring (models live in src/scene/iconModels.js).
const stackIcons = [
  { id: "claude", label: "Claude", skill: "Claude / Gemini / Groq APIs" },
  { id: "langchain", label: "LangChain", skill: "LangChain" },
  { id: "pytorch", label: "PyTorch", skill: "PyTorch" },
  { id: "huggingface", label: "Hugging Face", skill: "Hugging Face Transformers" },
  { id: "python", label: "Python", skill: "Python" },
  { id: "fastapi", label: "FastAPI", skill: "FastAPI" },
  { id: "bigquery", label: "BigQuery", skill: "BigQuery" },
  { id: "databricks", label: "Databricks", skill: "Databricks" },
  { id: "googlecloud", label: "Google Cloud", skill: "GCP Cloud Run" },
  { id: "docker", label: "Docker", skill: "Docker" },
  { id: "pytest", label: "Pytest", skill: "Pytest" },
  { id: "react", label: "React", skill: "React.js" },
  { id: "nextjs", label: "Next.js", skill: "Next.js" },
  { id: "java", label: "Java", skill: "Java" },
  { id: "cpp", label: "C++", skill: "C++" },
  { id: "git", label: "Git", skill: "GitHub Actions" },
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

export { profile, navLinks, about, ramp, capillary, projects, wins, leadership, experience, skills, stackIcons, socials };
