import type { CSSProperties } from "react";

const explore = [
  { href: "#showcase", label: "Início" },
  { href: "#formats", label: "Formatos" },
  { href: "#how", label: "Como funciona" },
  { href: "#work", label: "Trabalhos" },
  { href: "#faq", label: "FAQ" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer" aria-labelledby="footer-title">
      <div className="footer-scallop" aria-hidden="true" />

      <div className="footer-inner">
        <div className="footer-top" data-reveal="">
          <span className="footer-star" aria-hidden="true">
            ✦
          </span>
          <p className="footer-kicker">Portfólios e cartões de visita automáticos</p>
          <span className="footer-rule" aria-hidden="true" />
        </div>

        <div className="footer-card" data-reveal="">
          <div className="footer-brand">
            <h2 className="sr-only" id="footer-title">
              Sparkle.do
            </h2>
            <img
              className="footer-wordmark"
              src="/brand/sparkle-wordmark.png"
              alt="Sparkle.do"
              width={666}
              height={139}
            />
            <p>
              Um portfólio, um cartão de visita e uma imagem de compartilhamento. Uma capa, três lugares para ser
              encontrado.
            </p>
          </div>
          <div className="footer-card-contact">
            <p className="footer-card-label">Um projeto em mente?</p>
            <a href="mailto:gcristovao262@gmail.com">
              Escreva para nós <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="footer-grid">
          <div className="footer-col" data-reveal="">
            <h3>Explorar</h3>
            {explore.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="footer-col" data-reveal="" style={{ "--d": "90ms" } as CSSProperties}>
            <h3>Contato</h3>
            <a href="mailto:gcristovao262@gmail.com">gcristovao262@gmail.com</a>
            <a href="mailto:gabscoder@gmail.com">gabscoder@gmail.com</a>
            <a href="tel:+244939287887">+244 939 287 887</a>
            <a href="#work">Trabalhos selecionados</a>
            <span className="footer-note">Feito para quem tem algo a mostrar.</span>
          </div>

          <div className="footer-col footer-sound" data-reveal="" style={{ "--d": "180ms" } as CSSProperties}>
            <h3>Som</h3>
            <button className="sound" type="button" data-sound="" aria-pressed={false}>
              <span className="eq" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span className="sound-label" data-sound-label="">
                Som desligado
              </span>
            </button>
            <span className="footer-note">Som ambiente em repetição. Começa no primeiro toque se o navegador pedir.</span>
          </div>
        </div>

        <div className="footer-bottom" data-reveal="">
          <span>© 2026 Sparkle.do</span>
          <span>Feito de papel, pixels &amp; um pouco de brilho.</span>
          <a href="#showcase">Voltar ao topo ↑</a>
        </div>
      </div>

      <div className="footer-marquee" aria-hidden="true">
        <div className="footer-marquee-track">
          <div className="footer-marquee-group">
            <span>Portfólios ✦ Cartões ✦ Portfólios ✦ Cartões ✦ Portfólios ✦ Cartões ✦</span>
          </div>
          <div className="footer-marquee-group" aria-hidden="true">
            <span>Portfólios ✦ Cartões ✦ Portfólios ✦ Cartões ✦ Portfólios ✦ Cartões ✦</span>
          </div>
        </div>
      </div>

      <audio data-audio="" loop preload="auto">
        <source src="/audio/ambient.webm" type="audio/webm" />
      </audio>
    </footer>
  );
}
