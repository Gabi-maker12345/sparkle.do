import { formats } from "../data/site";

export default function FormatTickets() {
  return (
    <section className="formats" id="formats" aria-labelledby="formats-title">
      <div className="formats-title">
        <h2 id="formats-title">
          <span>Escolha um formato.</span>
          <span>Encontre o seu.</span>
        </h2>
      </div>

      <ul className="formats-list">
        {formats.map((format, index) => (
          <li className="format" data-format="" data-index={index} key={format.id}>
            <div className="format-media">
              <img
                src={format.cover}
                alt={`Capa do formato ${format.title}`}
                width={1439}
                height={1992}
                loading={index === formats.length - 1 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
            <span className="format-vertical" aria-hidden="true">
              {format.eyebrow.replace("Passe de embarque · ", "")}
            </span>

            <div className="format-pass" data-pass="">
              <div className="pass-inner">
                <p className="pass-eyebrow">
                  <span>Passe de embarque ·</span>
                  <span>{format.eyebrow.replace("Passe de embarque · ", "")}</span>
                </p>
                <p className="pass-code">
                  <span>{format.from}</span>
                  <span>{format.to}</span>
                </p>
                <h3 className="pass-title">{format.title}</h3>
                <div className="pass-features">
                  {format.included.map((item) => (
                    <p className="pass-feature" key={item}>
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <p className="format-greeting" aria-hidden="true">
              {format.greeting}
            </p>
          </li>
        ))}
      </ul>

    </section>
  );
}
