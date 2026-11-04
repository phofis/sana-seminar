#!/usr/bin/env node
/**
 * Render a Mermaid file to PNG (for slides).
 * Usage: node scripts/render-mermaid.mjs [input.mmd] [out.png] [width]
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const inPath = path.resolve(root, process.argv[2] ?? 'assets/pipeline-flow.mmd');
const outPath = path.resolve(root, process.argv[3] ?? 'assets/fig-pipeline-flow.png');
const width = Number(process.argv[4] ?? 2800);

const definition = readFileSync(inPath, 'utf8');
mkdirSync(path.dirname(outPath), { recursive: true });

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 28px 32px;
    background: #f6f4ef;
    font-family: "IBM Plex Sans", system-ui, sans-serif;
  }
  #wrap { display: inline-block; }
  .mermaid svg { max-width: none !important; height: auto !important; }
</style>
</head>
<body>
<div id="wrap"><pre id="diagram" class="mermaid"></pre></div>
<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  flowchart: { curve: 'basis', padding: 24, nodeSpacing: 44, rankSpacing: 64 },
  theme: 'base',
  themeVariables: {
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
    fontSize: '32px',
    primaryColor: '#e8f3f2',
    primaryTextColor: '#1c1917',
    primaryBorderColor: '#0f5f5c',
    secondaryColor: '#ffffff',
    tertiaryColor: '#f6f4ef',
    lineColor: '#0f5f5c',
    textColor: '#1c1917',
    mainBkg: '#ffffff',
    nodeBorder: '#0f5f5c',
    clusterBkg: '#ffffff',
    clusterBorder: '#e6e0d6',
    titleColor: '#0f5f5c',
  },
});
const def = ${JSON.stringify(definition)};
const { svg } = await mermaid.render('pipeline-flow', def);
document.getElementById('wrap').innerHTML = svg;
window.__MERMAID_READY__ = true;
</script>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 900 } });
await page.setContent(html, { waitUntil: 'networkidle', timeout: 120_000 });
await page.waitForFunction(() => window.__MERMAID_READY__ === true, { timeout: 60_000 });
await page.evaluate(() => {
  const svg = document.querySelector('#wrap svg');
  if (!svg) throw new Error('No Mermaid SVG');
  const vb = svg.viewBox.baseVal;
  const w = vb.width || svg.getBoundingClientRect().width;
  const h = vb.height || svg.getBoundingClientRect().height;
  svg.setAttribute('width', String(w));
  svg.setAttribute('height', String(h));
  svg.style.width = `${w}px`;
  svg.style.height = `${h}px`;
});
const svg = page.locator('#wrap svg');
await svg.waitFor({ state: 'visible', timeout: 10_000 });
const box = await svg.boundingBox();
if (!box) throw new Error('Mermaid SVG has no bounding box');
const pad = 8;
await page.setViewportSize({
  width: Math.ceil(box.width + pad * 2 + 56),
  height: Math.ceil(box.height + pad * 2 + 56),
});
await svg.screenshot({ path: outPath, type: 'png' });
await browser.close();
console.log(`Wrote ${outPath}`);
