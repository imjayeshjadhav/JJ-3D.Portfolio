import { profile } from "../constants";

const announce = (message) => window.dispatchEvent(new CustomEvent("toast", { detail: message }));

// Copy the email address. Used by the palette, and by email links on fine
// pointers (touch keeps the mailto: link, which opens the mail app).
export const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(profile.email);
    announce("Email copied");
  } catch {
    announce(`Couldn't copy. The address is ${profile.email}`);
  }
};

export const onEmailClick = (e) => {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  e.preventDefault();
  copyEmail();
};
