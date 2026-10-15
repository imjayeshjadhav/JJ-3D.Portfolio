import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

import { profile } from "../constants";
import useDragRotate from "../hooks/useDragRotate";


const Contact = () => {
  const formRef = useRef(null);
  const stage = useRef(null);
  useDragRotate(stage, "contact");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (status !== "sending") setStatus("idle");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await emailjs.sendForm(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
      );
      setForm({ name: "", email: "", message: "" });
      setStatus("sent");
    } catch (error) {
      console.error("EmailJS error:", error);
      setStatus("error");
    }
  };

  return (
    <section id="contact" data-formation="contact" className="section border-t border-rule/60">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="section-title">Get in touch</h2>
          <p className="section-lede">
            Hiring for an AI or full-stack role, or building something that needs both? Send a
            message, or email{" "}
            <a href={`mailto:${profile.email}`} className="text-link text-lilac">
              {profile.email}
            </a>
            .
          </p>

          <form ref={formRef} onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm text-lilac">Name</label>
              <input id="name" name="name" type="text" autoComplete="name" required value={form.name} onChange={handleChange} className="field" />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-lilac">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} className="field" />
            </div>
            <div>
              <label htmlFor="message" className="mb-2 block text-sm text-lilac">Message</label>
              <textarea id="message" name="message" rows="5" required value={form.message} onChange={handleChange} className="field resize-y" />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" disabled={status === "sending"} className="btn btn-solid disabled:opacity-60">
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
              <p role="status" aria-live="polite" className="text-sm">
                {status === "sent" && <span className="text-flame">Message sent. I’ll reply by email.</span>}
                {status === "error" && (
                  <span className="text-ember">
                    Couldn’t send your message. Check your connection and try again, or email me directly.
                  </span>
                )}
              </p>
            </div>
          </form>
        </div>

        {/* The shared scene draws the 3D desk here, ringed by the point cloud. */}
        <div
          id="contact-stage"
          ref={stage}
          tabIndex={0}
          role="img"
          aria-label="3D desk with a retro computer. Drag, or use the arrow keys, to turn it."
          className="drag-stage order-first min-h-[340px] rounded-2xl border border-rule/70 lg:order-none lg:col-span-7 lg:min-h-[560px]"
        />
      </div>
    </section>
  );
};

export default Contact;
