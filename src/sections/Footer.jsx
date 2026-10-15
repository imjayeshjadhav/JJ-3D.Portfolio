import { profile, socials } from "../constants";

const Footer = () => (
  <footer className="border-t border-rule/60 py-10">
    <div className="shell flex flex-col gap-6 text-sm text-dim md:flex-row md:items-center md:justify-between">
      <p>© {new Date().getFullYear()} {profile.name}. Built with React, three.js and GSAP.</p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {socials.map(({ name, url }) => (
          <li key={name}>
            <a
              href={url}
              className="text-link"
              {...(url.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </footer>
);

export default Footer;
