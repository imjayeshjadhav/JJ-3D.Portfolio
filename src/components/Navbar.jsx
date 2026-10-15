import { useEffect, useState } from "react";
import { navLinks, profile } from "../constants";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
              <a href={link} className="text-[0.95rem] text-dim transition-colors hover:text-flame">
                {name}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href={profile.resume} download className="btn btn-quiet hidden !py-2 sm:inline-flex">
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

      {open && (
        <div id="mobile-menu" className="h-[calc(100dvh-var(--nav-h))] border-t border-rule/70 lg:hidden">
          <ul className="shell flex flex-col pt-6">
            {navLinks.map(({ name, link }) => (
              <li key={name} className="border-b border-rule/60">
                <a
                  href={link}
                  onClick={() => setOpen(false)}
                  className="block py-5 font-display text-3xl text-flame"
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
