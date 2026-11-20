import { projects } from "./index";

// The crew that builds the landing page on load. Each cursor is one
// of the tools from the résumé; each step targets a [data-build] element.
//
//   drag:  press at the top-left corner and drag a selection box open
//   type:  sweep an I-beam across a line of text
//   click: press once and the element grows out from that point
//   stage: drag open the 3D frame, then hold it until the room has loaded
//
// `at` is when the step starts, in seconds from the start of the build.
// Cursors glide in from `from` and leave by the nearest edge when done.

const GOLD = "#c9a96e";
const SOFT = "#e6d3a8";
const IVORY = "#f4efe4";
const STEEL = "#9aa3ad";

export const CREW = [
  { tool: "React", tone: IVORY, from: "top", steps: [{ do: "drag", target: "nav", at: 0.8 }] },
  { tool: "Git", tone: STEEL, from: "right", steps: [{ do: "click", target: "links", at: 1.5 }] },
  {
    tool: "Python",
    tone: SOFT,
    from: "left",
    steps: [
      { do: "type", target: "intro", at: 0.95 },
      { do: "type", target: "sub", at: 2.55 },
    ],
  },
  { tool: "Claude", tone: GOLD, from: "left", steps: [{ do: "type", target: "line-0", at: 1.35 }] },
  { tool: "LangChain", tone: STEEL, from: "bottom", steps: [{ do: "type", target: "line-1", at: 1.65 }] },
  { tool: "PyTorch", tone: IVORY, from: "left", steps: [{ do: "type", target: "line-2", at: 1.95 }] },
  { tool: "Three.js", tone: GOLD, from: "right", steps: [{ do: "stage", target: "stage", at: 1.05 }] },
  { tool: "Next.js", tone: IVORY, from: "bottom", steps: [{ do: "click", target: "cta-0", at: 2.85 }] },
  { tool: "FastAPI", tone: SOFT, from: "bottom", steps: [{ do: "click", target: "cta-1", at: 3.05 }] },
  { tool: "BigQuery", tone: STEEL, from: "bottom", steps: [{ do: "drag", target: "proof", at: 2.2 }] },
  {
    tool: "Docker",
    tone: SOFT,
    from: "bottom",
    steps: [
      { do: "click", target: "fig-0", at: 2.95 },
      { do: "click", target: "fig-1", at: 3.25 },
    ],
  },
  {
    tool: "Pytest",
    tone: GOLD,
    from: "right",
    steps: [
      { do: "click", target: "fig-2", at: 3.1 },
      { do: "click", target: "fig-3", at: 3.4 },
    ],
  },
];

// Phones: six cursors, each doing a little more.
export const CREW_MOBILE = [
  { tool: "React", tone: IVORY, from: "top", steps: [{ do: "drag", target: "nav", at: 0.7 }] },
  {
    tool: "Python",
    tone: SOFT,
    from: "left",
    steps: [
      { do: "type", target: "intro", at: 0.85 },
      { do: "type", target: "sub", at: 2.25 },
    ],
  },
  {
    tool: "Claude",
    tone: GOLD,
    from: "right",
    steps: [
      { do: "type", target: "line-0", at: 1.1 },
      { do: "type", target: "line-1", at: 1.5 },
      { do: "type", target: "line-2", at: 1.9 },
    ],
  },
  {
    tool: "Next.js",
    tone: IVORY,
    from: "bottom",
    steps: [
      { do: "click", target: "cta-0", at: 2.55 },
      { do: "click", target: "cta-1", at: 2.8 },
    ],
  },
  { tool: "Pytest", tone: STEEL, from: "bottom", steps: [{ do: "drag", target: "proof", at: 2.6 }] },
  { tool: "Three.js", tone: GOLD, from: "right", steps: [{ do: "stage", target: "stage", at: 1.3 }] },
];

// Every section further down gets its own small crew, named for the tools
// behind that part of the work, which builds it once as it scrolls in. Each
// section leans on a different move (see utils/buildEngine.js), so the page
// never builds the same way twice in a row.
// `zone` is the element whose arrival starts the build; targets are CSS
// selectors inside it (":zone" is the zone itself). Times are from the start.
const step = (d, target, at, extra) => ({ do: d, target, at, ...extra });
const all = { all: true };
const member = (tool, tone, from, ...steps) => ({ tool, tone, from, steps });
const tool = (stack, i) => stack[i % stack.length].replace(/ \d+$/, "");
const [uni, campus, threat] = ["university", "campuscompass", "threatlens"].map((id) =>
  projects.find((p) => p.id === id)
);

export const SECTION_ZONES = [
  // Capillary: title typed, lead highlighted, figures carried into place.
  {
    zone: "#capillary .cap-head",
    crew: [
      member("Claude", GOLD, "right", step("type", "h2", 0.45)),
      member("BigQuery", STEEL, "left", step("select", ":scope > p", 0.95)),
    ],
  },
  {
    zone: "#capillary dl",
    start: "top 78%",
    crew: [member("Databricks", SOFT, "bottom", step("place", ":scope > div", 0.5, all))],
  },
  // The architecture panel is pulled out to full width.
  { zone: "#capillary .cap-panel", crew: [member("Cloud Run", GOLD, "right", step("resize", ":zone", 0.6))] },
  // The chat panel is drawn with the pen; the stack chips are shift-selected.
  {
    zone: "#capillary .cap-built",
    crew: [
      member("Claude", GOLD, "right", step("pen", ":scope > :last-child", 0.5)),
      member("Pytest", STEEL, "left", step("multi", "ul[aria-label] li", 0.7, all)),
    ],
  },

  { zone: "#work .work-head", crew: [member("Git", STEEL, "left", step("type", "h2", 0.4))] },
  // Three case studies, three different builds, each by its own stack.
  {
    zone: "#work-university",
    start: "top 62%",
    crew: [
      member(tool(uni.stack, 0), IVORY, "left", step("type", "h3", 0.45)),
      member(tool(uni.stack, 2), GOLD, "bottom", step("place", ".case-frame", 0.6, all)),
      member(tool(uni.stack, 3), SOFT, "right", step("click", ".case-metric", 1.2)),
    ],
  },
  {
    zone: "#work-campuscompass",
    start: "top 62%",
    crew: [
      member(tool(campus.stack, 1), GOLD, "right", step("pen", ".case-frame", 0.45)),
      member(tool(campus.stack, 0), IVORY, "left", step("select", "h3", 0.6)),
      member(tool(campus.stack, 2), STEEL, "bottom", step("multi", "figcaption ul li", 1.4, all)),
    ],
  },
  {
    zone: "#work-threatlens",
    start: "top 62%",
    crew: [
      member(tool(threat.stack, 0), SOFT, "right", step("type", "h3", 0.45)),
      member(tool(threat.stack, 1), GOLD, "left", step("resize", ".case-frame", 0.7)),
      member(tool(threat.stack, 4), STEEL, "bottom", step("comment", ".case-metric", 1.5, { text: "Validated on time-based splits" })),
    ],
  },

  // About: the facts arrive scattered and get aligned.
  { zone: "#about .section-title", crew: [member("React", IVORY, "left", step("select", ":zone", 0.4))] },
  { zone: "#about .about-facts", crew: [member("Java", SOFT, "right", step("align", ":scope > div", 0.6, all))] },
  {
    zone: "#about .about-activity",
    crew: [
      member("C++", GOLD, "left", step("type", "h3", 0.4)),
      member("Python", SOFT, "right", step("pen", "#activity-stage", 0.6)),
    ],
  },

  // Wins: two cursors take turns lifting the ranks into the grid.
  {
    zone: "#wins",
    start: "top 70%",
    crew: [
      member("PyTorch", IVORY, "left", step("type", "h2", 0.4)),
      member("Hugging Face", GOLD, "bottom", step("place", "ol > li:nth-child(odd)", 0.8, all)),
      member("LangChain", STEEL, "bottom", step("place", "ol > li:nth-child(even)", 1.05, all)),
    ],
  },
  { zone: "#wins .wins-lead", crew: [member("Git", STEEL, "left", step("select", "h3", 0.45), step("select", "li + li h3", 1.2))] },

  // Experience: a comment pinned to the role that is happening now.
  {
    zone: "#experience",
    start: "top 70%",
    crew: [
      member("Java", SOFT, "left", step("type", "h2", 0.4)),
      member("C++", GOLD, "right", step("comment", ".exp-item h3", 1.0, { text: "Current role" })),
    ],
  },

  // Stack: the ring's frame is dragged out, the groups shift-selected.
  {
    zone: "#stack .shell",
    crew: [
      member("React", IVORY, "left", step("type", "h2", 0.4)),
      member("Three.js", GOLD, "right", step("drag", "#stack-stage", 0.65)),
      member("Git", STEEL, "bottom", step("click", "#stack-stage + div", 1.45)),
    ],
  },
  { zone: "#stack dl", crew: [member("Pytest", SOFT, "left", step("multi", "dt", 0.4, all))] },

  // Contact, the finale: the crew gathers on the button that matters.
  {
    zone: "#contact",
    start: "top 65%",
    crew: [
      member("FastAPI", SOFT, "left", step("type", "h2", 0.4)),
      member("Next.js", IVORY, "bottom", step("select", ".section-lede", 0.85)),
      member("Docker", STEEL, "right", step("pen", "#contact-stage", 0.6)),
      member("Python", SOFT, "bottom", step("hover", ".btn-solid", 1.5)),
      member("React", IVORY, "bottom", step("hover", ".btn-solid", 1.6)),
      member("Three.js", GOLD, "left", step("hover", ".btn-solid", 1.7)),
      member("Claude", GOLD, "bottom", step("click", ".btn-solid", 1.85), step("click", ".btn-quiet", 2.15)),
    ],
  },

  // Footer: signed off.
  { zone: "footer", start: "top 92%", crew: [member("Git", STEEL, "left", step("type", "p", 0.3))] },
];

// Tools that build the rest of each section's text, in rotation.
export const TONES = [GOLD, SOFT, IVORY, STEEL];
export const SECTION_TOOLS = {
  capillary: ["Python", "Claude", "BigQuery", "Databricks", "Cloud Run", "Pytest"],
  work: ["Git", "React", "Python"],
  ...Object.fromEntries(projects.map(({ id, stack }) => [`work-${id}`, stack.map((s, i) => tool(stack, i))])),
  about: ["React", "Java", "C++", "Python", "Git"],
  wins: ["PyTorch", "Hugging Face", "LangChain", "Git"],
  experience: ["Java", "C++", "Python", "Git"],
  stack: ["React", "Three.js", "Python", "Pytest", "Docker"],
  contact: ["FastAPI", "Next.js", "Claude"],
  footer: ["Git", "React"],
};
