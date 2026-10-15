import { useEffect, useState } from "react";

// Short confirmations ("Email copied"). Anything can raise one with
// window.dispatchEvent(new CustomEvent("toast", { detail: "Message" })).
const Toast = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    let timer;
    const onToast = (e) => {
      setMessage(e.detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(""), 2200);
    };
    window.addEventListener("toast", onToast);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("toast", onToast);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[85] flex justify-center">
      {message && (
        <p className="rounded-full border border-rule bg-plum px-4 py-2 text-sm text-flame shadow-[0_10px_40px_-10px_rgba(18,10,36,0.9)]">
          {message}
        </p>
      )}
    </div>
  );
};


export default Toast;
