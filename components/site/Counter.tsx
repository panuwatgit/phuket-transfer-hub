"use client";
import { useEffect, useRef } from "react";

export function Counter({ to, suffix = "", className = "" }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      let t0: number | null = null;
      const step = (ts: number) => {
        if (!t0) t0 = ts;
        const p = Math.min((ts - t0) / 1400, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString("th-TH") + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, suffix]);
  return <div ref={ref} className={className}>0</div>;
}
