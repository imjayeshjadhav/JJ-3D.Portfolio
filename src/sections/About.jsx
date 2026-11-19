import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { about, profile } from "../constants";
import github from "../data/github.json";
import leetcode from "../data/leetcode.json";

gsap.registerPlugin(ScrollTrigger);

// Each word in its own span so the reading reveal can light them in order.
const Words = ({ text }) =>
  text.split(" ").map((word, i) => (
    <span key={i} className="about-word">
      {word}{" "}
    </span>
  ));

const [first, ...restOfFirst] = about.paragraphs[0].split(/(?<=\.)\s/);
const lead = first;
const opening = restOfFirst.join(" ");

const About = () => {
  const scope = useRef(null);

  // Words brighten one by one as the text scrolls through the view.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".about-word",
          { opacity: 0.22 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.05,
            scrollTrigger: { trigger: ".about-text", start: "top 80%", end: "bottom 55%", scrub: 0.5 },
          }
        );
      });
      return () => mm.revert();
    },
    { scope }
  );

  return (
    <section id="about" ref={scope} data-formation="about" className="section">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="section-title lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">About</h2>
        </div>

        <div className="lg:col-span-7">
          <div className="about-text">
            <p
              className="font-display text-3xl leading-tight text-ivory md:text-[2.5rem]"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              <Words text={lead} />
            </p>
            <p className="mt-6 text-lg text-fg">
              <Words text={opening} />
            </p>
            {about.paragraphs.slice(1).map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="mt-5 text-lg text-fg">
                <Words text={paragraph} />
              </p>
            ))}
          </div>

          <dl className="mt-12 grid gap-x-8 gap-y-5 border-t border-rule/60 pt-8 sm:grid-cols-3">
            {about.facts.map(({ term, detail }) => (
              <div key={term}>
                <dt className="text-sm text-muted">{term}</dt>
                <dd className="mt-1 text-fg">{detail}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            <li>
              <a href={profile.github} target="_blank" rel="noreferrer" className="text-link text-fg">
                GitHub
              </a>
              <span className="ml-3 text-sm text-muted">
                {github.publicRepos} public repositories, {github.followers} followers
              </span>
            </li>
            <li>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-link text-fg">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={profile.leetcode} target="_blank" rel="noreferrer" className="text-link text-fg">
                LeetCode
              </a>
              <span className="ml-3 text-sm text-muted">{leetcode.solved.all} problems solved</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell mt-20" data-formation="activity">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <h3 className="font-sans text-lg font-semibold tracking-normal text-fg">A year on LeetCode</h3>
            <p className="mt-1 text-sm text-muted">
              {leetcode.solved.all} problems solved: {leetcode.solved.easy} easy, {leetcode.solved.medium} medium,{" "}
              {leetcode.solved.hard} hard.
            </p>
          </div>
          <p className="text-sm text-muted">
            <span className="text-gold">{leetcode.streak}-day streak</span>, {leetcode.activeDays} active days,{" "}
            {leetcode.total} submissions in the last year
          </p>
        </div>
        {/* The shared scene draws the submission calendar here as 3D bars. */}
        <a
          href={leetcode.url}
          target="_blank"
          rel="noreferrer"
          id="activity-stage"
          data-cursor="open"
          aria-label={`LeetCode profile: ${leetcode.total} submissions over the last year. Opens in a new tab.`}
          className="mt-4 block h-[220px] w-full rounded-2xl border border-rule/60"
        />
        <p id="activity-tooltip" aria-hidden="true" className="activity-tooltip" />
      </div>
    </section>
  );
};

export default About;
