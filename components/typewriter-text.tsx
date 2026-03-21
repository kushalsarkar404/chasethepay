"use client";

import { useEffect, useState } from "react";

const WORDS = [
  "freelancers",
  "agencies",
  "consultants",
  "B2B teams",
  "professionals",
  "marketplaces",
];

const TYPE_DELAY = 50;
const PAUSE_MS = 1200;
const DELETE_DELAY = 35;

export function TypewriterText({ className }: { className?: string }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[wordIndex];
    const isAtEnd = display === word;
    const isAtStart = display === "";

    const timeout = setTimeout(
      () => {
        if (isDeleting) {
          if (isAtStart) {
            setIsDeleting(false);
            setWordIndex((i) => (i + 1) % WORDS.length);
          } else {
            setDisplay(word.slice(0, display.length - 1));
          }
        } else {
          if (isAtEnd) {
            setIsDeleting(true);
          } else {
            setDisplay(word.slice(0, display.length + 1));
          }
        }
      },
      isDeleting ? DELETE_DELAY : isAtEnd ? PAUSE_MS : TYPE_DELAY
    );

    return () => clearTimeout(timeout);
  }, [display, wordIndex, isDeleting]);

  return (
    <span className={className} aria-live="polite" aria-atomic="true">
      {display}
      <span
        className="animate-pulse"
        style={{ animationDuration: "1s" }}
        aria-hidden
      >
        |
      </span>
    </span>
  );
}
