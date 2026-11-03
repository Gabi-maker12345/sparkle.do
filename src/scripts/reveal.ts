export function initReveal(): void {
  let pending = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (!pending.length) return;

  let raf = 0;

  const show = () => {
    raf = 0;
    const limit = window.innerHeight * 0.94;
    pending = pending.filter((element) => {
      if (element.getBoundingClientRect().top > limit) return true;
      element.classList.add("is-in");
      return false;
    });
    if (!pending.length) {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    }
  };

  const request = () => {
    if (!raf) raf = requestAnimationFrame(show);
  };

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  show();
}
