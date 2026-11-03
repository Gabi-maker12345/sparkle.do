import type { CSSProperties } from "react";
import { works } from "../data/site";

const rows = [works.slice(0, 4), works.slice(4, 8)];

export default function WorkGallery() {
  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <header className="work-head">
        <div data-reveal="">
          <p className="work-eyebrow">
            <span aria-hidden="true">✦</span> Estudos de portfólio
          </p>
          <h2 className="work-title" id="work-title">
            Trabalho que <span className="work-accent">viaja.</span>
          </h2>
        </div>
        <p className="work-lede" data-reveal="" style={{ "--d": "120ms" } as CSSProperties}>
          Alguns mundos, prontos para serem seus. Fotografia, objetos, espaços e tipografia — o mesmo trabalho,
          vestido para a web, o papel e uma mensagem.
        </p>
      </header>

      <div className="work-marquees">
        {rows.map((row, rowIndex) => (
          <div
            className={`marquee${rowIndex === 1 ? " reverse" : ""}`}
            data-reveal=""
            style={{ "--d": `${rowIndex * 120}ms` } as CSSProperties}
            key={rowIndex}
          >
            <div className="marquee-track">
              {[0, 1].map((copy) => (
                <div className="marquee-group" aria-hidden={copy === 1 || undefined} key={copy}>
                  {row.map((item, index) => (
                    <figure className="work-card" key={`${copy}-${item.src}`}>
                      <div className="work-img">
                        <img
                          src={item.src}
                          alt={copy === 0 ? item.alt : ""}
                          width={900}
                          height={1200}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <figcaption>
                        <span>{item.category}</span>
                        <span aria-hidden="true">
                          {String(rowIndex * 4 + index + 1).padStart(2, "0")} / 08
                        </span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="work-foot" data-reveal="">
        <p>Oito estudos. O próximo é o seu.</p>
        <a className="work-cta" href="#formats">
          Escolher formato
        </a>
      </div>
    </section>
  );
}
