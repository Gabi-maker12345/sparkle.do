const links = [
  { href: "#showcase", label: "Início", idx: "01" },
  { href: "#formats", label: "Formatos", idx: "02" },
  { href: "#faq", label: "FAQ", idx: "03" },
  { href: "#how", label: "Como", idx: "04" },
  { href: "#work", label: "Galeria", idx: "05" },
];

export default function SiteHeader() {
  return (
    <>
      <a className="skip" href="#page">
        Ir para o conteúdo
      </a>

      <header className="site-header" id="header">
        <div className="header-row">
          <button
            className="burger"
            type="button"
            aria-expanded="false"
            aria-controls="mobile-menu"
            aria-label="Abrir menu"
            data-burger=""
          >
            <span aria-hidden="true" />
          </button>

          <div className="nav-shell">
            <a className="brand" href="#showcase" aria-label="Sparkle.do — início">
              <img className="monogram" src="/brand/sparkle-monogram.png" alt="" width={526} height={332} />
              <img className="wordmark" src="/brand/sparkle-wordmark.png" alt="Sparkle.do" width={666} height={139} />
            </a>

            <nav className="nav" aria-label="Principal">
              {links.map((link) => (
                <a className="nav-item" href={link.href} key={link.href}>
                  <span>{link.label}</span>
                  <span className="idx" aria-hidden="true">
                    {link.idx}
                  </span>
                </a>
              ))}
            </nav>
          </div>

          <div className="actions">
            <a className="cta" href="#formats">
              Começar
            </a>
          </div>

          <a className="mobile-cta" href="#formats">
            Começar
          </a>
        </div>

        <div className="mobile-menu" id="mobile-menu" data-menu="" hidden>
          <nav aria-label="Menu">
            {links.map((link) => (
              <a href={link.href} key={link.href}>
                <span>{link.label}</span>
                <span aria-hidden="true">{link.idx}</span>
              </a>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
