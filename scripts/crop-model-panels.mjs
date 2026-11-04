#!/usr/bin/env node
/**
 * Split Figure 3 (model.pdf) into panel (a), full (b), and (b) halves for slides.
 * Usage: node scripts/crop-model-panels.mjs [sourcePng]
 */
import { loadImage, createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const src = process.argv[2] ?? 'assets/fig-model.png';
const img = await loadImage(path.resolve(src));
const { width, height } = img;
/** Vertical split between paper panels (a) | (b). */
const splitX = Math.round(width * 0.505);

function crop(x, w, out) {
  const canvas = createCanvas(w, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, x, 0, w, height, 0, 0, w, height);
  writeFileSync(out, canvas.toBuffer('image/png'));
  console.log(`Wrote ${out} (${w}×${height})`);
}

crop(0, splitX, 'assets/fig-model-a.png');
crop(splitX, width - splitX, 'assets/fig-model-b.png');

const panelBWidth = width - splitX;
/** Subfigure boundary inside panel (b): Linear Attention | Mix-FFN (not equal pixel halves because of (a) bleed). */
const mixFfnStart = splitX + Math.round(panelBWidth * 0.528);
const linearAttnStart = splitX + Math.round(panelBWidth * 0.088);

crop(linearAttnStart, mixFfnStart - linearAttnStart, 'assets/fig-model-b-linear-attn.png');
crop(mixFfnStart, panelBWidth - (mixFfnStart - splitX), 'assets/fig-model-b-mixffn.png');
