import { projects } from "../constants";

// "Next.js 15", "Tailwind v4" and "Hugging Face Transformers" should all
// match their plain skill names.
const normalize = (name) =>
  name
    .toLowerCase()
    .replace(/\s+v?\d[\w.]*$/, "")
    .replace(/ (css|transformers)$/, "")
    .trim();

// Featured projects whose stack includes this skill.
const projectsUsing = (skill) => {
  const key = normalize(skill);
  return projects.filter((p) => p.stack.some((s) => normalize(s) === key));
};

export default projectsUsing;
