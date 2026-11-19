import { useEffect, useRef } from "react";

// A top-down sketch of CampusCompass's wayfinding: blocks of a campus and a
// route drawn between two of them. CampusCompass is private to the college,
// so this stands in for a screenshot.
const BLOCKS = [
  { x: 40, y: 40, w: 150, h: 90, name: "Main building" },
  { x: 230, y: 40, w: 110, h: 140, name: "Library" },
  { x: 380, y: 40, w: 180, h: 80, name: "Labs" },
  { x: 40, y: 180, w: 110, h: 150, name: "Hostel" },
  { x: 190, y: 230, w: 170, h: 100, name: "Auditorium" },
  { x: 400, y: 160, w: 160, h: 170, name: "Academic block" },
];

const ROUTE = "M95,130 L95,155 L210,155 L210,205 L375,205 L375,245 L400,245";

const CampusVisual = () => {
  const route = useRef(null);

  // The route draws itself once, the way the 3D explorer lays out a path.
  useEffect(() => {
    const path = route.current;
    if (!path || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      path.style.transition = "stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1)";
      path.style.strokeDashoffset = "0";
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(path);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      viewBox="0 0 600 370"
      role="img"
      aria-label="Sketch of CampusCompass wayfinding: a campus plan with a walking route drawn from the main building to the academic block."
      className="block aspect-[16/10] w-full bg-surface"
    >
      <defs>
        <pattern id="campus-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="var(--color-rule)" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="600" height="370" fill="url(#campus-grid)" />
      {BLOCKS.map((b) => (
        <g key={b.name}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="6" fill="var(--color-raised)" stroke="var(--color-rule)" />
          <text x={b.x + 12} y={b.y + 24} fill="var(--color-muted)" fontSize="13">
            {b.name}
          </text>
        </g>
      ))}
      <path ref={route} d={ROUTE} fill="none" stroke="var(--color-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="95" cy="130" r="7" fill="var(--color-ink)" stroke="var(--color-gold-soft)" strokeWidth="2.5" />
      <circle cx="400" cy="245" r="7" fill="var(--color-gold)" />
      <text x="412" y="275" fill="var(--color-gold-soft)" fontSize="13">Room 304, 4 min walk</text>
    </svg>
  );
};

export default CampusVisual;
