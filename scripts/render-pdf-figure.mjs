#!/usr/bin/env node
/**
 * Rasterize page 1 of a paper PDF into assets/ (for slides; PDF iframes are unreliable in many browsers).
 * Usage: node scripts/render-pdf-figure.mjs [pdfPath] [outPng] [scale]
 */
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const wasmUrl = pathToFileURL(path.join(root, 'node_modules/pdfjs-dist/wasm/')).href;

const pdfPath = process.argv[2] ?? 'texsrc/figures/performance-of-different-parts.pdf';
const outPath = process.argv[3] ?? 'assets/fig-performance-waterfall.png';
const scale = Number(process.argv[4] ?? 2);

const data = new Uint8Array(readFileSync(pdfPath));
const doc = await getDocument({
  data,
  useSystemFonts: true,
  wasmUrl,
  // Node canvas: JS OpenJPEG fallback is more reliable than wasm file:// loads.
  useWasm: false,
}).promise;
const page = await doc.getPage(1);
const viewport = page.getViewport({ scale });
const canvas = createCanvas(viewport.width, viewport.height);
const ctx = canvas.getContext('2d');
await page.render({ canvasContext: ctx, viewport }).promise;
writeFileSync(outPath, canvas.toBuffer('image/png'));
console.log(`Wrote ${path.resolve(outPath)} (${viewport.width}×${viewport.height})`);
