import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "../styles/tokens.css";
import "../styles/base.css";
import "../styles/header.css";
import "../styles/hero.css";
import "../styles/tickets.css";
import "../styles/faq.css";
import "../styles/process.css";
import "../styles/gallery.css";
import "../styles/footer.css";

import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import ClientRuntime from "../components/ClientRuntime";

const title = "Sparkle.do — Portfólios e cartões de visita automáticos";
const description =
  "O Sparkle.do transforma o seu trabalho em portfólio, cartão de visita pronto para imprimir e cartão compartilhável. Escolha um formato, adicione o seu trabalho e publique.";

export const metadata: Metadata = {
  metadataBase: new URL("https://sparkle.do"),
  title,
  description,
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/brand/favicon.ico" },
      { url: "/brand/favicon.png", type: "image/png" },
    ],
    apple: "/brand/favicon.png",
  },
  openGraph: {
    siteName: "Sparkle.do",
    title,
    description,
    url: "/",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/img/og-1200x630.jpg", width: 1200, height: 630, alt: "Sparkle.do — portfólios e cartões de visita" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/img/og-1200x630.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="js" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SiteHeader />
        <main id="page">{children}</main>
        <SiteFooter />
        <ClientRuntime />
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}.hero{height:auto!important;min-height:100svh!important}.hero-stage{position:relative!important;height:auto!important;min-height:100svh!important;overflow:visible!important}.hero-float,.hero-emojis,.pencil-intro,.hero-kicker,.hero-cue,.pencil-dock,.pencil-final,.pencil-final-shadow,.hero-pencil-wrap{display:none!important}.hero-3d{display:none!important}.hero-panel-bg{opacity:1!important}.hero-panel-decor{opacity:1!important}.hero-progress,.hero-final-copy{display:none!important}.story-block>*,.story-block .story-cap{opacity:1!important;transform:none!important;transition:none!important}.hero-story{position:relative!important;inset:auto!important;opacity:1!important;visibility:visible!important;pointer-events:auto!important;padding:108px 6vw 88px!important}.hero-story-inner{display:flex!important;flex-direction:column!important;gap:64px!important;min-height:0!important;padding:0!important}.story-block{position:relative!important;grid-area:auto!important;opacity:1!important;visibility:visible!important;transform:none!important;pointer-events:auto!important;transition:none!important}.story-spark{animation:none!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
