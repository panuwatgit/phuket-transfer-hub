"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** โผล่ขึ้นมาตอนเลื่อนถึง (IntersectionObserver) — ใส่ delay เป็น ms ได้ */
export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: { children?: ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add("revealed"); io.disconnect(); } }),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const T = Tag as any;
  return <T ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</T>;
}
