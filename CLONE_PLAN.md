# CLONE_PLAN — Plano de implementação (Sparkle.do)

> **Nota de migração (2026-11-03):** a implementação foi migrada de Astro para **Next.js 16 (App Router, React 19)**. A stack e as pastas em §1–§2 são o plano original; a estrutura atual está em `src/app`, `src/components/*.tsx` e `PROGRESS.md` (Revisão 5).

Base: `CLONE_SPEC.md`. Alvo: landing de 3 secções (herói 3D, passes de formato, FAQ em pasta), com a identidade Sparkle.do e conteúdo do produto. Sem footer. Sem backend de geração nesta fase.

---

## 1. Stack recomendada

**Astro 5 + TypeScript + CSS puro + módulos TS vanilla. Zero framework de UI. Sem bibliotecas de animação.**

| Escolha | Justificação |
|---|---|
| **Astro** (output estático) | Reproduz o modelo real do original: HTML completo no servidor, CSS estático e pequenos scripts. Zero runtime no cliente por omissão; ilhas só onde há interação. Melhor LCP/SEO do que uma SPA para uma landing. |
| **TypeScript** | O motor do cubo, o roll e o FAQ têm estado e matemática; tipos evitam regressões. |
| **CSS puro + custom properties** | O original é 100% CSS (sem Tailwind). Tokens, `color-mix`, `clip-path`, 3D e `@media` são nativos; qualquer framework só acrescentaria ruído. |
| **Sem React/Vue/Svelte** | Não há estado de UI partilhado; três módulos imperativos chegam. Se o gerador (app) precisar de React, entra depois como ilha em `/app`. |
| **Sem GSAP/Three/Framer** | O original não usa; CSS 3D + rAF reproduz com menos peso. O cubo é matemática simples (§5.2 da spec). |
| **Playwright** (dev) | Verificação visual e medições automáticas contra os números da spec. |

**Alternativa próxima** (se Astro for indesejado): Vite + TS + HTML estático. Nunca reimplementar em Squarespace (proprietário, sem controlo de código).

### 1.1 Dependências

```bash
# raiz do repositório
npm init -y
npm i astro
npm i -D typescript @astrojs/check playwright
npx playwright install chromium
```

`package.json` (scripts):

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "shots": "node scripts/shots.mjs"
  }
}
```

**Fontes:** começar com Google Fonts (`Faculty+Glyphic`, `Geist:wght@500;600;700`) — ambas verificadas (HTTP 200) e OFL. Para performance/CLS, self-host: descarregar os `.woff2` latin/latin-ext do CSS do Google Fonts e servir de `/public/fonts` com `font-display:swap`, `preload` do peso 400 e fallback com `size-adjust`. Não usar as URLs da Squarespace.

**Sem dependências de runtime.**

---

## 2. Estrutura de pastas

```
sparkle.do/
├─ CLONE_SPEC.md
├─ CLONE_PLAN.md
├─ astro.config.mjs
├─ tsconfig.json
├─ package.json
├─ public/
│  ├─ brand/
│  │  ├─ sparkle-wordmark.png        # exportar sem tagline
│  │  ├─ sparkle-monogram.png        # Sd
│  │  └─ favicon.ico                 # do monograma
│  ├─ img/
│  │  ├─ covers/face-01…face-04.webp # 1000×1384  (cubo)
│  │  ├─ covers/pass-01…pass-03.webp # 1439×1992  (§2)
│  │  └─ og-1200x630.jpg
│  └─ fonts/                          # se self-host
├─ src/
│  ├─ pages/index.astro
│  ├─ layouts/Base.astro              # <head>, fontes, tokens, scripts
│  ├─ components/
│  │  ├─ SiteHeader.astro             # barra perfurada
│  │  ├─ HeroCube.astro               # §1 (markup estático + data-*)
│  │  ├─ FormatTickets.astro          # §2
│  │  ├─ FaqFolder.astro              # §3
│  │  └─ ui/
│  │     ├─ PebbleArrow.astro
│  │     └─ Ticket.astro
│  ├─ scripts/
│  │  ├─ cube.ts                      # rotação/drag/tap/chips/scroll
│  │  ├─ roll.ts                      # transição §1→§2
│  │  ├─ faq.ts                       # acordeão + voo
│  │  └─ header.ts                    # altura/âncoras/estado
│  ├─ styles/
│  │  ├─ tokens.css                   # paleta Sparkle + roles
│  │  ├─ base.css                     # reset, tipografia, utilitários
│  │  ├─ header.css
│  │  ├─ hero.css
│  │  ├─ tickets.css
│  │  └─ faq.css
│  └─ data/
│     └─ site.ts                      # Sample[] / Format[] / Faq[]
└─ scripts/
   └─ shots.mjs                       # Playwright: 1440/1024/390 + diffs
```

Regra: nenhum estilo dentro de componentes; tudo em `styles/*.css` importado no layout, para manter a cascata previsível (o original tem 6 camadas concorrentes — não repetir isso).

---

## 3. Ordem de implementação

Cada etapa termina com uma verificação objetiva. **Não avançar com medições fora da tolerância (≤ 8 px / ΔE ≤ 2).**

### Etapa 0 — Assets da marca e das capas
**Objetivo:** ter todos os ficheiros finais antes do CSS.
**Ficheiros:** `public/brand/*`, `public/img/covers/*`, `public/img/og-1200x630.jpg`.
**Tarefas:** exportar wordmark sem tagline e monograma (do PNG mestre); criar 4 capas 1000×1384 (rosto/obra no terço superior; recorte seguro em `object-position:50% 22%`); 3 capas 1439×1992 (foco `50% 26%`); favicon; OG.
**Critério:** `file`/`identify` confirma dimensões; nenhuma imagem da Squarespace no repo.

### Etapa 1 — Setup + tokens + tipografia
**Objetivo:** base visual mensurável.
**Ficheiros:** `astro.config.mjs`, `tsconfig.json`, `src/layouts/Base.astro`, `src/styles/tokens.css`, `base.css`.
**Tarefas:** paleta Sparkle da §9.2; `--nh-*`, `--fb-*`, `--ff-*`; `box-sizing`; `body` 17.728/1.2, tracking .01em; fontes com `preload`; `scroll-behavior:smooth`; `scroll-margin-top`.
**Critério:** `getComputedStyle(body).backgroundColor === "rgb(255, 251, 244)"`; Faculty Glyphic `document.fonts.check('16px "Faculty Glyphic"')` true; sem CLS visível no load.

### Etapa 2 — Barra de navegação
**Objetivo:** barra flutuante com mordidas, células numeradas e CTA-pebble.
**Ficheiros:** `components/SiteHeader.astro`, `styles/header.css`, `scripts/header.ts`.
**Tarefas:** `position:fixed`; `padding:14px 3vw 0`; barra 68 px/raio 14/contorno 1.5; logo `min-width:220`; links flex com `::after` «01»; mordidas de 20 px com `clip-path`; CTA 52 px + pebble 60 px + `nhWob`; variante ≤767.
**Critério:** a 1440×900, `.header-inner` = 1339×68 em (43,14); a 390×844 = 351×68 em (12,10); links com hover; CTA navega.

### Etapa 3 — Estrutura das 3 secções + âncoras
**Objetivo:** esqueleto semântico e alturas-base.
**Ficheiros:** `pages/index.astro`, `Base.astro`.
**Tarefas:** `<main>` com 3 `<section id="showcase|formats|faq">`; `<h1>` no herói; `<h2>` por secção; `data-theme`; espaçadores.
**Critério:** outline de headings válido (1 h1, 3 h2); âncoras param abaixo da barra.

### Etapa 4 — Herói estático
**Objetivo:** composição exata sem movimento.
**Ficheiros:** `HeroCube.astro`, `styles/hero.css`.
**Tarefas:** stage 100svh/mín 640; cubo 403×464 a 1440; 4 faces com `object-fit:cover` + `object-position:50% 22%`; chão radial; tickets 274×133 com recortes; intro; meta; chips 46; balão “Preview”.
**Critério:** a 1440, `.cube` mid 403×464; tickets 274×133 (sem rotação, medir o pseudo); intro em (58,474) 487×178; meta 166×41 em (1201,449); chips 208×46.

### Etapa 5 — Motor do cubo
**Objetivo:** comportamento fiel (§5.2 da spec).
**Ficheiros:** `scripts/cube.ts`.
**Tarefas:** estado A/T/v; render `rotateY(rest+tx*18+p*50)`, `rotateX(-6-ty*10)`; snap 90°; auto 3 s; drag com inércia; tap (<6 px/<400 ms) → preview; ←/→/Enter/Espaço; chips com caminho mais curto; scroll shrink `.45`; IntersectionObserver; reduced motion; troca de palavra a 240 ms; `aria-live`.
**Critério:** rodar 90° por gesto/3 s; clique numa face muda palavra/nome/meta; teclado funciona; com `reduce` não há auto nem bob; CPU parada fora do viewport.

### Etapa 6 — Secção 2 estática + acordeão
**Objetivo:** passes e expansão.
**Ficheiros:** `FormatTickets.astro`, `styles/tickets.css`, `scripts/tickets.ts` (só centro mobile).
**Tarefas:** `ul` flex; aberto por omissão o 3.º; hover expande; passe `::before` (gradiente rosa 72 px + vinho), raio 56; `::after` sombra 7/9; features com `Included/Plus/And`; selo da saudação; vertical label; mobile scroll-snap + centrar o meio.
**Critério:** a 1440, aberto 791×648.8, passe 364.8×476.5 em y=172.3, foto 402.2; a 1024, cartões 210/210/470; a 390, cartões 326 e `scroll-snap-type:x mandatory`; hover troca o aberto em 600 ms.

### Etapa 7 — CUBE ROLL (§1→§2)
**Objetivo:** o passe “nasce” do cubo e aterra na secção 2.
**Ficheiros:** `scripts/roll.ts`, `styles/tickets.css` (`.cr-*`).
**Tarefas:** markup estático duplicado do passe (não clonar estilos em runtime); ator `fixed` z 999, `perspective:1700`; `p` do scroll; S0/S1; posição com clamp; abrir em 5 peças com delays; esconder em `p≥.985`; desligar em `<1024`, reduce e editor; `document.fonts.ready` → remedir.
**Critério:** a 1440, a meio do percurso o passe está visível e centrado; não sai do viewport; a 390 não existe ator no DOM visível; com reduce o layout fica estático e correto.

### Etapa 8 — Pasta FAQ estática
**Objetivo:** pasta + painel + linhas.
**Ficheiros:** `FaqFolder.astro`, `styles/faq.css`, `scripts/faq.ts`.
**Tarefas:** `clip-path:path()` calculado (aba 40, raio 26); frente 190; painel 24 px; linhas 14; tiles 30×42; LED; respostas com `grid-template-rows`.
**Critério:** a 1440, grid `440 + 879` gap 40.96, fold 500, frente 190; a 390, coluna 327, fold 520, painel 453; abrir/fechar mantém 1 aberta.

### Etapa 9 — Voo do passe para a pasta
**Objetivo:** transição §2→§3.
**Ficheiros:** `scripts/faq.ts`.
**Tarefas:** clonar/duplicar o passe do formato aberto; interpolar posição/tamanho/rotação; `clip-path` de pasta; fade da foto; fallback estático.
**Critério:** a 1440, ao entrar na FAQ o passe atravessa e aterra no bolso; ao subir, reverte; a 390/`reduce`, nenhum overlay.

### Etapa 10 — Responsividade fina
**Objetivo:** 1024 e 390 idênticos à spec; 768–1023 estável.
**Ficheiros:** todos os CSS.
**Tarefas:** herói mobile (cubo `min(54vw,290)`, headline 30 no topo 112, tickets/cap ocultos, “Preview” em barra, meta/chips/CTA absolutos); §2 mobile; FAQ 1 coluna ≤900; nav mobile; `≤380` e `≤640` conforme tabela.
**Critério:** medições da §3.5 da spec dentro de ±8 px; sem overflow horizontal; sem scroll horizontal indesejado.

### Etapa 11 — Acessibilidade + SEO
**Objetivo:** fechar as lacunas da §8/§9.6.
**Ficheiros:** componentes, `Base.astro`.
**Tarefas:** `h1`; alt descritivo; `aria-live` no cubo; `:focus-visible` 2 px; `aria-expanded/controls/region`; skip link; `prefers-reduced-motion`; meta description, OG/Twitter + imagem 1200×630; `scroll-margin-top`.
**Critério:** navegação só por teclado percorre todo o fluxo com foco visível; axe sem erros críticos; Lighthouse a11y/SEO ≥ 95.

### Etapa 12 — Performance + polimento
**Objetivo:** remover jank e peso.
**Tarefas:** `srcset/sizes` nas capas, `loading="lazy"` abaixo da dobra, `decoding="async"`; `font-display` + preload; rAF só visível; `will-change` temporário; `content-visibility` nas secções 2–3; reduzir o custo do roll (sem `getBoundingClientRect` por frame além do necessário).
**Critério:** 60 fps no drag; LCP < 2.5 s em 4G simulada; sem layout shift > 0.1.

### Etapa 13 — Verificação visual e checklist
**Objetivo:** provar fidelidade.
**Ficheiros:** `scripts/shots.mjs`.
**Tarefas:** screenshots a 1440×900, 1024×900, 390×844 (topo, §2, §3, estados abertos); medir os elementos-alvo; comparar com a tabela da §6.
**Critério:** checklist da §6 toda verde.

---

## 4. Riscos e partes difíceis

| Risco | Impacto | Mitigação |
|---|---|---|
| **3D flattening** (`filter`, `overflow`, `opacity` em pais de `preserve-3d`) | cubo/tickets deixam de ter profundidade | Nunca aplicar `filter`/`overflow:hidden` no elemento com `preserve-3d`; usar wrappers; testar Chrome+Safari |
| **Cópia de estilos em runtime** (técnica do original para o roll) | frágil, pesada, quebra com CSS novo | Duplicar o markup do passe no HTML; duplicar só geometria por `getBoundingClientRect` |
| **Scroll-driven sem biblioteca** | jank, saltos ao redimensionar | medir por frame com `rAF`; cache de alvos; invalidar em `resize`+`fonts.ready`; parar fora do viewport |
| **`animation-timeline: view()`** | só Chromium | `@supports` + fallback estático; nunca depender dela para conteúdo |
| **Fotos da referência** | copyright | usar capas próprias/dos clientes com licença; nunca hotlink para a CDN Squarespace |
| **Código Novule** | proprietário | reimplementar a partir da spec (matemática documentada), sem copiar os scripts |
| **TTS “Say it”** | vozes variam por SO; pode falhar silenciosamente | trocar por “Preview” (abre a capa) ou áudio pré-gravado opcional |
| **Fontes** | CLS/FOUC | `preload` do woff2 400; `size-adjust` no fallback; self-host |
| **Copy mais longa** | quebra de 2 linhas do headline / overflow do passe | `text-wrap:balance`, limites de caracteres no conteúdo, testes a 390 |
| **Fixed header + âncoras** | âncoras escondidas sob a barra | `scroll-margin-top` = `--nh-h + --nh-float-y + 8px` |
| **`color-mix`, `svh`, `rotate` individual** | browsers antigos | fallback hex para cada mix; `height:100vh` antes de `100svh`; `transform` completo se necessário |
| **Acessibilidade do cubo** | `role=button` num div, foco invisível | usar `<button>` invisível sobreposto ou `role=button` + `tabindex` + `:focus-visible`; `aria-live` |
| **Overlays z 998/999 + header 10** | sobreposição errada, cliques bloqueados | `pointer-events:none` nos overlays; `display:none` quando inativos |
| **Reduced motion** | movimento indesejado | gate em todas as 4 animações; testar com a media query forçada |

**Partes que podem ser cortadas sem perder a identidade** (por ordem): voo da FAQ → roll → flips das palavras do FAQ. O cubo, a barra e os passes são intocáveis.

---

## 5. Checklist de fidelidade

Medições a 1440×900, 1024×900 e 390×844; tolerância ±8 px, cores ΔE ≤ 2, timings ±10%.

### 5.1 Barra

- [ ] `.header-inner`: 1339×68 em (43,14) a 1440; 948×68 em (31,14) a 1024; 351×68 em (12,10) a 390.
- [ ] Raio 14, contorno 1.5, sombra `--nh-lift`; fundo `#FAECE4` (Sparkle).
- [ ] Logo `min-width:220`; links flex; numerais 01–03 a 11 px monospace, op .55.
- [ ] Mordidas: 20 px, metade fora da barra, fundo da página, contorno 1.5; última célula sem mordida.
- [ ] CTA 52 px, pílula 999, contorno 2.5 + sombra 4/5; pebble 60 px com wobble 6 s; hover −30°.
- [ ] Página atual: fundo vinho, texto creme.

### 5.2 Herói

- [ ] Stage 100svh, mín. 640; a 1440 mede 668.
- [ ] Cubo 403×464 a 1440; 297×318 a 1024; 211×242 a 390.
- [ ] Faces raio 14, contorno interior 2.5, imagem contorno 2; `object-position:50% 22%`.
- [ ] Chão 685×34, `blur(10px)`, gradiente `hsla(dark,.32)→transparent`.
- [ ] Tickets 274×133, raio 14, recortes 14 px a 58 %, perfuração a 44.5–46 px; labels 13/600.
- [ ] Headline 31.68/33.58; dica 13/0.6; botão 205×58; meta 166×41; chips 46.
- [ ] Mobile: headline 30 no topo 112; tickets e cap ausentes; meta/ chips /CTA nas posições da §3.5.
- [ ] Cubo: auto 3 s, snap 90°, drag com inércia, tap → preview, ←/→/Enter/Espaço, chips, scroll shrink .45.
- [ ] Com `reduce`: sem auto, sem bob, sem sway; conteúdo correto.

### 5.3 Secção 2

- [ ] `ul` 1339×663; gap 22; aberto 791×648.8; colapsados 245.
- [ ] Passe 364.8×476.5 em y=172.33; raio 56; faixa 72; contorno 7/9.
- [ ] Código 60.48/800; eyebrow 12/2.4; features 11.84/.355; saudação 25.6 com selo creme.
- [ ] Labels `Included/Plus/And` por CSS; avião em `tpFly`.
- [ ] Hover troca o aberto em 600 ms com delays de entrada.
- [ ] A 1024: 210/210/470; a 390: 326, snap, meio centrado.
- [ ] Roll ativo só ≥1024; desaparece em `<1024` e `reduce`.

### 5.4 Secção 3

- [ ] Grid 440 + 879, gap 40.96; fold 440×500; frente 440×190; painel 879×500.
- [ ] `clip-path` de pasta com aba 40, raio 26; contorno 1.5 + sombra 7/9.
- [ ] Linhas 14, LED 11, tiles 30×42/6; pergunta 20/500; resposta 16/24.8.
- [ ] Abrir: `.5s cubic-bezier(.22,1,.36,1)`; tiles com stagger 90 ms; só uma aberta.
- [ ] Voo ativo ≥1024; estático caso contrário; reverte ao subir.
- [ ] A 390: coluna 327, fold 520, painel 453, secção ≈1160.

### 5.5 Transversal

- [ ] Cores da §9.2 (ΔE ≤ 2) e contraste ≥ 7:1 nos textos principais.
- [ ] Nenhuma imagem, fonte ou script carregado de `squarespace.com`/`sqspcdn.com`.
- [ ] Teclado: skip → nav → CTA → cubo → preview → CTA herói → chips → passes → FAQ; foco sempre visível.
- [ ] `aria-live` anuncia a face ativa; `aria-expanded` correto nas FAQ.
- [ ] 1 h1, 3 h2, ordem de headings válida; meta description e OG image presentes.
- [ ] Sem scroll horizontal; sem CLS > 0.1; 60 fps no drag.
- [ ] `prefers-reduced-motion`: nenhuma animação automática; layout completo.

---

## 6. Fora do escopo (explícito)

- Geração real de portfólios, cartões, PDFs e publicação — produto separado.
- Footer/newsletter, checkout, autenticação, analytics.
- Backend, base de dados, domínios personalizados.
- Conteúdo da referência (fotos, textos de idiomas): substituído pelo conteúdo Sparkle.
