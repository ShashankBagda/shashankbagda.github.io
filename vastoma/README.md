# Vastoma — Build smart. Scale further.

Vastoma is a production-ready multi-page marketing website for an enterprise IT company. The site is built with vanilla HTML, CSS, and JavaScript — no build step, no frameworks. It implements the full Vastoma Brand & Design System v2.0.

---

## Folder structure

```
Vastoma/
├── index.html              Home / landing page
├── about.html              About + team + values
├── services.html           Services / capabilities
├── solutions.html          Industries + use cases
├── work.html               Case studies / portfolio
├── pricing.html            Pricing tiers
├── blog.html               Blog/insights index
├── contact.html            Contact form + offices
├── brand-guide.html        Vastoma Brand Guide v2.0
├── 404.html                Branded not-found page
├── sitemap.xml             XML sitemap
├── robots.txt              Robots directives
├── assets/
│   ├── css/
│   │   ├── tokens.css      ALL design tokens — light + dark
│   │   ├── base.css        Resets, typography, layout primitives
│   │   ├── components.css  Buttons, cards, forms, nav, footer, etc.
│   │   └── animations.css  Keyframes + scroll/reveal helpers
│   ├── js/
│   │   ├── theme.js        Light/dark toggle + localStorage persistence
│   │   ├── nav.js          Mobile menu, active link, scroll header shrink
│   │   ├── reveal.js       IntersectionObserver scroll-reveal
│   │   ├── particles.js    Hero canvas particles
│   │   └── main.js         Entry — initialises all modules
│   ├── img/
│   │   ├── og-cover.svg    1200×630 social share image
│   │   ├── favicon.svg     [S] bracket icon
│   │   ├── hero-bg.svg     Abstract geometric background
│   │   ├── pattern-grid.svg  Dot grid texture
│   │   └── illustrations/  6 SVG service illustrations
└── README.md               This file
```

---

## How to preview locally

```bash
# From the repository root
python -m http.server 8000
```

Then visit: [http://localhost:8000/Vastoma/](http://localhost:8000/Vastoma/)

Or using Node.js:

```bash
npx serve .
```

Then visit: [http://localhost:3000/Vastoma/](http://localhost:3000/Vastoma/)

---

## Live URL

**[https://shashankbagda.github.io/Vastoma/](https://shashankbagda.github.io/Vastoma/)**

---

## Design token reference

All tokens are defined in `assets/css/tokens.css` and referenced via `var(--token)`.

| Category | Key tokens |
|----------|-----------|
| **Brand** | `--navy` `--gold` `--gold-deep` `--gold-soft` `--red` |
| **Semantic** | `--success` `--warning` `--error` `--info` |
| **Light bg** | `--bg` `--bg-soft` `--bg-muted` `--surface` `--surface-raised` |
| **Dark bg** | Overridden under `[data-theme="dark"]` |
| **Text** | `--text` `--text-secondary` `--text-muted` `--text-subtle` |
| **Interactive** | `--primary` `--primary-text` `--accent` `--accent-text` |
| **Typography** | `--font-display` `--font-body` `--font-mono` |
| **Type scale** | `--text-display` through `--text-overline` |
| **Spacing** | `--space-1` (4px) through `--space-24` (96px) |
| **Radius** | `--r-sm` through `--r-full` |
| **Shadows** | `--shadow-xs` through `--shadow-xl` `--shadow-glow` |
| **Motion** | `--dur-fast` `--dur-base` `--dur-slow` `--ease-out` `--ease-in-out` |
| **Layout** | `--container` (1240px) `--container-narrow` (880px) `--gutter` (24px) |
| **Z-index** | `--z-base` through `--z-toast` |

---

## License

© 2026 Vastoma. All rights reserved.
