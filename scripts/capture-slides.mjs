#!/usr/bin/env node
/**
 * Capture Reveal.js slides for visual review (1920×1080 viewport).
 * Usage: node scripts/capture-slides.mjs [baseUrl] [outDir]
 * Default: http://127.0.0.1:8765 .playwright-screenshots
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:8765';
const outDir = process.argv[3] ?? '.playwright-screenshots';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.waitForFunction(() => typeof Reveal !== 'undefined' && Reveal.isReady());
  await page.waitForTimeout(800);

  const slides = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.slides > section')).map((sec, i) => ({
      index: i,
      id: sec.id || `slide-${i}`,
    }));
  });

  const manifest = [];

  for (const { index, id } of slides) {
    await page.evaluate((idx) => Reveal.slide(idx), index);
    await page.waitForTimeout(400);
    const hasIframe = await page.evaluate(() =>
      Boolean(document.querySelector('.slides section.present iframe'))
    );
    if (hasIframe) await page.waitForTimeout(1200);

    const file = `${String(index + 1).padStart(2, '0')}-${id}.png`;
    await page.screenshot({
      path: path.join(outDir, file),
      fullPage: false,
    });
    manifest.push({ index, id, file });
  }

  await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await browser.close();
  console.log(`Wrote ${manifest.length} screenshots to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
