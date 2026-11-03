export type Format = {
  id: string;
  eyebrow: string;
  from: string;
  to: string;
  title: string;
  included: [string, string, string];
  greeting: string;
  cover: string;
};

export type Faq = { q: string; a: string };

export const site = {
  name: "Sparkle.do",
  tagline: "Portfólios e cartões de visita automáticos",
  title: "Sparkle.do — Portfólios e cartões de visita automáticos",
  description:
    "O Sparkle.do transforma o seu trabalho em portfólio, cartão de visita pronto para imprimir e cartão compartilhável. Escolha um formato, adicione o seu trabalho e publique.",
  url: "https://sparkle.do",
};

export const formats: Format[] = [
  {
    id: "one-pager",
    eyebrow: "Passe de embarque · Página única",
    from: "EU",
    to: "WEB",
    title: "A página única",
    included: ["Uma página", "3 projetos", "Cartão compartilhável"],
    greeting: "Olá.",
    cover: "/img/covers/pass-01.webp",
  },
  {
    id: "casebook",
    eyebrow: "Passe de embarque · Caderno",
    from: "EU",
    to: "CASO",
    title: "O caderno",
    included: ["Estudos de caso", "Notas de processo", "Prova social"],
    greeting: "Pronto.",
    cover: "/img/covers/pass-02.webp",
  },
  {
    id: "full-kit",
    eyebrow: "Passe de embarque · Kit completo",
    from: "EU",
    to: "TUDO",
    title: "O kit completo",
    included: ["Site + cartão", "PDF impresso", "Domínio próprio"],
    greeting: "Brilho!",
    cover: "/img/covers/pass-03.webp",
  },
];

export const faqs: Faq[] = [
  {
    q: "Preciso desenhar alguma coisa?",
    a: "<p>Não. Escolha um formato, adicione o seu trabalho e o layout faz o resto. Você pode ajustar tipografia e cor depois.</p>",
  },
  {
    q: "Posso usar minhas próprias fotos e textos?",
    a: "<p>Sim. Suas imagens e textos são seus. O portfólio, o cartão e a imagem de compartilhamento usam o mesmo conjunto.</p>",
  },
  {
    q: "Funciona para qualquer profissão?",
    a: "<p>Foi feito para trabalhos visuais e escritos: fotografia, design, desenvolvimento, escrita, ilustração, arquitetura e música.</p>",
  },
  {
    q: "O que eu recebo, na prática?",
    a: "<p>Um portfólio no ar, um cartão de visita pronto para imprimir em PDF e um cartão compartilhável. Os três usam a mesma capa e tipografia.</p>",
  },
];

export type Work = {
  src: string;
  category: string;
  alt: string;
};

export const works: Work[] = [
  { src: "/img/work/work-01.webp", category: "Abstrato", alt: "Estudo abstrato em violeta e pérola" },
  { src: "/img/work/work-02.webp", category: "Objetos", alt: "Pratos de cerâmica empilhados sobre madeira" },
  { src: "/img/work/work-03.webp", category: "Espaços", alt: "Arquitetura angular em vidro e pedra" },
  { src: "/img/work/work-04.webp", category: "Interiores", alt: "Uma luminária contra uma parede verde suave" },
  { src: "/img/work/work-05.webp", category: "Editorial", alt: "Uma estante de livros organizados por cor" },
  { src: "/img/work/work-06.webp", category: "Fotografia", alt: "Uma estrada vazia entre rochas vermelhas" },
  { src: "/img/work/work-07.webp", category: "Objetos", alt: "Um banco de madeira clara sobre piso azul" },
  { src: "/img/work/work-08.webp", category: "Gradiente", alt: "Um gradiente suave de azul, laranja e rosa" },
];

export type Step = {
  n: string;
  title: string;
  body: string;
};

export const steps: Step[] = [
  {
    n: "01",
    title: "Traga o trabalho",
    body: "Solte imagens, textos e links. O layout entende a forma do conjunto e começa a compor.",
  },
  {
    n: "02",
    title: "Escolha o formato",
    body: "Página única, caderno ou kit completo. Mude de ideia depois; nada fica travado.",
  },
  {
    n: "03",
    title: "Publique e imprima",
    body: "Um portfólio no ar, um cartão de visita pronto para imprimir e uma imagem de compartilhamento, tudo a partir da mesma capa.",
  },
];
