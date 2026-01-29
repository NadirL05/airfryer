"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<"idle" | "success" | "error" | "sending">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage("error");
      return;
    }

    setMessage("sending");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage("error");
        return;
      }

      setMessage("success");
      setEmail("");
    } catch {
      setMessage("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setMessage("idle");
          }}
          placeholder="Votre email"
          disabled={message === "sending"}
          className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
          aria-label="Votre email"
        />
        <button
          type="submit"
          disabled={message === "sending"}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {message === "sending" ? "..." : "OK"}
        </button>
      </div>
      {message === "success" && (
        <p className="text-xs text-green-400">
          Merci ! Vous êtes inscrit à la newsletter.
        </p>
      )}
      {message === "error" && (
        <p className="text-xs text-amber-400">
          Une erreur s&apos;est produite. Réessayez plus tard.
        </p>
      )}
    </form>
  );
}
