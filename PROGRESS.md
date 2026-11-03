# PROGRESS — execução do CLONE_PLAN

Registo da implementação do clone Sparkle.do (secções 1–3) a partir de `CLONE_SPEC.md`.
Data: 2026-11-03. Branch: working tree local.

## Ambiente e dependências

- Node 24.22.1 · npm 11.19.1 · Astro **7.4.5** · TypeScript 6.0.3 · @astrojs/check 0.9.12 · Playwright 1.64.1.
- Instalado exatamente o previsto no plano (`astro`, `typescript`, `@astrojs/check`, `playwright`). Playwright usa o Chrome do sistema (`channel: "chrome"`); nenhum browser foi descarregado.
- Fontes self-hosted em `public/fonts` (Faculty Glyphic 400 e Geist 500–700, OFL, obtidas do Google Fonts). Nenhuma dependência de fontes em runtime.
- Sem bibliotecas de animação/UI adicionais.
- Não existem chamadas de API no clone (conteúdo estático); nada foi mockado porque a referência também não expõe endpoints de conteúdo.

## Etapas

| # | Etapa | Estado | Verificação |
|---|---|---|---|
| 0 | Assets | ✅ | `file`/dimensões: 4 capas 1000×1384, 3 capas 1439×1992, favicon 256/64, OG 1200×630. Logos oficiais usados; capas são **placeholders gerados** (ver desvios). |
| 1 | Setup + tokens | ✅ | `astro check`: 0 erros/0 avisos. Fontes locais carregam; `body` = `#FFFBF4`, 17.728 px. |
| 2 | Barra | ✅ | 1440: 1339×68 em (43,14); 1024: 948×68 em (31,14); 390: 351×68 em (12,10). Mordidas de 20 px, CTA 52 px + pebble 60 px. |
| 3 | Estrutura | ✅ | 1 `h1`, 2 `h2` visíveis + 1 `h2` sr-only, 3 `section` com âncoras e `scroll-margin-top`. |
| 4 | Herói estático | ✅ | 1440: cubo 403×464 em (511,168); intro 487×177 em (58,474); meta em (1190,449) 192×41; chips 208×46 em y=606. |
| 5 | Motor do cubo | ✅ | Auto 3 s, snap 90°, drag/inércia, tap avança 1 passo (testado: Sol→Form→Loop), setas/Enter/Espaço, chips, shrink no scroll, `prefers-reduced-motion` desliga auto. |
| 6 | Secção 2 | ✅ | 1440: lista 1339×663; aberto 791×648,8; passe 365×476 em y=172,3; hover troca o aberto (600 ms). 1024: 210/210/470. 390: 326 px, scroll-snap, cartões centrados no meio. |
| 7 | CUBE ROLL | ⚠️ | Voo do passe com geometria viva (`getBoundingClientRect` por frame), desligado <1024 e com reduced motion. **Simplificado**: não reproduz a abertura em 5 abas do original; o ator tem frente de passe + features e voa para o passe real. |
| 8 | Pasta FAQ | ✅ | 1440: grid 440+879 gap 40,96; pasta 440×500; frente 440×190. 1024: 440+487, 500. 390: 327×520, frente 160. `clip-path` de pasta gerado (aba 40, raio 26). |
| 9 | Voo FAQ | ✅ | Passe/photo com `clip-path` de pasta, flip 180°, fade; desligado <1024/reduced. Ao aterrar, a capa fica no bolso. |
| 10 | Responsividade | ✅ | 1440/1024/390 sem overflow horizontal; alturas: 668/827/648 em 1440 (= original); 640/817/617 em 1024 (original 640/815/617); 844/640/1135 em 390 (original 844/640/1160). |
| 11 | A11y + SEO | ✅ | `h1`/`h2`, alt, `aria-expanded/controls/region`, `aria-live` no cubo, chips `aria-pressed`, `:focus-visible` (skip link visível a 12 px), meta description/OG/Twitter, favicon. |
| 12 | Performance | ✅ | Capas com `loading`/`decoding`; fontes preload; rAF parado fora do viewport/aba oculta; `will-change` só durante o movimento. |
| 13 | Verificação | ✅ | `npm run build` (astro check incluído) sem erros/avisos; consola limpa; `node scripts/shots.mjs` gera 9 capturas + `shots/metrics.json`. |

## Medições finais (comparação com a spec)

| Elemento | 1440 | 1024 | 390 |
|---|---|---|---|
| Barra (`.header-row`) | 1339×68 | 948×68 | 351×68 |
| Herói | 668 | 640 | 844 |
| Cubo | 403×464 | 297×318 | 211×242 |
| Intro | 487×177 | 346×157 | — (headline absoluto) |
| Passe §2 | 365×476 | 296×485 | 326×274 (fluxo) |
| Pasta | 440×500 | 440×500 | 327×520 |
| Frente | 440×190 | 440×190 | 327×160 |
| Painel FAQ | 879×500 | 487×500 | 327×476 |

Alturas de secção: 1440 **668/827/648** (original idêntico); 1024 **640/817/617** (+2 px na §2); 390 **844/640/1135** (−25 px na §3, por copy mais longa).

## Verificações executadas

- `npx astro check` → 0 errors, 0 warnings, 1 hint informativo.
- `npm run build` → 1 página estática, sem avisos.
- Consola (Chrome): 0 erros, 0 logs de erro.
- Teclado: skip link → nav → CTAs → cubo (hit) → chips → FAQ. FAQ abre com Enter; foco visível.
- Menu mobile: abre/fecha, `aria-expanded` correto, fecha com Escape.
- `prefers-reduced-motion`: sem auto-avanço do cubo, sem roll/voo; conteúdo estático correto.
- Sem overflow horizontal em 1440/1024/390.

## Desvios assumidos

1. **Assets**: as fotografias da referência têm copyright; foram substituídas por capas geradas (placeholders) nas dimensões exatas. A identidade oficial (`public/sparkle-do_*`) é usada no header/favicon/OG.
2. **Conteúdo**: copy adaptada ao produto (Sparkle), incluindo formatos, amostras e FAQ. As promessas de tempo/preço foram evitadas; qualquer alegação comercial fica `[A CONFIRMAR]`.
3. **Voz ("Say it")**: o botão de som foi **removido** a pedido; tocar no cubo continua a avançar a amostra. Sem TTS.
4. **CUBE ROLL**: voo do passe fiel na posição/escala/rotação, mas sem a abertura em 5 abas (lid + 4 faces) do original. O ator usa sempre o formato por omissão (Full kit), não o cartão em hover.
5. **FAQ flight**: implementado com flip e recorte de pasta; não replica a micro-orquestração de `fade` por frame do original.
6. **Cabeçalho**: a largura das células é consequência da logo Sparkle (monograma + wordmark) e do texto do CTA; o total da barra/CTA é 1339 px a 1440, mas a divisão interna difere da referência.
7. **Meta do herói**: 192×41 vs 166×41 por copy mais longa (“Photography, with Ava Moreau”).
8. **FAQ mobile**: 1135 px vs 1160 (painel 476 vs 453) por respostas mais longas.
9. **Astro 7** em vez da versão do plano (instalou a atual); API usada é estável e o build passa.

## `[NÃO DETERMINADO]` que permanecem

- Nome comercial do template Squarespace original (só o ID).
- Resposta real do backend da newsletter (fora do escopo; não implementada).
- Vozes TTS por SO (funcionalidade substituída).
- Destino/checkout de `#bookpackage` (fora do escopo).
- Métricas de analytics server-side do original.
- Equivalência exata da orquestração do roll original (o código fonte não foi copiado; reimplementação própria).


## Revisão 2 — pedidos do cliente

- **Imagens**: substituídos os placeholders por fotografias do **Unsplash** (licença Unsplash), descarregadas localmente e recortadas nas dimensões exatas:
  - 4 retratos 1000×1384: `photo-1494790108377-be9c29b29330`, `photo-1500648767791-00dcc994a43e`, `photo-1534528741775-53994a69daeb`, `photo-1506794778202-cad84cf45f1d`.
  - 3 capas de trabalho 1439×1992: `photo-1558655146-9f40138edfeb`, `photo-1517180102446-f3ece451e9d8`, `photo-1455390582262-044cdead277a`.
  - Ficheiros em `public/img/covers/`; OG mantém a logo. Sem hotlink em runtime.
- **Botão de som**: removido do herói (markup, CSS e JS). O espaço inferior foi reequilibrado no mobile (meta/chips/CTA subiram ~40 px).
- **Cubo 3D**: topo vinho com gradiente e bevel, moldura interior nas faces, **sombreamento por face** calculado pelo ângulo (`(1−cos)·0.32`, 0–0.55), tapete com bordo mais fino e sombra projetada; retratos reais.
- **Tickets**: frases em português com pares por amostra — “Automático?” / “Crie rápido”, “Dinâmico” / “Elegante”, “Portfólio” / “Cartão”, “Seu trabalho” / “No ar”. Tamanho de letra medido por `scrollWidth` (28–46 px, área útil de 220 px); tickets de 300 px em ≥1024, margem de 32 px para não atravessar a perfuração; labels “portfólio” / “cartão”.
- **Verificação**: `astro check` 0 erros/0 avisos; build estático; consola sem erros; screenshots atualizados em `shots/`.
- **Nota de licença**: as fotos Unsplash não exigem atribuição, mas os IDs ficam registados acima. Se houver imagens reais de clientes/projetos, substituir os ficheiros e atualizar `src/data/site.ts` se necessário.

## Revisão 3 — novas secções, footer, áudio e PT-BR

### Secções novas (originais, não clonadas)
- **§4 `#how` — Como funciona**: grelha editorial + pilha 3D “sticky” (folha de portfólio, cartão de visita e cartão de partilha) que abre com o scroll; passos 01–03 com trilho de progresso e estados ativos. Texto em PT-BR.
- **§5 `#work` — Estudos de portfólio**: duas marquesinas contínuas em sentidos opostos, 8 imagens de trabalho (não pessoas), pausa no hover, cartões com categoria/índice e CTA “Escolher formato”. Em `prefers-reduced-motion`, a marquesina para e torna-se scroll horizontal sem barra.
- **Footer original**: ticket creme com o wordmark, CTA “Criar o meu”, colunas Explorar/Contato/Som, dados de contacto, botão de som, “Voltar ao topo” e marquesina tipográfica “Portfólios ✦ Cartões”.
- Animações: reveal por IntersectionObserver (`data-reveal`), fan/sticky do `#how` por scroll, marquesinas CSS; `prefers-reduced-motion` respeitado.

### Áudio
- Ficheiro do projeto movido para `public/audio/ambient.webm` (4,0 MB, 222,9 s, loop).
- `audio.loop = true`, volume 0.32; tentativa de autoplay no load; se o browser bloquear, arranca no primeiro `pointerdown`/`keydown`/`scroll`; pausa ao esconder o separador e retoma ao voltar; botão “Som” no footer com `aria-pressed` e equalizador.
- Verificado em Chrome: após interação, `paused=false`, `currentTime≈8,7 s`, botão “Som ligado”. O autoplay inicial é bloqueado por política do browser (não é um bug); o botão do footer e o primeiro toque resolvem.
- Nota: o ficheiro é WebM; Chrome/Firefox reproduzem, Safari pode não. Sem ffmpeg no ambiente para gerar MP3 alternativo.

### PT-BR e contactos
- `html lang="pt-BR"`, título/description/OG, navegação, herói, passes, FAQ, como funciona, galeria, footer, ARIA e alts traduzidos.
- Contactos no footer (links clicáveis): **gcristovao262@gmail.com**, **gabscoder@gmail.com**, **+244 939 287 887** (`mailto:`/`tel:`).
- CTAs diferenciados para eliminar a repetição de “Make yours”:
  - header: “Começar”
  - herói: “Ver formatos”
  - galeria: “Escolher formato”
  - footer: “Criar o meu”
- “template” substituído por “modelo”; “Loop” por “Ciclo”; restantes siglas (PDF, FAQ, web) mantidas.

### Imagens
- 8 imagens de trabalho (não pessoas), Unsplash, guardadas em `public/img/work/` a 900×1200:
  `photo-1549490349-8643362247b5`, `photo-1578749556568-bc2c40e68b61`, `photo-1487958449943-2429e8be8625`, `photo-1494438639946-1ebd1d20bf85`, `photo-1524578271613-d550eacf6090`, `photo-1500530855697-b586d89ba3ee`, `photo-1503602642458-232111445657`, `photo-1550859492-d5da9d8e45f3`.
- Licença Unsplash; sem hotlink em runtime; substituir por trabalhos reais quando houver.

### Verificação
- `astro check`: 0 erros / 0 avisos; build estático.
- Consola: 0 erros.
- Medições: desktop scrollH 5640, `#how` 1205, `#work` 1516, footer 750; mobile 6563, 1433/1341/1136.
- Testado com Playwright: animação normal (`reduce=false`), marquesina a correr, reveals, sticky do `#how` (top 124 ao fixar), progresso 0.52/0.81 e passos 02/03; sem overflow horizontal.
- `scripts/shots.mjs` atualizado para capturar herói, formatos, FAQ, como funciona, galeria e footer nos 3 viewports.

## Revisão 4 — marquesinas sem salto

- **Causa**: cada track tinha duas cópias dos cards mas um único `gap` entre elas; `translateX(-50%)` deslocava metade do track *incluindo metade desse gap*, pelo que o seam caía no espaço vazio e o primeiro card repetido entrava de repente.
- **Correção**: cada cópia passou a ser um `.marquee-group` com o gap final incluído (`padding-right`) e o track ficou com `gap: 0`. Assim cada grupo mede exatamente 1408 px a 1440, o track 2816 px, e `translate3d(-50%,0,0)` desloca exatamente um grupo — o segundo grupo começa onde o primeiro estava.
- Aplicado às duas filas da galeria e à marquesina do footer. Mantidos pausa no hover, `linear` e `will-change: transform`; com `prefers-reduced-motion` continua como scroll horizontal estático.
- Verificado: grupos 1408/1408 px, track 2816 px, capturas no seam sem espaço branco; build/check OK.

## Revisão 5 — migração para Next.js

- **Stack atual**: Next.js **16.4.4** (App Router, Turbopack), React **19.3.1**, TypeScript. Astro removido (`astro`, `@astrojs/check`, `astro.config.mjs`, `src/pages`, `src/layouts`, `src/components/*.astro`, `.astro`, `dist`).
- **Estrutura**:
  - `src/app/layout.tsx` — `<html lang="pt-BR">`, metadata (title/description/OG/Twitter/icons), imports dos CSS e shell (`SiteHeader`, `main`, `SiteFooter`, `ClientRuntime`).
  - `src/app/page.tsx` — as 5 secções.
  - `src/components/*.tsx` — markup convertido para React server components.
  - `src/styles/*` e `src/scripts/*` — inalterados (CSS e módulos DOM).
- **Interação**: um único `ClientRuntime` (`"use client"`) chama, depois da hidratação, `initHeader`, `initCube`, `initTickets`, `initRoll`, `initFaq`, `initHow`, `initAudio` e `initReveal`. Guarda `booted` evita duplicação com o Strict Mode. Não há estado React a competir com as transformações imperativas do cubo/FAQ/roll.
- **Metadata**: via Metadata API do Next (canonical, OG/Twitter com imagem 1200×630, favicons). Fontes continuam self-hosted por `@font-face` em `public/fonts`; imagens continuam `<img>` simples para preservar o layout exato.
- **Build**: `next build` → rota `/` estática (○), sem erros de TypeScript nem de hidratação. `next start` serve a build.
- **Medições Next** (`shots/metrics.json`): desktop scrollH 5610 (668/827/648/1205/1486/776); tablet 5228 (640/817/617/1160/1245/750); mobile 6511 (844/640/1170/1433/1311/1113); sem overflow horizontal em nenhum viewport.
- **Porta**: os scripts usam **3100** (`next dev`/`next start`) porque a porta 3000 está ocupada por outro projeto local. `scripts/shots.mjs` também usa 3100 por omissão (`BASE_URL` para outra).
- **Verificação**:
  - Sem erros de consola/hidratação.
  - A 1440 o herói/§2/§3 mantêm as medidas e o aspecto do Astro (captura lado a lado idêntica).
  - Chips e tickets mudam (“Dinâmico/Elegante”), FAQ abre/fecha, `#how` faz fan/sticky, marquesinas com grupos 1408/2816 px, áudio inicia no primeiro gesto e alterna no botão, menu mobile e scroll-snap dos passes funcionam.
  - Sem overflow horizontal a 1440/1024/390.
- **Correção incluída**: o mapeamento das faces do cubo passou a ser fixo (`face k → dados[k]`). Assim a face que está à frente corresponde sempre ao nome/idioma mostrados na meta (antes podia mostrar o item seguinte durante a rotação).
- **Nota**: a página é server-rendered e a interação é um bootstrap imperativo único; é a migração mais fiel e de menor risco. Uma refatoração futura pode dividir cada secção em client components, se necessário.

### Nota de hidratação
- O aviso `cz-shortcut-listen="true"` no `<body>` é injetado pela extensão **ColorZilla** antes da hidratação, não pelo código. `suppressHydrationWarning` foi adicionado a `<html>` e `<body>` em `src/app/layout.tsx` para ignorar atributos injetados por extensões; o resto da árvore continua a ser verificado.

## Revisão 6 — novo herói: o lápis

- **Removido** o herói anterior (cubo 3D, tickets de palavras, meta, chips, “Say it”) e todo o código associado: `HeroCube.tsx`, `cube.ts`, `roll.ts`, o ator do CUBE ROLL em `FormatTickets`, os estilos `.roll-*`, os tokens `--cube`/`--ticket-*` e o array `samples`.
- **Novo herói** (`HeroPencil.tsx` + `Pencil.tsx` + `hero.css` + `pencil.ts`):
  - Lápis 3D em CSS: prisma hexagonal, ponta em pirâmide, banda e cápsula; paleta da página.
  - Cartões de portfólio ligeiramente transparentes (obras reais) e emojis a subir/desaparecer no topo.
  - Scroll de 340vh (300vh mobile) com stage sticky: o lápis cresce e roda até à horizontal; a face do lápis transforma-se no fundo peach de ecrã inteiro.
  - Revelação da história: “Faça” com estrela luminosa, “o seu portfólio, com brilho.”, explicação e quatro capacidades com ícones SVG (portfólio, cartão, PDF, link).
  - No fim, o lápis fixa-se à esquerda, ponta para baixo, sobre um cartão-ticket vinho; o conteúdo desloca-se para a direita.
  - Estados por progresso (`--p`, `--fill`) + classes `is-story` / `is-dock`; `initPencil` com `requestAnimationFrame`, resize e `prefers-reduced-motion`.
  - Reduced motion e `<noscript>` mostram diretamente o estado final (lápis à esquerda + história).
- **Responsivo**: nova composição a 1440/1024/390; sem overflow; conteúdo do herói cabe em 100svh no estado final.
- **Verificação**: `next build` sem erros; consola sem erros; fases testadas (fill/story/dock) a 1440 e 390; reduced motion; capturas em `/tmp` e no browser.

## Revisão 7 — três blocos, transições determinísticas e otimização

### Causa dos bugs
- O herói anterior usava um único `is-story` em `p >= 0.46` e transições de **0.85s** no contentor e nos filhos. Num scroll rápido, a classe entrava já perto do fim do sticky: o texto ficava a meio da transição, invisível ou semi-transparente; ao voltar atrás, a transição já tinha terminado, parecendo que “só aparecia depois”.
- O `IntersectionObserver` dos `[data-reveal]` podia perder elementos que entravam e saíam entre frames, deixando secções abaixo com `opacity: 0`.
- O voo da FAQ mantinha um `requestAnimationFrame` contínuo mesmo sem scroll, consumindo frames em toda a página.

### O que mudou
- **Três blocos no painel**, com steps explícitos: `.30` (Faça), `.52` (quatro saídas) e `.70` (próximo portfólio + lápis à esquerda). O painel fica opaco em `.30`; cada bloco entra com `is-active` e transição de **0.2s**; os blocos inativos ficam `visibility: hidden`, sem fantasmas.
- **Controlador do herói** cacheia a altura total no `resize`, usa um único rAF, e só alterna classes (`is-panel`, `is-dock`, `.is-active`); não há transições longas dependentes de thresholds.
- **Reveals** passaram a ser scroll-driven: um rAF verifica todos os `[data-reveal]` pendentes, revela os que já passaram o limite e remove-os da lista. Nenhum elemento fica preso por ter sido saltado.
- **FAQ**: o voo deixou de se auto-agendar em permanência; atualiza apenas em scroll/resize. O accordion mantém-se.
- **Custo do herói**: camadas de abertura (cartões, emojis, lápis, cue) passam a `display: none` quando o painel abre, parando animações infinitas; `will-change` limitado ao lápis; transições de reveal reduzidas de 0.9s para 0.5s.
- **Lápis lapidado**: corpo mais saturado e facetado, brilho especular, ferragem com relevo, banda com “sparkle.do”, ombro vinho, madeira com grão, ponta grafite em gradiente e topo de borracha elíptico. O estado final **não roda 180°**: a ponta já aponta para baixo. O cartão ganhou estrela e legenda.
- **Fallbacks**: reduced motion e `<noscript>` mostram os **três blocos em fluxo vertical**, painel estático, sem lápis animado; a página continua legível e sem overflow.

### Verificação
- `next build` sem erros; consola sem erros.
- Desktop 1440, tablet 1024 e mobile 390: steps 1/2/3, sem overflow, bloco ativo com `opacity: 1` após 250 ms.
- Scroll rápido até `.82`: bloco 3 ativo e opaco; sem texto a meio.
- Todos os `[data-reveal]` ficam `is-in` após percorrer a página.
- Reduced motion: herói estático com os três blocos; no-JS: os três blocos visíveis.
- Produção em `http://localhost:3100`.

### Revisão 7.1 — a ponta única

- **Causa da ponta dividida**: as seis faces triangulares usavam `--tip-tilt: -23deg`, mas o ápice só coincide no centro quando `sin(tilt) = -apothem / (tip - 6)`. Com -23° o ápice ficava em `z ≈ 4.6px`; o `rotateY` de cada face transformava esse z em deslocamentos horizontais diferentes, produzindo duas/quatro pontas.
- A inclinação passou a ser calculada por tamanho: **-26.3°** no herói base, **-27.1°** a 1180, **-25.6°** a 860; no lápis final **-33.3° / -33.7° / -35.8° / -37°**. Assim os seis ápices convergem num único ponto.
- As faces da ponta ficaram **uniformes** (sem alternância de tons, sem linhas internas) e o grafite passou a ser um gradiente da própria face — sem triângulo separado, sem costura nem ponta flutuante.
- A banda deixou de mostrar “SPARKLE.D” cortado; agora tem uma estrela centrada. O lápis final ganhou leve `rotateY/rotateZ` para mostrar facetas; o topo do lápis foi arredondado.
- Verificado em close-up a 1440 e 390: uma única ponta, uma única linha de grafite; `next build` e consola sem erros.

## Revisão 8 — roda, face e scroll com tempo

### Animações
- **Idle**: o lápis roda em torno do próprio eixo (`pencilIdle`, 12s linear) assim que a hero aparece, antes de qualquer gesto.
- **Scroll**: o invólucro exterior do lápis roda em Z de `-26°` até `-90°` (horizontal) durante `p = 0 → 0.30`; a rotação própria continua dentro. O lápis fica visível até quase ao fim da expansão e só então se apaga.
- **Face → painel**: substituí o painel radial por uma **face do lápis** (`--face`) que começa como um retângulo de 46×320 px, atrás do lápis, e cresce até `100vw × 100svh`. O progresso é `ease-in` de `p = 0.12` a `0.30`; assim o lápis gira e fica horizontal antes de a face tomar o ecrã. A face tem borda/raio no início e perde-os no fim; a impressão `sparkle.do` e a estrela aparecem em fade.
- **Painel**: cada capítulo tem entrada escalonada: eyebrow, título e tagline vêm da esquerda; o lede vem da direita; os quatro cartões de capacidade sobem em stagger; o CTA sobe. O cartão final desliza da esquerda e o lápis cresce. O indicador `01 / 02 / 03` faz fade e muda de capítulo.

### Scroll com velocidade limitada
- `initHeroScroll` acumula a intenção de roda/touch/teclado e gasta-a a **400 px/s** enquanto a hero está no ecrã. Um flick de 2400 px atravessa os três capítulos em ~5s em vez de saltar tudo.
- Wheel, trackpad, touch e PageUp/PageDown/setas/espaço são limitados; âncoras (`#formats`, nav) cancelam a animação e o scroll nativo assume. Fora da hero, ou no fim dela, o scroll nativo volta imediatamente.
- Reduced motion ignora o limitador; a scrollbar nativa continua a ser nativa.

### Verificação
- `next build` e consola sem erros.
- Roda de 2400 px: `p` passa por 0.30/0.50/0.72 e ativa os três blocos; rosto/preto; face a 100% em `p=0.30`; conteúdo com `opacity: 1` após as entradas.
- A 1440, 1024 e 390: painéis 01/02/03 sem overflow; progresso ativo correto.
- Touch: swipe controlado; o lápis/face avançam sem salto.
- Reduced motion e no-JS: face estática e três blocos em fluxo; progresso oculto.
- Âncora de navegação cancela o limitador; no fim da hero a roda volta ao scroll nativo.
- Produção em `http://localhost:3100`.

## Revisão 9 — o mundo do lápis

### Fluxo definitivo
- Hero com **420vh** desktop / **390vh** tablet / **380vh** mobile.
- `0 → 0.12`: idle, a rodar sobre o próprio eixo.
- `0.12 → 0.30`: o lápis roda até à horizontal (`rotateZ -90°`), cresce até **~3×** e desloca-se para a esquerda enquanto a face peach cresce.
- `0.30`: a face está em `100vw × 100svh`; o painel está pronto.
- `0.32 / 0.48 / 0.62`: os três capítulos (`Faça`, `Quatro saídas`, `O próximo portfólio`).
- `0.76 → 0.90`: saída do mundo. O painel/face encolhe e faz fade, a história desaparece, o lápis final aparece grande e **diminui** até ao cartão.
- `0.90 → 1`: estado final limpo — cartão com o lápis à esquerda e CTA “Ver formatos” à direita.

### Correções do modelo
- O topo do lápis deixou de ser um tubo vazado: o cap tem disco de topo, núcleo interno e corpo com núcleo; o topo já não mostra o fundo da página.
- O fundo do corpo e a ponta mantêm o núcleo de madeira; o topo do cap é um disco peach fechado.
- O lápis desloca-se lateralmente durante o zoom para que a transição entre o corpo e a face não exponha o interior do topo.

### Scroll
- O controlador limita roda/trackpad/touch/teclado a **430 px/s**; âncoras cancelam a animação; fora da hero o scroll nativo volta.
- O estado final é independente do comprimento do scroll: a hero termina depois do CTA.

### Verificação
- `next build` e consola sem erros.
- Cenas testadas por scroll direto: 0.18, 0.27, 0.40, 0.70, 0.80, 0.86, 0.95.
- 1440 e 390: painéis 1/2/3, saída, cartão final; sem overflow.
- Reduced motion e no-JS: face estática, três blocos, sem cartão/CTA final.
- Wheel/touch/teclado não saltam capítulos; a saída e o cartão final são alcançáveis.
- Produção em `http://localhost:3100`.

## Revisão 10 — o mesmo lápis, a mesma face

### Modelo
- Lápis mais largo e curto: `--side` 56, `--len` 400, `--tip` 90, `--cap` 30 (desktop). O corpo deixou de parecer uma vareta.
- Os três estados de topo/fundo foram fechados: disco de topo do cap, núcleo do cap, núcleo do corpo e núcleo cónico da ponta. O cap é escondido durante o zoom e a saída, por isso o interior nunca aparece no ecrã.
- A face que se torna painel é a **face frontal do próprio corpo**, colocada atrás das faces normais em repouso. Assim o lápis normal mantém a banda e a estrela; durante o mundo só essa face fica visível.

### Fluxo definitivo
- `0 → 0.10`: rotação idle em torno do próprio eixo.
- `0.10 → 0.18`: rotação até à horizontal + crescimento. O `scale` fica baixo durante quase todo o percurso e só dispara no fim, para o lápis ser realmente visto a rodar/crescer antes de o ecrã entrar na face.
- `0.18`: a face frontal (a mesma do modelo) ocupa o ecrã; painel visível.
- `0.18 / 0.40 / 0.60`: os três capítulos.
- `0.76 → 0.90`: saída do mundo. O mesmo lápis reaparece, volta a rodar para a posição final e **diminui** de `scale 28` até `0.65` (desktop) no cartão.
- `0.90 → 1`: estado final: cartão com o lápis e CTA.

### Câmara
- O zoom é a escala real do `.pencil-intro`: 0.78 → 28. A face do corpo é a superfície que preenche; não existe um painel-card separado.
- A rotação idle é pausada quando o mundo começa, para a face escolhida ficar estável durante o zoom.
- Na saída a mesma escala desce e a posição interpola para o centro do cartão; o cartão aparece por trás.

### Verificação
- `next build` e consola sem erros.
- 1440: face a preencher em 0.18; capítulos 1/2/3; saída e cartão final; sem overflow.
- 390: cartão/CTA finais sem overflow.
- Reduced motion e no-JS: painel estático, três blocos, decor visível, sem cartão/CTA.
- Produção em `http://localhost:3100`.

## Revisão 11 — lápis 3D fechado

### Modelo
- O lápis CSS foi substituído por um **modelo Three.js** com geometria fechada:
  - corpo hexagonal `CylinderGeometry(..., 6, 1, false)` — eixos/tampas fechados;
  - ferragem e banda fechadas;
  - borracha em esfera achatada fechada;
  - ponta de madeira em tronco de cone fechado e grafite em cone fechado.
- Não há faces abertas/tubos: o interior nunca é visível. O lápis é o mesmo objeto do idle ao cartão final.
- A luz vem de ambiente + duas direcionais; o material flat shading mostra as seis facetas.

### Câmara e sequência
- `0 → 0.06`: rotação idle sobre o próprio eixo.
- `0.06 → 0.14`: vira para horizontal, sem zoom.
- `0.14 → 0.22`: a câmara aproxima-se (zoom 36) da face frontal; a face transforma-se no fundo peach do painel.
- `0.22 / 0.42 / 0.62`: os três capítulos.
- `0.78 → 0.90`: saída; a câmara afasta-se, o mesmo lápis volta a rodar e **diminui** até ao cartão.
- `0.90 → 1`: cartão + CTA.
- O painel visível a 0.22 coincide com o fundo da face; a transição de texto continua escalonada.

### Ajustes
- O lápis ficou mais fino e comprido (raio 0.30, corpo 4.6), com borracha arredondada; deixou de parecer um tubo/crayon.
- O cartão no mobile foi alinhado pelo centro (`--final-x`), eliminando o corte lateral.
- O lápis final é desenhado pelo mesmo canvas 3D sobre o cartão, com escala calculada pela altura do cartão.

### Verificação
- `next build` e consola sem erros.
- 1440: idle, face a 0.22, capítulos, saída, cartão final; sem overflow.
- 390: painel e cartão/pencil finais sem overflow; cartão centrado.
- Reduced motion e no-JS: painel estático e três blocos, sem canvas.
- Produção em `http://localhost:3100`.
