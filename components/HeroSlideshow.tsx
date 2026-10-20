"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = { label: string; image: string };

export function HeroSlideshow({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="hero-slides" aria-hidden="true">
      {slides.map((slide, slideIndex) => (
        <div key={slide.image} className={slideIndex === index ? "hero-slide is-active" : "hero-slide"}>
          <Image src={slide.image} alt="" fill sizes="100vw" quality={90} priority={slideIndex === 0} />
        </div>
      ))}
      <div className="hero-slide-shade" />
      <p className="hero-slide-caption">{slides[index]?.label}</p>
    </div>
  );
}
