"use client";

import { useEffect } from "react";
import { initAudio } from "../scripts/audio";
import { initCube } from "../scripts/cube";
import { initFaq } from "../scripts/faq";
import { initHeader } from "../scripts/header";
import { initHow } from "../scripts/how";
import { initReveal } from "../scripts/reveal";
import { initRoll } from "../scripts/roll";
import { initTickets } from "../scripts/tickets";

let booted = false;

export default function ClientRuntime() {
  useEffect(() => {
    if (booted) return;
    booted = true;

    initHeader();
    initCube();
    initTickets();
    initRoll();
    initFaq();
    initHow();
    initAudio();
    initReveal();
  }, []);

  return null;
}
