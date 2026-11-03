import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const OUT = "shots";
const sizes = [
  ["desktop", 1440, 900],
  ["tablet", 1024, 900],
  ["mobile", 390, 844],
];

const metrics = {};

const round = (r) =>
  r && {
    x: Math.round(r.x),
    y: Math.round(r.y),
    w: Math.round(r.width),
    h: Math.round(r.height),
  };

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });

for (const [name, width, height] of sizes) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);

  await page.screenshot({ path: `${OUT}/${name}-hero.png` });

  await page.locator("#formats").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${name}-formats.png` });

  await page.locator("#faq").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${name}-faq.png` });

  await page.locator("#how").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 360));
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${name}-how.png` });

  await page.locator("#work").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${name}-work.png` });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${name}-footer.png` });

  metrics[name] = await page.evaluate(() => {
    const rect = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.getBoundingClientRect().toJSON() : null;
    };
    const height = (selector) => {
      const el = document.querySelector(selector);
      return el ? Math.round(el.getBoundingClientRect().height) : null;
    };
    return {
      viewport: { w: innerWidth, h: innerHeight },
      scrollHeight: document.documentElement.scrollHeight,
      header: rect(".header-row"),
      hero: height(".hero"),
      heroMid: rect(".hero-mid"),
      heroIntro: rect(".hero-intro"),
      heroMeta: rect(".hero-meta"),
      formats: height("#formats"),
      formatsList: rect(".formats-list"),
      formatsPass: rect(".format:last-child .format-pass"),
      faq: height("#faq"),
      how: height("#how"),
      work: height("#work"),
      footer: height(".site-footer"),
      faqGrid: rect(".faq-grid"),
      folder: rect(".folder"),
      items: rect(".faq-items"),
      front: rect(".folder-front"),
      overflowX: document.documentElement.scrollWidth > innerWidth,
    };
  });

  await page.close();
}

// Interaction states at desktop width.
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

await page.evaluate(() => window.scrollTo(0, 170));
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/desktop-roll.png` });

await page.evaluate(() => window.scrollTo(0, 1000));
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/desktop-faq-flight.png` });

await page.evaluate(() => window.scrollTo(0, 700));
await page.waitForTimeout(500);
await page.click("#faq-btn-2").catch(() => {});
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/desktop-faq-open.png` });

await page.close();
await browser.close();

await writeFile(`${OUT}/metrics.json`, JSON.stringify(metrics, null, 2));
console.log(JSON.stringify(metrics, null, 2));
