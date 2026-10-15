import { useEffect, useMemo, useRef, useState } from "react";

import { navLinks, profile, projects } from "../constants";
import store from "../scene/store";
import { copyEmail } from "../utils/copyEmail";

const goTo = (hash) => {
  if (store.lenis) store.lenis.scrollTo(hash, { offset: -72 });
  else document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
};
const open = (url) => window.open(url, "_blank", "noopener,noreferrer");

const buildCommands = () => [
  ...navLinks.map(({ name, link }) => ({ label: `Go to ${name}`, hint: "Section", run: () => goTo(link) })),
  { label: "Copy email address", hint: profile.email, run: copyEmail },
  {
    label: "Download résumé",
    hint: "PDF",
    run: () => {
      const a = document.createElement("a");
      a.href = profile.resume;
      a.download = "";
      a.click();
    },
  },
  { label: "Open GitHub", hint: "github.com", run: () => open(profile.github) },
  { label: "Open LinkedIn", hint: "linkedin.com", run: () => open(profile.linkedin) },
  { label: "Open LeetCode", hint: "leetcode.com", run: () => open(profile.leetcode) },
  ...projects
    .filter((p) => p.live)
    .map((p) => ({ label: `Open ${p.shortName ?? p.name} live site`, hint: "Project", run: () => open(p.live) })),
];

// ⌘K / Ctrl+K (or "/") opens a quick way to jump anywhere or take an action.
// Other components can open it with window.dispatchEvent(new Event("palette:open")).
const CommandPalette = () => {
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef(null);
  const opener = useRef(null);
  const commands = useMemo(buildCommands, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? commands.filter((c) => `${c.label} ${c.hint}`.toLowerCase().includes(q)) : commands;
  }, [commands, query]);

  useEffect(() => {
    const show = () => {
      opener.current = document.activeElement;
      setQuery("");
      setActive(0);
      setOpen(true);
    };
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", show);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    input.current?.focus();
    store.lenis?.stop();
    return () => store.lenis?.start();
  }, [isOpen]);

  const close = () => {
    setOpen(false);
    opener.current?.focus?.();
  };
  const run = (command) => {
    if (!command) return;
    setOpen(false);
    // Resume smooth scroll first (resuming resets Lenis, which would cancel a
    // scroll already in flight), then act on the next frame.
    store.lenis?.start();
    requestAnimationFrame(() => command.run());
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") run(results[active]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[75] bg-night/70 px-4 pt-[14vh] backdrop-blur-sm" onMouseDown={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
        className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-rule bg-plum shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
      >
        <div aria-hidden="true" className="h-[2px]" style={{ background: "var(--ramp)" }} />
        <input
          ref={input}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Jump to a section or run an action"
          aria-label="Search commands"
          aria-controls="palette-results"
          aria-activedescendant={results[active] ? `palette-item-${active}` : undefined}
          className="w-full border-b border-rule bg-transparent px-5 py-4 text-lg text-flame placeholder:text-dim/70 focus:outline-none"
        />
        <ul id="palette-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {results.map((c, i) => (
            <li
              key={c.label}
              id={`palette-item-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => run(c)}
              className={`flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-lg px-3 ${
                i === active ? "bg-night text-flame" : "text-lilac"
              }`}
            >
              <span>{c.label}</span>
              <span className="truncate text-xs text-dim">{c.hint}</span>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-4 text-sm text-dim">No match. Try “work”, “email” or “résumé”.</li>
          )}
        </ul>
        <p className="border-t border-rule px-5 py-2 text-xs text-dim">↑ ↓ to move, Enter to run, Esc to close</p>
      </div>
    </div>
  );
};

export default CommandPalette;
