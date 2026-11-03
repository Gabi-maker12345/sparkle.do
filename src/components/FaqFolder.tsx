import { faqs, formats } from "../data/site";

const cover = formats[formats.length - 1].cover;

export default function FaqFolder() {
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <h2 className="sr-only" id="faq-title">
        Perguntas frequentes
      </h2>

      <div className="faq-grid">
        <div className="folder" data-folder="">
          <div className="folder-shape">
            <div className="folder-sil" data-folder-sil="">
              <div className="folder-card" data-folder-card="">
                <img
                  src={cover}
                  alt="Capa do portfólio arquivada na pasta"
                  width={1439}
                  height={1992}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
          <div className="folder-front">
            <p>
              Dúvidas
              <span className="qmark" aria-hidden="true">
                ?
              </span>
            </p>
          </div>
        </div>

        <div className="faq-items">
          {faqs.map((faq, index) => (
            <div className="faq-row" data-row="" key={faq.q}>
              <button
                className="faq-btn"
                type="button"
                id={`faq-btn-${index}`}
                aria-expanded={index === 0}
                aria-controls={`faq-ex-${index}`}
              >
                <span className="tiles" aria-hidden="true">
                  <span>{String(index + 1).padStart(2, "0").charAt(0)}</span>
                  <span>{String(index + 1).padStart(2, "0").charAt(1)}</span>
                </span>
                <span className="faq-q">{faq.q}</span>
                <i className="led" aria-hidden="true" />
              </button>
              <div className="faq-ex" id={`faq-ex-${index}`} role="region" aria-labelledby={`faq-btn-${index}`}>
                <div>
                  <div className="faq-a" dangerouslySetInnerHTML={{ __html: faq.a }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="faq-fly" data-fly="" aria-hidden="true">
        <div className="fly-face fly-pass">
          <div className="fly-eyebrow">
            <span>Passe de embarque ·</span>
            <span data-fly-eyebrow="">Kit completo</span>
          </div>
          <div className="fly-code">
            <span>EU</span>
            <span data-fly-to="">TUDO</span>
          </div>
          <div className="fly-title" data-fly-title="">
            O kit completo
          </div>
        </div>
        <div className="fly-face fly-photo" data-fly-photo="">
          <img src={cover} alt="" width={1439} height={1992} />
        </div>
      </div>
    </section>
  );
}
