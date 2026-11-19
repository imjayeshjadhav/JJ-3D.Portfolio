import { useEffect, useRef, useState } from "react";

// What Ask CHM feels like to use: a plain-English question, a streamed
// answer, then a follow-up that relies on the earlier turn. An illustration
// with made-up clients, never real data.
const SCRIPT = [
  { who: "you", text: "Which clients need attention this week?" },
  {
    who: "chm",
    text: "Three clients dropped below 6. The biggest change is Client A, from 7.8 to 5.9: two SLA alerts and a jump in open P1 tickets.",
  },
  { who: "you", text: "What changed for them since last week?" },
  {
    who: "chm",
    text: "Error rates rose after a release on Tuesday, and NPS responses fell with it. Both triaged issues passed validation, so they are real, not noise.",
  },
];

const AskChmVignette = () => {
  const root = useRef(null);
  const [shown, setShown] = useState([]); // [{ who, text }] with text growing as it streams
  const started = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    const run = () => {
      if (reduced) return setShown(SCRIPT);
      let t = 0;
      SCRIPT.forEach((msg, i) => {
        if (msg.who === "you") {
          later(() => setShown((s) => [...s.slice(0, i), msg]), t);
          t += 700;
        } else {
          // Stream the answer word by word, like the real responses.
          const words = msg.text.split(" ");
          words.forEach((_, w) => {
            later(() => setShown((s) => [...s.slice(0, i), { who: "chm", text: words.slice(0, w + 1).join(" ") }]), t);
            t += 55;
          });
          t += 900;
        }
      });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
      timers = [];
    };
  }, []);

  return (
    <div ref={root} className="rounded-2xl border border-rule bg-surface">
      <div className="flex items-center justify-between border-b border-rule px-5 py-3">
        <p className="text-sm font-medium text-ivory">Ask CHM</p>
        <p className="text-xs text-muted">Illustration with made-up clients</p>
      </div>
      <div className="flex min-h-[300px] flex-col gap-3 p-5" aria-live="polite">
        {shown.map((msg, i) => (
          <p
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.95rem] leading-relaxed ${
              msg.who === "you" ? "self-end bg-raised text-ivory" : "self-start border border-rule text-fg"
            }`}
          >
            {msg.text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default AskChmVignette;
