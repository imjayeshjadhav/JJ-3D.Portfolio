import { useRef } from "react";

import { profile } from "../constants";
import useDragRotate from "../hooks/useDragRotate";
import { onEmailClick } from "../utils/copyEmail";

// Opens the visitor's mail app with a message to me already addressed.
const MAILTO = `mailto:${profile.email}?subject=${encodeURIComponent("Hello from your portfolio")}`;

const Contact = () => {
  const stage = useRef(null);
  useDragRotate(stage, "contact");

  return (
    <section id="contact" data-formation="contact" className="section border-t border-rule/60">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <h2 className="section-title">Get in touch</h2>
          <p className="section-lede">
            Hiring for an AI or full-stack role, or building something that needs both? Write to
            me at{" "}
            <a href={`mailto:${profile.email}`} onClick={onEmailClick} data-cursor="copy" className="text-link text-lilac">
              {profile.email}
            </a>
            .
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href={MAILTO} data-magnetic className="btn btn-solid">
              Email me
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn btn-quiet">
              Message on LinkedIn
            </a>
          </div>
        </div>

        {/* The shared scene draws the 3D desk here, ringed by the point cloud. */}
        <div
          id="contact-stage"
          ref={stage}
          data-cursor="drag"
          tabIndex={0}
          role="img"
          aria-label="3D desk with a retro computer. Drag, or use the arrow keys, to turn it."
          className="drag-stage min-h-[340px] rounded-2xl border border-rule/70 lg:col-span-7 lg:min-h-[480px]"
        />
      </div>
    </section>
  );
};

export default Contact;
