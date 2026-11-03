export function initAudio(): void {
  const audio = document.querySelector<HTMLAudioElement>("[data-audio]");
  const button = document.querySelector<HTMLButtonElement>("[data-sound]");
  if (!audio || !button) return;

  const label = button.querySelector<HTMLElement>("[data-sound-label]");
  let userPaused = false;

  audio.loop = true;
  audio.volume = 0.32;

  const reflect = () => {
    const on = !audio.paused;
    button.setAttribute("aria-pressed", String(on));
    if (label) label.textContent = on ? "Som ligado" : "Som desligado";
  };

  const tryPlay = async () => {
    try {
      await audio.play();
    } catch {
      /* autoplay policy: the first gesture will retry */
    }
    reflect();
  };

  let started = false;
  const startOnGesture = () => {
    if (started) return;
    started = true;
    if (!userPaused) void tryPlay();
    for (const event of ["pointerdown", "keydown", "scroll"]) {
      window.removeEventListener(event, startOnGesture);
    }
  };
  for (const event of ["pointerdown", "keydown", "scroll"]) {
    window.addEventListener(event, startOnGesture, { passive: true });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      audio.pause();
    } else if (!userPaused) {
      void tryPlay();
    }
    reflect();
  });

  button.addEventListener("click", () => {
    if (audio.paused) {
      userPaused = false;
      void tryPlay();
    } else {
      userPaused = true;
      audio.pause();
      reflect();
    }
  });

  audio.addEventListener("play", reflect);
  audio.addEventListener("pause", reflect);

  void tryPlay();
}
