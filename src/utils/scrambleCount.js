import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Figures like "1st", "70%", "+8%" or "450+" flicker through random digits,
// then count up and settle on the real value when they scroll into view.
// The element's data-value holds the final text. Call inside a GSAP context.
const scrambleCount = (el, { delay = 0 } = {}) => {
  const final = el.dataset.value;
  // Digits may carry thousands separators, as in "2,200+".
  const [, prefix = "", num = "", suffix = ""] = final.match(/^(\D*)(\d[\d,]*)(.*)$/) ?? [];
  if (!num) return null;
  const target = Number(num.replace(/,/g, ""));
  const format = (n) => (num.includes(",") ? n.toLocaleString("en-US") : String(n));
  const state = { v: 0 };
  return gsap.to(state, {
    v: target,
    duration: 1.6,
    delay,
    ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 85%", once: true },
    onUpdate() {
      const digits =
        this.progress() < 0.55
          ? Array.from(num, (c) => (c === "," ? c : Math.floor(Math.random() * 10))).join("")
          : format(Math.round(state.v));
      el.textContent = prefix + digits + suffix;
    },
    onComplete: () => {
      el.textContent = final;
    },
  });
};

export default scrambleCount;
