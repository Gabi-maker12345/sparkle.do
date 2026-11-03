import type { CSSProperties } from "react";
import { steps, works } from "../data/site";

const sheet = works[2];

export default function HowItWorks() {
  return (
    <section className="how" id="how" aria-labelledby="how-title" data-how="">
      <div className="how-inner">
        <header className="how-head">
          <div data-reveal="">
            <p className="how-eyebrow">
              <span aria-hidden="true">✦</span> Como funciona
            </p>
            <h2 className="how-title" id="how-title">
              Três passos.
              <br />
              <span className="how-accent">Um cartão.</span>
            </h2>
          </div>
          <p className="how-lede" data-reveal="" style={{ "--d": "120ms" } as CSSProperties}>
            Sem tela em branco, sem caçar modelo. Comece pelo que você já fez e deixe o formato fazer o resto.
          </p>
        </header>

        <div className="how-body">
          <div className="how-visual" data-how-visual="" aria-hidden="true">
            <span className="how-orbit" />
            <span className="how-star">✦</span>

            <div className="how-layer how-sheet">
              <img src={sheet.src} alt="" width={900} height={1200} loading="lazy" decoding="async" />
              <span className="how-sheet-cap">Trabalhos selecionados · 2026</span>
            </div>

            <div className="how-layer how-biz">
              <span className="how-biz-top">sparkle.do</span>
              <span className="how-biz-star">✦</span>
              <span className="how-biz-name">Ava Moreau</span>
              <span className="how-biz-meta">fotografia · são paulo</span>
              <span className="how-biz-line" />
            </div>

            <div className="how-layer how-share">
              <span className="how-share-k">portfólio</span>
              <span className="how-share-t">
                Trabalhos
                <br />
                selecionados
              </span>
              <span className="how-share-arrow">↗</span>
            </div>

            <span className="how-caption">01 — 03</span>
          </div>

          <ol className="how-steps" data-how-steps="">
            <span className="how-rail" aria-hidden="true" />
            {steps.map((step, index) => (
              <li
                className="how-step"
                data-step=""
                style={{ "--d": `${160 + index * 110}ms` } as CSSProperties}
                key={step.n}
              >
                <span className="how-num" aria-hidden="true">
                  {step.n}
                </span>
                <div className="how-step-copy">
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
