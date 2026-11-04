# AGENTS.md — SANA seminar deck

## Purpose

This repository is a **static Reveal.js seminar** on **SANA** (Xie & Chen et al., ICLR 2025 oral, [arXiv:2410.10629](https://arxiv.org/abs/2410.10629)). It is **not** the NVlabs training codebase ([github.com/NVlabs/Sana](https://github.com/NVlabs/Sana)); treat that project as external bibliography only.

Agents should help with **slide content/structure** in `index.html` and **layout/visual polish** in `css/seminar.css`. Do not set up hosting, LaTeX builds, or vendor upgrades unless the user explicitly asks.

## Repository map

| Path | Role |
|------|------|
| `index.html` | Source of truth: slides, on-slide copy, speaker notes, figure embeds |
| `css/seminar.css` | Design system: IBM Plex, grids, cards, 1920×1080 canvas |
| `assets/` | Raster figures for slides (prefer PNG over PDF iframes) |
| `texsrc/` | **Read-only** paper LaTeX and PDF figures (source reference only) |
| `vendor/` | **Frozen** Reveal.js, KaTeX, fonts — do not edit |
| `sana.md` | Scratch file — **ignore** |

## Quick start

From the repo root:

```bash
npm install          # installs Playwright + Chromium (postinstall)
npm run serve        # http://127.0.0.1:8765
```

Open `http://127.0.0.1:8765/` (default port in `npm run serve`).

### Visual check (agents)

After layout or CSS changes, capture the deck at 1920×1080:

```bash
npm run serve        # separate terminal
npm run screenshots  # writes .playwright-screenshots/
```

Review PNGs before declaring a slide fixed. Optional: pass a URL and output dir (`node scripts/capture-slides.mjs http://127.0.0.1:8765 /tmp/out`).

- **Speaker notes**: press `S` (Reveal Notes plugin).
- **Navigation**: arrow keys; `Esc` for overview; URLs use slide hashes (`hash: true`).
- **Backup / appendix slides**: use `class="backup-slide"` on `<section>` when matching existing appendix style.

## Where to edit

### Slides (`index.html`)

- Each slide is `<section id="unique-id">` inside `.reveal > .slides`.
- Typical structure: `p.kicker` → headings/body → optional layout blocks → `p.cap` (caption) → `aside.notes` (rehearsal script).
- **On-slide text is authoritative** for claims and wording. Speaker notes may be expanded for clarity but must not contradict slides or the paper.
- **Language**: English on slides and in notes.
- **Audience**: CS students with basic ML — define symbols on slides before using them; preserve nuance (e.g. separate the paper’s 469s DiT baseline from 1023s FLUX-dev when discussing “100×”).
- **Talk arc** (when adding or moving material): Introduction → Motivation → Method → Results → Critical reading → Discussion.

**Example — minimal new slide** (copy patterns from neighboring sections):

```html
<section id="my-slide">
  <p class="kicker">Method</p>
  <h2>Short headline</h2>
  <p>One or two sentences visible to the room.</p>
  <p class="cap">Figure or table reference. Xie and Chen et al., ICLR 2025.</p>
  <aside class="notes">
    Longer rehearsal script. Numbers and comparisons must match the paper.
  </aside>
</section>
```

Footers (`SANA · Xie & Chen et al.`) are injected by the init script at the bottom of `index.html`; do not add them by hand on each slide.

### Math

Use `$...$` and `$$...$$`. KaTeX is configured in `Reveal.initialize` at the end of `index.html` (`RevealMath.KaTeX`, `aside` in `ignoredTags`).

### Figures

- **Paper figures on slides**: rasterize to `assets/*.png` with `npm run render-figure` (see `scripts/render-pdf-figure.mjs`) and use `<img>` inside `.figure-embed`. **Do not use PDF iframes**—they often render blank in Chrome and in Playwright.
- **Photos / samples**: `<img src="assets/...">` with `p.cap` attribution.
- Do **not** edit or rebuild `texsrc/` LaTeX; read PDFs from `texsrc/figures/` only as render inputs.

### Tables

Use `table.grid` (optional `compact`). Put the caption in `<caption>` inside the table — init code moves it to `p.cap.slide-caption` before the notes block. Do not duplicate the same caption as a separate `p.cap` unless intentional.

### Styles (`css/seminar.css`)

Prefer existing tokens and classes before new CSS.

- **Grids**: `.cols`, `.cols-2`, `.cols-2-even`, `.cols-3`, `.cols-title`
- **Blocks**: `.card`, `.card.teal`, `.card.rust`, `.stat`, `.lede`, `.kicker`, `.slide-main`, `.figure-embed`
- Slides are **1080px** tall with fixed padding; check overflow in the browser after layout changes.
- Reveal: **1920×1080**, `center: false`, fade transitions — keep new slides visually consistent.

## Content rules

- Keep **paper-accurate** numbers, baselines, and comparisons.
- Do not replace careful on-slide wording with slogans without user approval.
- Propose **outline-level** section moves in chat before large narrative restructures.

## Out of scope

- Edit `texsrc/`, `vendor/`, or `sana.md`
- Commit, push, GitHub Pages, or PDF export unless the user asks
- Modify NVlabs Sana source or training pipelines

## Git

Do not commit unless the user asks. When they do, prefer small commits with clear messages (e.g. `fix(slides): clarify 4K token count on motivation slide`).
