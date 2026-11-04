"use client";

import { useEffect } from "react";
import { initAudio } from "../scripts/audio";
import { initFaq } from "../scripts/faq";
import { initHeader } from "../scripts/header";
import { initHow } from "../scripts/how";
import { initReveal } from "../scripts/reveal";

let booted = false;

export default function ClientRuntime() {
  useEffect(() => {
    if (booted) return;
    booted = true;

    initHeader();
    initFaq();
    initHow();
    initAudio();
    initReveal();
  }, []);

  return null;
}
