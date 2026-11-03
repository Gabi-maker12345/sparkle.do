import { samples } from "../data/site";

const chips = [
  { id: "photography", label: "FO", name: "Fotografia" },
  { id: "design", label: "DE", name: "Design" },
  { id: "development", label: "DV", name: "Desenvolvimento" },
  { id: "writing", label: "ES", name: "Escrita" },
];

export default function HeroCube() {
  return (
    <section className="hero" id="showcase" aria-labelledby="hero-title" data-cube="">
      <div className="cube-stage" data-stage="">
        <div className="hero-mid" data-mid="">
          <div className="cube-floor" aria-hidden="true" />

          <div className="cube" data-cube-body="" aria-hidden="true">
            {samples.map((sample) => (
              <div className="cube-face" data-face="" key={sample.id}>
                <img src={sample.cover} alt="" width={1000} height={1384} loading="eager" decoding="async" />
                <span className="cube-shade" aria-hidden="true" />
                <em data-face-label="">{sample.field}</em>
              </div>
            ))}
            <div className="cube-lid" />
            <div className="cube-rug" />
          </div>

          <button
            className="cube-hit"
            type="button"
            data-hit=""
            aria-label="Ver portfólio de Ava Moreau — Fotografia"
          />
        </div>

        <div className="word-ticket left" aria-hidden="true" data-ticket-left="">
          <span className="word" data-ticket-left-word="">
            Automático?
          </span>
        </div>
        <div className="word-ticket right" aria-hidden="true" data-ticket-right="">
          <span className="word" data-ticket-right-word="">
            Crie rápido
          </span>
        </div>

        <div className="hero-intro">
          <h1 className="hero-head" id="hero-title">
            Um portfólio com a sua cara, não um modelo.
          </h1>
          <span className="hero-hint" data-hint="">
            Arraste o cartão. Toque numa face para ver.
          </span>
          <a className="hero-cta" href="#formats">
            Ver formatos
          </a>
        </div>

        <div className="hero-meta" data-meta="" aria-live="polite">
          <span className="ml">Seu primeiro cartão</span>
          <span className="m1" data-meta-1="">
            Sol · estudo de luz
          </span>
          <span className="m2" data-meta-2="">
            Fotografia, com Ava Moreau
          </span>
        </div>

        <div className="hero-chips" role="group" aria-label="Escolha um portfólio">
          {chips.map((chip) => (
            <button
              type="button"
              data-chip={chip.id}
              aria-label={chip.name}
              aria-pressed={chip.id === "photography"}
              key={chip.id}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
