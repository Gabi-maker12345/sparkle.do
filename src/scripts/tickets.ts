export function initTickets(): void {
  const list = document.querySelector<HTMLElement>(".formats-list");
  if (!list) return;

  const centre = () => {
    const items = Array.from(list.children) as HTMLElement[];
    if (window.innerWidth > 1023 || items.length < 2 || list.dataset.centred === "1") return;
    const item = items[Math.floor((items.length - 1) / 2)];
    const a = item.getBoundingClientRect();
    const b = list.getBoundingClientRect();
    if (!a.width) return;
    list.style.scrollSnapType = "none";
    list.scrollLeft += a.left + a.width / 2 - (b.left + b.width / 2);
    requestAnimationFrame(() => {
      list.style.scrollSnapType = "";
    });
    list.dataset.centred = "1";
  };

  centre();
  window.addEventListener("load", centre);
  window.addEventListener("resize", () => {
    delete list.dataset.centred;
    centre();
  });
}
