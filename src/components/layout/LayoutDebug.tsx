import { useEffect, useRef } from "react";

export function LayoutDebug() {
  const lastScrollY = useRef(window.scrollY);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      const diff = Math.abs(current - lastScrollY.current);

      if (diff > 8) {
        console.log("🔴 JUMP DETECTED!");
        console.log("Last scrollY:", lastScrollY.current);
        console.log("Current scrollY:", current);
        console.log("Difference:", diff);
        console.log("Document height:", document.documentElement.scrollHeight);
        console.log("Viewport height:", window.innerHeight);
      }

      lastScrollY.current = current;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null; // nu randează nimic
}
