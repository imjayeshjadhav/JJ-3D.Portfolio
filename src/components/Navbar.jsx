import { useEffect, useRef, useState } from "react";
import { navLinks, profile } from "../constants";

const PALETTE_KEY = /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘K" : "Ctrl K";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const progress = useRef(null);

  // Scrolled state, plus a progress line that fills along the magma ramp.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Mark the section currently crossing the middle of the screen.
  useEffect(() => {
    const targets = navLinks.map(({ link }) => document.querySelector(link)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`));
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    targets.forEach((t) => io.observe(t));
    const onTop = () => window.scrollY < window.innerHeight * 0.4 && setActive(null);
    window.addEventListener("scroll", onTop, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onTop);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "border-b border-rule/70 bg-night/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav className="shell flex h-[var(--nav-h)] items-center justify-between" aria-label="Main">
        <a
          href="#top"
          className="font-display text-2xl font-bold tracking-tight text-flame"
          aria-label="Jayesh Jadhav, back to top"
        >
          JJ
        </a>

        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map(({ name, link }) => (
            <li key={name}>
              <a
                href={link}
                aria-current={active === link ? "true" : undefined}
                className={`relative text-[0.95rem] transition-colors hover:text-flame ${
                  active === link ? "text-flame" : "text-dim"
                }`}
              >
                {name}
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-2 left-1/2 size-1 -translate-x-1/2 rounded-full bg-ember transition-opacity ${
                    active === link ? "opacity-100" : "opacity-0"
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("palette:open"))}
            className="hidden min-h-9 items-center gap-2 rounded-full border border-rule px-3 text-sm text-dim transition-colors hover:border-ember hover:text-flame xl:inline-flex"
          >
            Jump to
            <kbd className="rounded border border-rule px-1.5 font-sans text-xs">{PALETTE_KEY}</kbd>
          </button>
          <a href={profile.resume} download data-magnetic className="btn btn-quiet hidden !py-2 sm:inline-flex">
            Download résumé
          </a>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-rule text-lilac lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              {open ? (
                <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>
      <div
        ref={progress}
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[-1px] h-[2px] origin-left"
        style={{ background: "var(--ramp)", transform: "scaleX(0)" }}
      />

      {open && (
        <div id="mobile-menu" className="h-[calc(100dvh-var(--nav-h))] border-t border-rule/70 lg:hidden">
          <ul className="shell flex flex-col pt-6">
            {navLinks.map(({ name, link }) => (
              <li key={name} className="border-b border-rule/60">
                <a
                  href={link}
                  onClick={() => setOpen(false)}
                  aria-current={active === link ? "true" : undefined}
                  className={`block py-5 font-display text-3xl ${active === link ? "text-ember" : "text-flame"}`}
                >
                  {name}
                </a>
              </li>
            ))}
            <li className="pt-8">
              <a href={profile.resume} download className="btn btn-solid w-full">
                Download résumé
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
