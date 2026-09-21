"use client";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export function Confetti() {
  useEffect(() => {
    const t = setTimeout(() => {
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.35 }, colors: ["#14B8A6", "#FF6B6B", "#FFC93C", "#fff"] });
      setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.5 }, colors: ["#14B8A6", "#FFC93C"] }), 250);
      setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.5 }, colors: ["#FF6B6B", "#FFC93C"] }), 400);
    }, 300);
    return () => clearTimeout(t);
  }, []);
  return null;
}
