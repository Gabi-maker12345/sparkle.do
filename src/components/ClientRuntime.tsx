"use client";

import { useEffect } from "react";
import { initAudio } from "../scripts/audio";
import { initFaq } from "../scripts/faq";
import { initHeader } from "../scripts/header";
import { initPencil } from "../scripts/pencil";
import { initHeroScroll } from "../scripts/heroScroll";
import { initHow } from "../scripts/how";
import { initReveal } from "../scripts/reveal";
import { initTickets } from "../scripts/tickets";

let booted = false;

export default function ClientRuntime() {
  useEffect(() => {
    if (booted) return;
    booted = true;

    initHeader();
    initPencil();
    initHeroScroll();
    initTickets();
    initFaq();
    initHow();
    initAudio();
    initReveal();
  }, []);

  return null;
}
