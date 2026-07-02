# Design Direction — Lumen Studio (Photographer)

> Тестовий синтез з бібліотеки refs · portfolio homepage

**Inspired by:** `full-page-001-atelier-editorial` + `hero-002-auro-lifestyle-cover`  
**Unique because:** charcoal+wheat palette замість furniture accents; asymmetric hero з портретами замість product cutouts; category grid → shoot types; carousel → selected frames

---

## Brand Identity

| Token | Value | Роль |
|-------|-------|------|
| `--color-cream` | `#f4efe6` | Page bg |
| `--color-wheat` | `#e8dfd0` | Cards, hero bg |
| `--color-charcoal` | `#141414` | Dark bands, footer |
| `--color-gold` | `#b8956c` | Accent, eyebrows |
| `--color-ink` | `#1c1c1c` | Body text |

**Typography**
- Display / hero / footer wordmark: **Syne** 700–800 (Atelier bold sans)
- Headlines / brand: **Cormorant Garamond** (Auro serif)
- UI / nav: **DM Sans** caps spaced (Auro nav pattern)

---

## Section Map

| # | Секція | Ref source |
|---|--------|------------|
| 1 | Hero asymmetric + vertical shoot list | Atelier hero |
| 2 | Dark philosophy band | Atelier black section |
| 3 | Portfolio category grid | Auro category grid |
| 4 | Selected work carousel | Atelier product carousel |
| 5 | Testimonial | Atelier quotes |
| 6 | Curated shoots 01–05 | Atelier numbered list |
| 7 | Mega footer + newsletter | Atelier footer |

---

## Hero

Split headline: **"Capturing / light & truth"** — asymmetry як Atelier.  
Rounded portrait frames замість furniture. Vertical list: Portraits, Weddings, Editorial, Commercial (Atelier sidebar categories).  
Pill CTA: **View Portfolio →**

---

## Avoid (from refs)

- Furniture product shots, shopping cart icons
- Yellow chair accent color
- Literal ecommerce copy (Shop Now, Cart)

---

## App Shell Z-Axis (v2)

**Pattern:** fixed chrome (top + dock) + scroll-stacked `z-layer` surfaces in CSS 3D perspective.

| Band | z-index token | Елемент |
|------|---------------|---------|
| Base | `--z-base` | scene grid |
| Raised | layers 1–7 | sticky cards |
| Chrome | `--z-chrome` | header + dock |
| HUD | `--z-hud` | depth indicator |

- Scroll → попередні шари recede (`translateZ`, `scale`, `opacity`)
- Dock Z0–Z6 → `scrollIntoView` по шарах
- `prefers-reduced-motion` → flat stack без 3D
- `js/app-shell.js` — depth driver
