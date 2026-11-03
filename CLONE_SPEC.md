# CLONE_SPEC — Extração técnica da referência

**Fonte:** `https://classe.squarespace.com/` («Common Language»)
**Observado:** 2026-11-03, via REA/Chrome DevTools Protocol.
**Evidência REA:** `ev_af11ec60177a7e0f0c2e881ff8686597684d0e7a3de4f99bac4ce0e9f1dd537c`
**Browser:** Chrome 156.0.8078.47 · CDP 1.3 · V8 15.6.75.19 · DPR 1
**Viewports medidos:** 1440×900, 1024×900, 390×844 (motion permitido)
**Escopo do clone:** secções 1, 2 e 3 apenas. A 4.ª secção (footer/newsletter) está fora.
**Contexto de destino:** Sparkle.do (portfólios e cartões de visita automáticos). As adaptações estão na §9.

Método: DOM renderizado, CSS computado, folhas de estilo descarregadas (`custom.css` 39 989 B; `site.css` 1 291 500 B; `static.css` 489 449 B), blocos `<style>` inline (51 521 / 12 235 / 12 319 / 4 770 / 9 776 / 77 271 B), scripts inline (36 398 / 16 959 / 11 906 / 1 573 / 872 / 658 / 456 B), capturas de ecrã por secção e inventário de rede.

> Todos os valores abaixo são medidos. O que não pôde ser determinado está marcado `[NÃO DETERMINADO]` e explicado na §10. As decisões de adaptação (não extração) estão isoladas na §9.

---

## 1. Stack e tecnologias

| Camada | Tecnologia | Versão / evidência |
|---|---|---|
| CMS / render | Squarespace **7.1** (Fluid Engine), HTML renderizado no servidor | `Static.SQUARESPACE_CONTEXT`, `templateId: 5c5a519771c10ba3470d8101`, `website.id: 6ac2d97f598bd83d9598a68d` |
| Framework JS | **Nenhum** (sem React/Vue/Svelte/Next/Astro). `window` só expõe `Static`, `YUI`, `Y` | inspeção de globals |
| Runtime legado | **YUI 3.17.2** | `window.YUI.version` |
| Polyfills | `@sqs/polyfiller/1.7.7/modern.js` | `<script src>` |
| Build / CSS | **LESS compiler v1.3.3** (Squarespace) → CSS minificado; 50 folhas | cabeçalho de `custom.css` |
| Frameworks CSS | **Nenhum** (sem Tailwind/Bootstrap). CSS próprio + variáveis CSS | `class` names, ausência de utilitários |
| Animação | **CSS transitions/keyframes + `requestAnimationFrame` vanilla**. Sem GSAP/Framer/Lottie/AOS/Three.js | scripts lidos; `window` sem globals dessas libs |
| 3D | **CSS 3D transforms** (`perspective`, `preserve-3d`, `rotateY/X`) | `#novule-cube`, `.cr-actor`, `.ff-fly` |
| UI / ícones | Ícones em **SVG data-URI inline**; fonte de ícones sociais; cart Squarespace | `background-image: url("data:image/svg+xml,…")` |
| Sliders | Nenhum plugin; o “carrossel” da §2 é flexbox + scroll-snap nativo | CSS |
| Gráficos/mapas/vídeo | Nenhum | inspeção |
| Terceiros | **reCAPTCHA Enterprise** (`6LdDFQwjAAAAAPigEvvPgEVbb7QBm-TkVJdDTlAv`), **Google Fonts** (Archivo 800–900), Squarespace Commerce/User Account, CDN de imagens/fontes | `<script>`, `<link>`, `@font-face` |
| Analytics | Nenhum detetado no cliente (sem GA/GTM/Meta Pixel no DOM) | `[NÃO DETERMINADO]` se existe do lado Squarespace |

**Scripts próprios (inline):**

| Script | Bytes | Função |
|---|---:|---|
| `FB_CFG` | 456 | overrides do cubo (`CUBE_STYLE:'photo'`, `GAP:72`, `HINT:'Tap the cube to hear it'`, `BOTTOM_SPACE:-60`) |
| Tutor Cube Hero **v28** | 36 398 | motor do cubo, tickets 3D, chips, TTS, scroll-shrink |
| **CUBE ROLL v2.0** | 16 959 | projeção do passe num cubo 3D entre a §1 e a §2 |
| FOLDER FAQ **v6.4** | 11 906 | pasta + acordeão + voo do passe para a pasta |
| split title | 1 573 | divide «Pick a voice. Find yours.» em 2 extremos; centra cartão no mobile |
| reserve header | 658 | publica `--header-height` |
| print layer | 872 | squash/pop quando o cubo “aterra” |

**Performance observada (1.ª carga, headless):** TTFB 861 ms · DOMContentLoaded 1 282 ms · load 2 058 ms · 1735 nós de DOM.

---

## 2. Design system

### 2.1 Cor (tokens reais do tema Squarespace)

| Token | HSL | HEX | Uso |
|---|---|---|---|
| `--white-hsl` | `38.18, 100%, 97.84%` | `#FFFBF4` | fundo da página e das 3 secções; texto sobre vinho |
| `--black-hsl` | `342, 53.57%, 10.98%` | `#2B0D16` | texto principal, ícones |
| `--accent-hsl` | `344.31, 55.56%, 22.94%` | `#5B1A2B` | vinho primário: CTA, títulos da §2, passe, palavras |
| `--lightAccent-hsl` | `350.77, 53.06%, 80.78%` | `#E8B4BC` | rosa: faixa do passe, chips ativos, pebble, destaques |
| `--darkAccent-hsl` | `340.47, 58.9%, 14.31%` | `#3A0F1D` | contornos 1.5–2.5 px, sombras deslocadas, superfícies escuras |

**Cores derivadas (resolvidas pelo browser):**

| Expressão | Resultado | Onde |
|---|---|---|
| `color-mix(lightAccent 36%, white)` | `#F7E1E0` | fundo da barra de navegação e do bolso da pasta |
| `color-mix(lightAccent 62%, white)` | `#F1CFD1` | hover dos links da barra |
| `color-mix(accent 32%, darkAccent)` | `#451321` | fundo das linhas FAQ |
| `color-mix(darkAccent 70%, black)` | `#290A14` | tiles dos números |
| `color-mix(darkAccent 15%, white)` | `#E1D8D4` | fundo do cartão da pasta |
| `linear-gradient(lightAccent 72px, accent 0)` | faixa rosa + corpo vinho | passe da §2 |
| `radial-gradient(closest-side, hsla(dark,.32), transparent)` | sombra do chão | `#novule-cube .fb-floor` |

**Gradientes e sombras exatas:**

| Nome | Valor |
|---|---|
| Barra (`--nh-lift`) | `0 1px 2px hsla(dark,.14), 0 10px 18px -10px hsla(dark,.35), 0 26px 46px -24px hsla(dark,.5)` |
| Profundidade §2 (`--depth`) | `0 2px 4px hsla(dark,.16), 0 16.2px 36px -12.6px hsla(dark,.55)` |
| Contorno “print” | `0 0 0 2.5px dark, 7px 7px 0 2.5px dark` (passe: `7px 9px`) |
| CTA nav | `0 0 0 2.5px dark, 4px 5px 0 2.5px dark` |
| Botão herói | `0 0 0 2.5px dark, 5px 5px 0 2.5px dark` |
| Balão “Say it” | `0 0 0 2px dark, 4px 4px 0 2px dark` |
| Faces do cubo | `inset 0 0 0 2.5px dark`; imagem `0 0 0 2px dark` |
| Pasta (frente) | `0 0 0 1.5px dark, 7px 9px 0 1.5px dark` |
| Painel FAQ | `0 0 0 1.5px dark, 7px 9px 0 1.5px mix(dark 60%, #000)` |
| Imagem §2 | `0 2px 4px hsla(dark,.16), 0 16.2px 36px -12.6px hsla(dark,.55)` |

**Contraste (WCAG, medido):** `#FFFBF4/#5B1A2B` 12.51 · `#FFFBF4/#3A0F1D` 16.08 · `#E8B4BC/#5B1A2B` 7.18 · `#2B0D16/#FFFBF4` 17.37.

### 2.2 Tipografia

| Família | Pesos | Origem | Papel |
|---|---|---|---|
| **Faculty Glyphic** | 400 | Squarespace font library (`file.squarespace-cdn.com/.../latin-ext.woff2`) | display + corpo (todo o site) |
| **Geist** | 500 / 600 / 700 | idem | micro-labels e CTA da barra |
| **Archivo** | 800–900 | Google Fonts (`wdth,wght@62..125,800..900`) | carregada; **não aplicada** nas 3 secções `[NÃO DETERMINADO]` |
| `squarespace-ui-font` | normal | Squarespace | UI/cart |
| `social-icon-font` | normal | Squarespace | redes sociais |

**Escala global (variáveis):** `--heading-1-size:4rem` · `-2:3.5rem` · `-3:2.5rem` · `-4:1.5rem`; `line-height:1.1em`; `letter-spacing:-.03em`; corpo `line-height:1.2em`, `letter-spacing:.01em`.

**Estilos medidos (1440×900):**

| Elemento | Fonte | Peso | Tamanho / LH | Tracking | Cor |
|---|---|---:|---|---|---|
| Logo nav (texto) | Faculty Glyphic | 400 | 24.64 / 27.104 px | −0.7392 px | `#2B0D16` |
| Links nav | Faculty Glyphic | 600 | 16 / 19.2 px | +0.16 px | `#5B1A2B` |
| Números nav 01/02/03 | ui-monospace | 500 | 11 / 11 px | +0.06em, op .55 | — |
| CTA nav | Geist | 700 | 14.272 px | normal | `#FFFBF4` |
| Título herói (`.fb-head`) | Faculty Glyphic | 400 | 31.68 / 33.58 px | −0.1584 px | `#5B1A2B` |
| Palavra do ticket 3D | Faculty Glyphic | 400 | 78.336 / 78.336 px | −1.56672 px | `#2B0D16` / `#FFFBF4` |
| Label do ticket (::after) | Faculty Glyphic | 600 | 13 / 13 px | +0.13 px | `#3A0F1D` / `#E8B4BC` |
| Botão herói | Faculty Glyphic | 700 | 15 / 21.27 px | +0.177 px | `#FFFBF4` |
| Dica do herói | Faculty Glyphic | 600 | 13 / 13 px | +0.13 px, op .6 | `#2B0D16` |
| Meta (`.fb-m1` / `.fb-m2`) | Faculty Glyphic | 400 / 600 | 20 / 24 px · 13 / 13 px | 0 / +0.13 px | `#3A0F1D` |
| Chips | Faculty Glyphic | 700 | 13 / 13 px | — | `#5B1A2B` |
| Título §2 | Faculty Glyphic | 400 | 74.88 / 74.88 px | −0.7488 px | `#5B1A2B` |
| Passe, eyebrow | Faculty Glyphic | 700 | 12 / 16.8 px | +2.4 px (uppercase) | `#5B1A2B` sobre rosa |
| Passe, código | Faculty Glyphic | 800 | 60.48 / 60.48 px | normal | `#FFFBF4` |
| Passe, título | Faculty Glyphic | 400 | 25.6 / 28.16 px | −0.256 px | `#FFFBF4` |
| Passe, features | Faculty Glyphic | 700 | 11.84 / 15.392 px | +0.3552 px (uppercase) | `#FFFBF4` |
| Passe, label vertical | Faculty Glyphic | 700 | 13.12 / 18.368 px | +3.6736 px | `#FFFBF4` |
| Passe, saudação | Faculty Glyphic | 400 | 25.6 / 25.6 px | — | `#5B1A2B` sobre `#FFFBF4` |
| FAQ título frente | Faculty Glyphic | 400 | `clamp(32px,3vw,42px)` / 1.02 | −0.01em | `#3A0F1D` |
| FAQ pergunta | Faculty Glyphic | 500 | `clamp(17px,1.5vw,20px)` / 1.3 | +0.01em | `#FFFBF4` |
| FAQ resposta | Faculty Glyphic | 400 | 16 / 24.8 px | +0.177 px | `#3A0F1D` |
| FAQ numeração | Faculty Glyphic | 400 | 25 / 25 px | — | `#E8B4BC` |
| Corpo no herói/§2 (contexto Squarespace) | Faculty Glyphic | 400 | 17.728 / 21.274 px | +0.177 px | `#2B0D16` |

### 2.3 Espaço, grelha, raios, bordas, z-index

| Token / medida | Valor |
|---|---|
| Barra: altura | `68px`; topo `14px`; lados `3vw`; total `82px` |
| Barra: espaçamento CTA | `36px` à direita da barra; `22px` padding direito da zona de ações |
| Células nav | logo `min-width:220px`; links `flex:1`; padding `0 28px 0 22px` |
| §2 contentor | `max-width:1640px`; padding `112px 3vw 26px` |
| §2 cartão | `--card-w:clamp(210px,17vw,310px)`; `--row-h:clamp(540px,…vh…,740px)`; `--drop:row-h*.26`; `--peek:clamp(46px,7vh,84px)` |
| §2 passe | largura `--text-w - 24px` (`clamp(320px,27vw,520px)`); topo `--drop`; fundo fotográfico começa em `--text-w` |
| §3 grid | `minmax(320px,440px) minmax(0,1fr)`; gap `clamp(28px,4vw,48px)`; padding-top `40px` |
| §3 pasta | `min-height:500px`; aba `40px`; bolso `190px` (mobile 160) |
| §3 painel | padding `16px`; gap `10px`; linha `padding:16px 18px`; resposta `margin:0 18px 18px; padding:18px 20px` |
| Herói | stage `min-height:640px; height:100svh`; cubo `clamp(270px,28vw,500px)`; gap JS `72px` |
| Raio barra | `14px` |
| Raio face do cubo | `14px` (imagem `10px`) |
| Raio tickets do herói | `14px`; CTA `999px`; chips `50%`; balão `22px 22px 22px 6px` |
| Raio passe §2 | `56px` |
| Raio pasta | frente `22px 22px 26px 26px`; silhueta `≈26px` + aba `14px` |
| Raio painel/linha/resposta FAQ | `24px` / `14px` / `10px` |
| Bordas | `1.5px solid dark` (barra, pasta, painel); `1.5px` divisórias `hsla(white,.3)`; contornos 2–2.5px nos tickets |
| z-index | header `10`; stage `1`; cubo `2`; intro/chips `5`; título §2 `3`; frente da pasta `3`; overlay do roll `999`; passe voador `998` |

### 2.4 Tokens CSS (bloco de referência)

```css
:root{
  --white-hsl: 38.18,100%,97.84%;
  --black-hsl: 342,53.57%,10.98%;
  --accent-hsl: 344.31,55.56%,22.94%;
  --lightAccent-hsl: 350.77,53.06%,80.78%;
  --darkAccent-hsl: 340.47,58.9%,14.31%;
  --heading-font: "Faculty Glyphic";
  --body-font: "Faculty Glyphic";
  --label-font: "Geist";

  --nh-h:68px; --nh-float-y:14px; --nh-float-x:3vw;
  --nh-r:14px; --nh-cell:28px; --nh-bite:20px; --nh-btn-gap:36px;
  --nh-line:1.5px solid var(--nh-edge);
  --nh-bg: color-mix(in srgb, hsl(var(--lightAccent-hsl)) 36%, hsl(var(--white-hsl)));

  --depth: 0 2px 4px hsla(var(--darkAccent-hsl),.16),
           0 16.2px 36px -12.6px hsla(var(--darkAccent-hsl),.55);
  --spring: cubic-bezier(.22,1,.36,1);
  --pop: cubic-bezier(.34,1.56,.64,1);
}
```

---

## 3. Estrutura e layout

### 3.1 Árvore semântica (página original)

```
<body>
  <div id="siteWrapper">
    <header id="header">               ← fixed, barra flutuante
    <main role="main" id="page">
      <article id="page-regions">
        <section class="region">
          §1 section#novule-cube   (data-section-theme="white")
          §2 section#novule-hero   (data-section-theme="bright-inverse")
          §3 section#novule-faq    (data-section-theme="bright-inverse")
        </section>
      </article>
    </main>
    <footer id="footer-sections">      ← fora do escopo
  </div>
</body>
```

Todas as três secções são `user-items-list-section` (lista Squarespace) transformadas em runtime por JS. O `<ul class="user-items-list-item-container user-items-list-simple">` continua no DOM com os dados originais (5 itens na §1, 3 na §2, 4 na §3) e serve de fonte.

### 3.2 Secção 1 — Herói 3D (`#novule-cube`)

**Função:** provar o produto com um objeto tangível: um cubo que roda, com rostos/palavras, tickets laterais e chips de seleção.

**Layout:** `section` full-bleed. A base CSS do stage é `height:100svh; min-height:640px`, mas o script usa `FIT_HEIGHT:true` e encolhe a secção ao conteúdo: a 1440×900 mede **668 px**. JS remove o conteúdo Squarespace para fora do ecrã (`.fb-ready > .content-wrapper` em `clip`) e injeta:

```
.fb-stage
 ├─ .fb-mid.cs-photo.can-speak.has-say   [role=button, tabindex=0, aria-label]
 │   ├─ .fb-floor                       (sombra elíptica)
 │   ├─ .fb-cube                        (preserve-3d; tampa ::before; tapete ::after)
 │   │   ├─ .fb-fc ×4                   (frente/trás/esq/dir; img + <em>idioma</em> + .fb-shade)
 │   └─ button.fb-say                   (ícone de play + "Say it" + palavra + waveform)
 ├─ p.fb-side.fb-left  > span.x3w > span.x3.blush > 29× .ly + .ln + .lf + .sz
 ├─ p.fb-side.fb-right > idem
 ├─ a.fb-cap                          (nome + "Your X tutor" + seta) — oculto a 1440
 ├─ .fb-intro  > h2.fb-head + .fb-tip + .fb-row > a.fb-btn
 ├─ .fb-meta   > b.fb-ml + .fb-m1 + .fb-m2
 └─ .fb-dots   > button ×4 (ES/PT/IT/FR)
```

**Geometria medida (1440×900):**

| Elemento | x | y | w | h |
|---|---:|---:|---:|---:|
| stage | 0 | 0 | 1425 | 668 |
| `.fb-mid` | 511 | 168 | **403** | **464** |
| tickets esq/dir | 81 / 1117 | 301 | 227 (bbox 3D) | 78 |
| `.fb-intro` | 58 | 474 | 487 | 178 |
| `.fb-meta` | 1201 | 449 | 166 | 41 |
| `.fb-dots` | 1159 | 606 | 208 | 46 |

Cubo: `--fb-cube = clamp(270px,28vw,500px)` → 403.19 px; altura `1.15×` = 463.67 px. Perspectiva 1500 px, `perspective-origin:50% 40%`. Face: 403×464, raio 14, contorno interior 2.5 px. Chão: 685×34, `blur(10px)`. `GAP=72px` (JS) abaixo do header.

**Tickets laterais:** pseudo-elementos 274×133 com raio 14, contorno 2.5 px + sombra `7px 7px`, recortes circulares de 14 px a 58 % da altura (radial-gradients) e linha de perfuração a 44.5–46 px. Esquerda: fundo rosa, label «in English»; direita: fundo vinho, label «your first word». Rotações: esquerda `rotateY(24°)`, direita `rotateY(-24°)`, com sway de ±8°.

**Chips:** 46×46, raio 50 %, fundo creme, contorno 2 px + sombra `3px 3px`; ativo: fundo vinho, texto creme. Estado inicial: idioma do browser (ou `?hello=xx`).

### 3.3 Secção 2 — «Spotlight» / boarding passes (`#novule-hero`)

**Função:** apresentar três ofertas como cartões de embarque que se expandem.

**Layout desktop (≥1024):** `ul` flex, `height:--row-h` (740 máx.), 3 itens. Sem hover: o último (`:last-child`) fica `flex:1` (791 px), os outros `flex:0 0 245`; as imagens dos colapsados sobem `--drop − --peek`, a do aberto fica à direita (`left:--text-w`). Com hover: o item apontado expande, o resto colapsa (`flex .6s var(--spring)`).

| Medida 1440×900 | Valor |
|---|---|
| Secção | 827 px de altura |
| `ul` | 1339×663; gap 22; padding `0 14px 14px 0` |
| Cartão aberto | 791×648.8 |
| Passe | 364.8×476.5; topo **172.33** (= `row-h*.26`); raio 56 |
| Fotografia | 402.2×648.8; começa em x = 388.8 |
| Faixa do passe | 72 px (rosa) + corpo vinho |
| Grelha do texto | 3 colunas × (98 / 236.6 / 46.1 / 95.8) px |

**Conteúdo do passe (item aberto):** `p1` eyebrow + idioma, `p2` código `EN → ES` (avião em SVG), `h2` título, `p3` “Included” (oculto em desktop), `p4..p6` features (com labels `Included/Plus/And` via `::before`), `p7` saudação num selo creme absoluto.

**Mobile (`–1023px`):** `overflow-x:auto`, `scroll-snap-type:x mandatory`, cartões `flex:0 0 326px`, gap 10, `perspective:900px`, padding lateral `calc((100vw - 326px)/2)`, margem `0 -6vw`. O script centra o cartão do meio. Em Chromium com `animation-timeline: view()` aplica `clPassFlow` (flip `±22°` + scale .9→1) e um véu `clPassShade`; sem suporte, fica estático.

### 3.4 Secção 3 — Folder FAQ (`#novule-faq`)

**Função:** FAQ dentro de uma pasta de arquivo; o passe aberto “voa” para o bolso.

**Layout (≥900):**

| Medida 1440×900 | Valor |
|---|---|
| Secção | 648 px |
| `.ff` | 1425×540; grid `440px 879px`; gap 40.96; padding-top 40 |
| `.ff-fold` | 440×500 (+40 de aba acima) |
| `.ff-front` | 440×190 (`top:100% - 190px`) |
| `.ff-items` | 879×500; padding 16; gap 10 |
| Linha | 879×? raio 14; altura definida pelo conteúdo |
| Resposta aberta | grid `0fr → 1fr` |

A silhueta da pasta é recortada por `clip-path:path()` gerado em JS (aba de 40 px, raio 26, canto de aba 10). A frente tem contorno 1.5 px + sombra 7/9 e linha tracejada interna a 13 px; o “?” é uma peça blob 1.45em com contorno 2 px + sombra 3/4.

Nota de alinhamento: o script copia `paddingLeft/Right` e `marginLeft/Right` do `ul` original para `.ff`. A 1440 isso dá **29 px** de recuo lateral (fold em x=29; painel termina em 1396). O clone deve usar a mesma margem do contentor da secção (não hardcodar 29).

**Mobile (≤900):** uma coluna; pasta `max-width:440px`, `min-height:520px`; painel `margin-top:12px`. A 390 px: `grid 327px`, pasta 520, painel 453, secção 1160.

### 3.5 Breakpoints reais

| Largura | O que muda |
|---|---|
| `≤380px` | §2: `--m-photo:190px`, `--m-card:78vw` |
| `≤640px` | §3: padding-top 44; bolso 160; painel 12; linha 12; tiles 24×34; resposta 12/16 |
| `≤767px` | nav: `--nh-float-y:10px`, `--nh-float-x:12px`; herói: cubo `min(54vw,290px)`, headline 30 px no topo 112, tickets e cap ocultos, “Say it” vira barra full-width, meta/chips/CTA absolutos; §2 continua o modo scroll-snap |
| `768–900px` | tickets do herói visíveis; §3 ainda 1 coluna até 900 |
| `901–1023px` | §3 2 colunas; §2 ainda scroll-snap; roll/flight desligados |
| `≥1024px` | §2 accordion; CUBE ROLL; FOLDER FAQ flight; título §2 em 2 extremos |
| `1024–1279px` | §2: texto do passe em 1 coluna de grelha (regra específica) |
| `≥1280px` | layout completo medido |

JS: `MIN_WIDTH = 1024` para roll e flight; `max-width:767px` para o modo mobile do herói; `prefers-reduced-motion` desliga auto-avanço, flips, roll e flight.

---

## 4. Componentes e estados

| Componente | Default | Hover | Focus | Active / atual | Disabled |
|---|---|---|---|---|---|
| Barra de nav | creme-rosa `#F7E1E0`, contorno 1.5, raio 14, sombra alta; células divididas; mordidas de 20 px | fundo `mix(light 62%, white)` | outline nativo do browser (não estilizado) | página atual: fundo vinho, texto creme; última célula sem divisória | — |
| CTA nav (“Start Your Lessons”) | pílula vinho 52 px, padding `0 70 0 28`, texto creme, contorno 2.5 + sombra 4/5 | pebble roda −30°; resto igual | nativo | — | — |
| Pebble do CTA | 60×60, blob 58/42/46/54, seta SVG, `nhWob 6s infinite alternate` | `transform:rotate(-30deg)` | — | — | — |
| Link nav | 16 px/600 | fundo rosa | nativo | — | — |
| Cubo | 4 faces, contorno, sombras, chão radial, bob 6 px | cursor grab; tilt segue rato | role=button, `tabindex=0`; sem outline visível (falha) | face ativa com shade 0–.55 | — |
| Tickets de palavra | 274×133, raio 14, recortes | — | — | troca de palavra com fade `.out` (240 ms) | — |
| Chips | 46×46 contorno 2 + sombra 3/3 | sobe 3 px | nativo | vinho/creme | — |
| Balão “Say it” | creme, raio 22/22/22/6, contorno 2 + sombra 4/4, waveform | — | nativo | `speaking` (pulso) | — |
| Botão herói | 205×58, pílula vinho, padding `0 64 0 28`, pebble rosa 48 px | pebble roda −35° | nativo | — | — |
| Cartão §2 (colapsado) | fotografia, label vertical, sombra, raio 0 | expande (`flex:1`) | — | aberto: passe + foto | — |
| Passe §2 | raio 56, faixa rosa 72 px, contorno 7/9, código 60.48 px | — | — | — | — |
| Linha FAQ | fundo `#451321`, raio 14, LED 11 px | fundo mais claro | `outline:2px solid var(--ff-rose); outline-offset:-4px` | aberta: LED rosa + glow; resposta expande | — |
| Pasta | silhueta rosa recortada, frente blush 190 px, contorno 1.5 + sombra 7/9 | — | — | cartão da capa `opacity 0→1` | — |
| Tiles 01–04 | 30×42, raio 6, vinho escuro, número rosa | — | — | flip 3D ao abrir | — |
| Formulário newsletter | fora do escopo | — | — | — | — |

Não existem estados `disabled` nos componentes destas três secções: todos os controlos são accionáveis. O original também não define `:disabled`; logo, o clone não deve inventar um.

---

## 5. Comportamento e interação

### 5.1 Inventário de animações

| Efeito | Gatilho | Duração / easing / delay |
|---|---|---|
| Entrada da barra | load | sombra estática; sem animação |
| Hover nav | hover | `background-color .2s ease` |
| Pebble CTA | loop | `nhWob 6s ease-in-out infinite alternate`; hover `rotate(−30deg) .45s cubic-bezier(.34,1.56,.64,1)` |
| Cubo: auto-avanço | timer | 90° a cada **3 000 ms** |
| Cubo: snap | fim de drag | mola `v += ((T−A)*60 − v*11)*dt`; impulso `clamp(v,−900,900)*.18`; passo 90° |
| Cubo: tilt | pointermove | interpolação `k = min(1, dt*5)`; ±18° Y, ±10° X |
| Cubo: bob | loop | `sin(t*1.3)*6px` |
| Cubo: scroll | scroll | `p = clamp(−top/(h*.85),0,1)`; scale `1−p*.45`; opacidade `1.4−p*1.2` |
| Cubo: troca de palavra | passo | fade + troca a **240 ms**; classes `out/sw` |
| Cubo: “aterrar” | passo | `stLand .55s ease-out`; tickets `stPop .5s var(--pop)` |
| §2: expansão | hover | `flex .6s cubic-bezier(.22,1,.36,1)`; delays `.12s`/`.4s` |
| §2: entrada do conteúdo | estado aberto | `rise .5s var(--spring)` delays `.45/.5/.55/.6/.65s`; saudação `popIn .6s` |
| §2: avião | loop (aberto) | `tpFly 2.6s ease-in-out .9s infinite alternate` |
| §2 mobile | scroll | `clPassFlow`/`clPassShade` via `view()` (Chromium) |
| CUBE ROLL | scroll §1→§2 | `p` contínuo; lift `0–.1`; roll `.04–.6`; unfold `.62–.98`; `io`/`out`; delays `.18/0/.04/.1` |
| FAQ: abrir | click | `grid-template-rows .5s cubic-bezier(.22,1,.36,1)` |
| FAQ: tiles | abrir | `ffFlap .5s cubic-bezier(.3,.7,.4,1)`, stagger 90 ms |
| FAQ: palavras | abrir | `ffWord .5s` por palavra, stagger 70 ms (desligado por `WORD_FLIP=false`) |
| FAQ: voo | scroll | `p=(vh−foldTop)/(vh*.6)`; voo `io(p/.62)`; flip `0.46→180°`; fade `.57`; arco 80 px; `perspective(1400px)` |
| FAQ: LED | aberto | `background .4s`, `box-shadow .4s` |

### 5.2 Lógica do motor do cubo (spec replicável)

1. **Dados:** cada `li` → `{img, name, lang, code, greet, say, pron, sub}`. O título da secção fornece pares `EN = XX`; para cada tutor procura o par cujo lado direito coincide com `greet` (normalizado), senão usa `say` («means X»), senão cicla.
2. **Estado:** `A` (ângulo atual), `T` (alvo), `v` (velocidade). Passo = `round(−A/90)`.
3. **Render:** `rotateY(A + REST_ANGLE + tx*18 + p*50)`; `rotateX(−6 − ty*10)`; `translateZ(−W/2)`; faces a `i*90°`, `translateZ(W/2)`. Shade `clamp((1−cos a)*.32,0,.55)`; classes `away` (cos<.05) e `side` (cos<.8).
4. **Drag:** `dA = dx*180/max(300, W*2.2)`; velocidade média entre amostras; ao soltar, projeta `v*.18` e arredonda a 90°.
5. **Tap:** deslocamento <6 px e <400 ms → fala a palavra; senão, snap.
6. **Teclado:** ←/→ passo; Enter/Espaço fala.
7. **Chips:** salto pelo caminho mais curto (`d = mod(i−cur, n)`, ajuste se `>n/2`).
8. **Fala:** `SpeechSynthesisUtterance` com `lang=code`, `rate=.9`, primeira voz com prefixo do idioma; timeout de 2.5 s para limpar `speaking`.
9. **Scroll:** `p` como acima; reduce `scale/opacity`; semáforo `IntersectionObserver` e `visibilitychange` para parar o rAF.
10. **Mobile:** `--fb-cube:min(54vw,290px)`; `mid.top = 186px + cube*.72`; headline estático a 112 px; tickets e cap ocultos.

### 5.3 CUBE ROLL (transição §1→§2)

- Ativo só com `innerWidth ≥ 1024`, sem `prefers-reduced-motion`, e fora do editor.
- Copia o DOM do passe aberto para um ator `position:fixed` (`z-index:999`, `perspective:1700px`), com os pseudo-elementos materializados numa `<style>` gerada.
- Cubo: `S0 = min(cubeW,cubeH)*.86`; `S1 = clamp(.9*passW, 260, 360)`; razão do passe limita a profundidade; posição interpola do centro do cubo até ao centro do passe, com clamp para não sair do viewport.
- Abertura: 5 peças (lid + L/T/R/B) voam para as 3 fotografias e para a palavra em `<strong>` do título; `B` fica oculta («yours.»).
- Termina em `p ≥ .985` e esconde o ator; reaparece se `p < .02`. Movimento real do rato sobre a secção “aterra” imediatamente (para o hover funcionar).

### 5.4 FOLDER FAQ

- Constrói a pasta, o painel e as linhas a partir da lista; `OPEN_FIRST=true`, `ONE_AT_A_TIME=true`.
- Cada botão tem `aria-expanded`, `aria-controls`, `role=region` na resposta; a pergunta visível é decorativa (`aria-hidden`), o nome acessível vem do `aria-label`.
- `flipWords` gira os tiles e (se ativo) as palavras.
- Voo: o passe do cartão aberto (ou do último, ou do hover) é clonado para `body`; interpola posição/tamanho/rotação e aplica `clip-path` de pasta; ao aterrar, a fotografia aparece no bolso (`opacity`).
- Sem voo: a pasta mostra já o cartão (`up`).

---

## 6. Assets

| Asset | URL base (Squarespace CDN) | Natural | Exibido | Uso |
|---|---|---:|---:|---|
| Sofía | `…/1791154560620-8NM2MOTH3MQSSEW0VP4H/Asset-5.webp` | 1000×1384 | 308×308 (cubo) | face do cubo + capa |
| Cece | `…/1791154560690-5NQX3QM2GIRRKRH6PQVY/Asset-6.webp` | 1000×1384 | 100×382 | face do cubo |
| Connor | `…/1791154560634-9QWZE5JIAUT3KWM9RMUM/Asset-2.webp` | 1000×1384 | 346×353 | face do cubo |
| Amélie | `…/1791154560641-YC26CR1ETZYZN6LUHG3Y/Asset-4.webp` | 1000×1384 | 137×362 | face do cubo |
| §2 foto 1 | `…/1791154560690-…/Asset-6.webp` | 1439×1992 | 245×539 | cartão FR |
| §2 foto 2 | `…/1791154563513-QUQGG3G96NST5JRRIUKP/Asset-2.webp` | 1439×1992 | 245×539 | cartão IT |
| §2 foto 3 | `…/1791154560603-493QEY85JEPTWMCJQL6E/Asset-5.webp` | 1439×1992 | 402×649 | cartão ES (aberto) |
| Fundo footer | `…/8d64dde8-…/common-tongue-laptop-woman.jpg` | 1425×? | 1425×478 | fora do escopo |
| Favicon | `…/3bd4cf0e-4dd8-4f55-a60c-80c228328b27/favicon.ico` | — | — | separador |
| OG image | **ausente** | — | — | — |

Parâmetros de recorte: cubo `object-fit:cover; object-position:50% 22%`; §2 `50% 26%`; pasta FAQ `50% 22%`. URLs com `?format=1000w` (cubo) e `?format=2500w` (§2).

**Fontes:** os `.woff2` vêm de `file.squarespace-cdn.com/.../fonts/libraries/sqsp/assets/…` (Faculty Glyphic 400 latin-ext; Geist 500/600/700). Nenhum vídeo, Lottie ou sprite.

---

## 7. Dados e rede

- **Não existe API de conteúdo.** Os dados vivem no HTML e os scripts derivam-nos do DOM; o “modelo” é a lista Squarespace. Para o clone, modelar em TypeScript (§9.4).
- **Rede:** CSS/JS do Squarespace, fontes, 8 imagens de conteúdo, reCAPTCHA Enterprise. Nenhum `fetch`/XHR de conteúdo observado; `performance` só lista recursos estáticos.
- **Formulário newsletter (fora do escopo):** `action="/"`, `method="post"`, campo `email` — backend Squarespace `[NÃO DETERMINADO]`.
- **CTAs** apontam para `#`, `/#bookpackage`, `/about`, `/services`, `/contact`, Instagram/Facebook; os destinos de checkout não foram inspecionados (fora do escopo).
- **Conteúdo textual:** ver tabelas seguintes.

### 7.1 Texto — §1

- Título da lista (pares): `Sun = Sol, Hey = Ehi, Yes = Oui`
- Itens (nome · idioma · palavra · significado · botão):
  1. Sofía · Spanish · Sol · means sun · “Meet Sofía”
  2. Cece · Portuguese · Mãe · means Mum · “Meet Cece”
  3. Connor · Italian · Ehi · means hey · “Meet Connor”
  4. Amélie · French · Oui · means yes · “Meet Amélie”
  5. (sem imagem) “Learn it from a person, not an app.” · botão “Click Here”
- Headline injetada: “Learn it from a person, not an app.” · dica “Tap the cube to hear it” · CTA da secção “Meet your tutor”
- Meta: “Your first word” / “Mãe · means Mum” / “Portuguese, with Cece”
- Aria do cubo: `Hear {palavra}, {nome}, {idioma} tutor`; chips `Spanish/Portuguese/Italian/French`.

### 7.2 Texto — §2

| Cartão | Eyebrow | Código | Título | Features | Saudação |
|---|---|---|---|---|---|
| 1 | Boarding pass · Français | EN → FR | French for work | 1:1 native tutor / Business vocab / Online or in person | Bonjour ! |
| 2 | Boarding pass · Italiano | EN → IT | Italian for travel | Two week intensive / Culture sessions / Certificate | Ciao! |
| 3 (aberto) | Boarding pass · Español | EN → ES | Spanish from zero | Beginner friendly / Group of 5 / Weekly practice | ¡Hola! |

Título da secção: `Pick a voice.` + `Find yours.` (dividido no primeiro «. »). Etiquetas de features geradas por CSS: `Included` / `Plus` / `And`.

### 7.3 Texto — §3

| # | Pergunta | Resposta |
|---|---|---|
| 01 | Do I need any experience to start? | None at all. Your first lesson starts from hello. Your tutor finds your level in the first ten minutes and builds from there. |
| 02 | Are the lessons with a real person? | Always. Every lesson is one to one, live on video, with the same tutor each week. No bots, no pre-recorded videos. |
| 03 | How soon can I hold a conversation? | Most learners manage a simple ten minute chat after eight to ten lessons. We focus on speaking from day one. |
| 04 | What does it cost? | Lessons start from £28. Your first one is free, so you can meet your tutor before you decide. |

Título: “Got questions?” + **“Answered.”** (o `strong` vira sublinhado de marcador).

---

## 8. Acessibilidade e SEO

| Item | Original | Observação |
|---|---|---|
| `lang` | `en-GB` | — |
| Title | `Common Language` | sem sufixo de página |
| Meta description | **vazia** | defeito |
| OG/Twitter | `og:site_name`, `og:title`, `og:url`, `og:type=website`, `twitter:card=summary`, `twitter:title/url`; **sem imagem** | partilha fraca |
| Canonical | `https://classe.squarespace.com/` | — |
| H1 | **não existe** | defeito de SEO/estrutura |
| Hierarquia | h2 ×15 (títulos das listas, itens, headline, FAQ), h3 “LANGUAGE”, h2 “Subscribe” | — |
| Landmarks | `header#header`, `nav` ×3 (2 desktop + mobile), `main#page[role=main]`, `section`s sem `aria-label`, `footer` | — |
| Alt | 4 imagens de lista descritivas (`Sofía, Spanish tutor at Common Language`, …); cópias geradas `alt=""` | duplicado decorativo |
| ARIA cubo | `role=button`, `tabindex=0`, `aria-label` dinâmico; setas/Enter/Espaço | sem `aria-live` para a mudança |
| ARIA chips | `button aria-label` do idioma | estado ativo só visual |
| ARIA FAQ | `button aria-expanded/aria-controls/aria-label`; resposta `role=region`; pergunta visual `aria-hidden` | bom |
| Foco | skip link «Skip to Content» primeiro; sem `:focus-visible` estilizado em vários componentes | contraste/visibilidade a melhorar |
| Movimento | `prefers-reduced-motion` desliga auto, bob, roll, flight, flips | bom |
| Contraste | todos os pares principais ≥7:1 | — |
| Gate de conteúdo | o carregamento esconde a lista 4 s até o script estar pronto (`fbShow 0s 4s`) | risco de conteúdo invisível se o JS falhar |

---

## 9. Adaptação Sparkle.do (decisão, não extração)

### 9.1 Marca e assets

- **Uso:** monograma `Sd` na barra (altura 40 px) + wordmark; logo completo no footer/large; estrela como motivo gráfico (nunca como ícone de UI pequeno sem contraste).
- **Assets existentes:** `public/sparkle-do_logo_completo_sem_fundo.png` (698×559) e `public/sparkle-do_SD_lapis_sem_fundo.png` (558×358). Exportar `wordmark` sem tagline e favicon a partir do monograma.
- **Cores medidas na logo:** tinta `#4E1E2A` (mediana `#4F1D29`), faceta `#74243C`, estrela `#F0D0C8`, traço claro `#FCFCFC`, sombra `#361218`.

### 9.2 Paleta adaptada (papéis preservados)

| Papel (original) | Original | Sparkle | Contraste |
|---|---|---|---|
| fundo | `#FFFBF4` | `#FFFBF4` (mantém) | — |
| texto | `#2B0D16` | `#361218` (sombra medida na logo) | 16.2:1 |
| vinho / CTA / títulos | `#5B1A2B` | `#4E1E2A` (tinta da logo) | 13.2:1 |
| rosa / destaque | `#E8B4BC` | `#F0D0C8` (estrela da logo) | 9.4:1 sobre vinho |
| profundo / contornos | `#3A0F1D` | `#2A0C13` (tom derivado de `#361218`, escurecido) | 17.5:1 |
| barra / bolso | `#F7E1E0` | `#FAECE4` | 14.5:1 |
| linha FAQ | `#451321` | `#36121A` | — |
| tile | `#290A14` | `#1D080D` | — |
| capa da pasta | `#E1D8D4` | `#DFD7D2` | — |

`#4E1E2A`, `#74243C`, `#F0D0C8`, `#361218` e `#FFFBF4` foram amostrados da logo; `#2A0C13` é o único tom derivado (sombra/contorno).

### 9.3 Tipografia

Manter **Faculty Glyphic** (display + corpo) e **Geist** (micro-labels/CTA) para preservar a voz da referência; a wordmark da logo fica como imagem. Substituir apenas `--font-display` se a marca adoptar um serif próprio. Licenças OFL (Google Fonts) — verificar antes de publicar.

### 9.4 Conteúdo e modelo

```ts
// src/data/site.ts
export type Sample = {            // 4 faces do cubo
  id: string; name: string; field: string; word: string;
  caption: string; cover: string; href: string;
};
export type Format = {            // 3 passes da §2
  eyebrow: string; from: string; to: string; title: string;
  included: [string, string, string]; greeting: string; cover: string;
};
export type Faq = { q: string; a: string };
export type Page = { headline: string; hint: string; cta: string; samples: Sample[]; formats: Format[]; faqs: Faq[] };
```

**Copy proposta (EN, a validar):**

- Nav: logo · `Showcase 01` · `Formats 02` · `FAQ 03` · CTA `Make yours`.
- Herói: headline **“A portfolio that looks like you, not a template.”**; dica “Drag the card. Tap a face to preview.”; CTA “Make yours”; meta “Your first card” / “Folio · ready to share” / “Portfolio, with Studio”; chips `PH / DS / DV / WR` (Photography, Design, Development, Writing); tickets `before → CV` e `after → Folio`.
- §2: título **“Pick a format. Find yours.”**; passes:
  1. `Boarding pass · One-pager` · `YOU → WEB` · “The one-pager” · One page / 3 projects / Share card · “Hello.”
  2. `Boarding pass · Casebook` · `YOU → DEEP` · “The casebook” · Case studies / Process notes / Client proof · “Voilà.”
  3. `Boarding pass · Full kit` · `YOU → ALL` · “The whole kit” · Site + card / Print PDF / Custom domain · “Sparkle!”
- FAQ: título “Got questions?” + **“Answered.”**; perguntas:
  1. “Do I need to design anything myself?”
  2. “Can I use my own photos and writing?”
  3. “Does it work for any profession?”
  4. “What do I actually get?”
  Respostas: sem preços nem prazos inventados; descrever o portfólio publicado, o cartão imprimível (PDF) e o cartão partilhável. Marcar como `[A CONFIRMAR]` qualquer promessa de tempo/limite.

### 9.5 O que muda vs. o original

| Mantém | Muda |
|---|---|
| Geometria, grelha, breakpoints, z-index, raios, sombras, timings | paleta (papéis iguais, valores da marca) |
| Motor do cubo (drag/tap/teclado/auto/chips/scroll) | TTS “Say it” → “Preview” (sem vozes do SO) |
| Passe/boarding-pass e transição CUBE ROLL | fotos de tutores → capas de portfólios próprias |
| Pasta + acordeão + voo | FAQ genérica de portfólio |
| Barra perfurada com mordidas e CTA-pebble | logo Sparkle; numerais 01–03 mantidos |
| Chips 46 px e labels de 13 px | conteúdo de 4 profissões |

### 9.6 Correções obrigatórias no clone

1. Adicionar `<h1>` (headline do herói) e um h2 por secção.
2. `alt` descritivo nas 4 capas e nas 3 fotos da §2 (não deixar `alt=""` em conteúdo informativo).
3. `aria-live="polite"` para a palavra/nome ativos do cubo.
4. `:focus-visible` visível (2 px, `outline-offset`) em links, botões, chips, cubo e linhas FAQ.
5. Remover a dependência de conteúdo invisível por 4 s: render estático já pronto; JS só melhora.
6. Metadados: `description`, OG image 1200×630, `twitter:card=summary_large_image`.
7. `scroll-margin-top: calc(var(--nh-h) + var(--nh-float-y) + 8px)` nas âncoras.
8. Pausar o cubo fora do viewport e com `document.hidden` (o original já faz; manter).

---

## 10. `[NÃO DETERMINADO]`

| Item | Porquê |
|---|---|
| Nome comercial do template (só o ID `5c5a519771c10ba3470d8101`) | metadados não expõem o nome |
| Resposta/validação do POST da newsletter | backend Squarespace, fora do escopo |
| Analytics server-side | nenhum cliente detetado |
| Uso real da fonte Archivo 800–900 | carregada; não aplicada nas §1–§3 |
| Versões semver dos bundles Squarespace | nomes com hash |
| Vozes TTS disponíveis por SO | depende do sistema; não observável |
| Destino de `/#bookpackage` e checkout | fora do escopo |
| Autoria/intenção de `--sel-bg` (marcas de canto) | apenas CSS; sem comentário |
| Suporte a touch do drag no iOS | só `pointer*` observado; sem teste em iOS |
