"use client";

import { useEffect, useState } from "react";

/**
 * Overlay that transitions from night to day as the user scrolls.
 * Renders a warm day gradient that fades in over the night scene.
 */
export function ScrollDayOverlay() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY;
      const windowH = window.innerHeight;
      // Transition over ~1.5 viewports of scroll
      const triggerDistance = windowH * 1.5;
      const progress = Math.min(1, scrollY / triggerDistance);
      setScrollProgress(progress);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] transition-opacity duration-300 md:block hidden"
      aria-hidden
      style={{
        opacity: scrollProgress,
        background: `linear-gradient(180deg, 
          rgba(147, 197, 253, 0.18) 0%, 
          rgba(253, 230, 138, 0.15) 30%, 
          rgba(254, 243, 199, 0.22) 60%, 
          rgba(203, 213, 225, 0.28) 100%
        )`,
      }}
    />
  );
}
