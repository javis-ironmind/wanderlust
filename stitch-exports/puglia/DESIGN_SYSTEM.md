# Wanderlust Design System — The Editorial Wanderer (From Stitch)

## Source
Generated via Stitch MCP from project `2614638602640391771` ("10 Days in Puglia: Itinerary")
Aesthetic: Premium travel editorial — warm earth tones, serif headlines, magazine-inspired layout.

## Color Palette

### Primary (Terracotta)
- Default: `#9b3f25`
- Container: `#bb563b`
- Fixed: `#ffdbd1`
- Fixed Dim: `#ffb5a1`
- On Primary: `#ffffff`
- On Primary Container: `#fffbff`

### Secondary (Olive Green)
- Default: `#5c614d`
- Container: `#e0e5cc`
- Fixed: `#e0e5cc`
- Fixed Dim: `#c4c9b1`

### Tertiary (Warm Brown)
- Default: `#735737`
- Container: `#8e6f4e`
- Fixed: `#ffddbb`
- Fixed Dim: `#e5c099`

### Neutral/Background
- Background: `#f4faff` (cool white with blue tint)
- Surface: `#f4faff`
- Surface Container Lowest: `#ffffff`
- Surface Container Low: `#e7f6ff`
- Surface Container: `#e0f0fb`
- Surface Container High: `#daebf5`
- Surface Container Highest: `#d5e5ef`
- Surface Dim: `#ccdce7`
- On Surface: `#0e1d25` (deep slate — not pure black)
- On Surface Variant: `#56423d` (warm gray)
- Outline: `#89726c`
- Outline Variant: `#ddc0b9`

### Error
- Error: `#ba1a1a`
- Error Container: `#ffdad6`

## Typography

### Font Families
- **Headlines:** Noto Serif (400, 700) — editorial, traditional
- **Body:** Plus Jakarta Sans (300, 400, 500, 600, 700) — modern, readable
- **Labels:** Plus Jakarta Sans

### Material Symbols Icons
```
material-symbols-outlined
```

## Tailwind Config

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#9b3f25',
        'primary-container': '#bb563b',
        'primary-fixed': '#ffdbd1',
        'primary-fixed-dim': '#ffb5a1',
        secondary: '#5c614d',
        'secondary-container': '#e0e5cc',
        tertiary: '#735737',
        'tertiary-container': '#8e6f4e',
        'tertiary-fixed': '#ffddbb',
        background: '#f4faff',
        surface: '#f4faff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#e7f6ff',
        'surface-container': '#e0f0fb',
        'surface-container-high': '#daebf5',
        'surface-container-highest': '#d5e5ef',
        'surface-dim': '#ccdce7',
        'on-surface': '#0e1d25',
        'on-surface-variant': '#56423d',
        outline: '#89726c',
        'outline-variant': '#ddc0b9',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
      },
      fontFamily: {
        headline: ['Noto Serif'],
        body: ['Plus Jakarta Sans'],
        label: ['Plus Jakarta Sans'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
}
```

## Design Philosophy

### "The Editorial Explorer"
Premium travel monograph aesthetic — warm earth tones (terracotta, olive, sand), serif headlines for authority, generous whitespace for a "curated journal" feel.

### "No-Line" Rule
No 1px solid borders for sectioning. Use background color shifts instead.

### Card Shadows
```css
.editorial-shadow {
  box-shadow: 0 8px 24px rgba(14, 29, 37, 0.06);
}
```

## Files in this Export

| File | Description |
|------|-------------|
| `10-days-puglia-itinerary.html` | Full HTML — Day-by-day Puglia itinerary |
| `destination-detail-matera.html` | Full HTML — Matera destination page |
| `traveler-journals.html` | Full HTML — Social travel journals |
| `my-trips-dashboard.html` | Full HTML — My Trips Dashboard |
| `trip-timeline-view.html` | Full HTML — Visual trip timeline |
| `10-days-puglia-itinerary.png` | Screenshot preview |
| `destination-detail-matera.png` | Screenshot preview |
| `traveler-journals.png` | Screenshot preview |
| `my-trips-dashboard.png` | Screenshot preview |
| `trip-timeline-view.png` | Screenshot preview |
| `DESIGN_SYSTEM.md` | This file — design tokens & Tailwind config |

## Comparison: Editorial Wanderer vs Horizon Minimal

| Aspect | Editorial Wanderer (This) | Horizon Minimal |
|--------|--------------------------|----------------|
| Primary | #9b3f25 Terracotta | #0058be Blue |
| Aesthetic | Warm earth tones, editorial magazine | Clean, utility-first |
| Headlines | Noto Serif (traditional) | Be Vietnam Pro (modern) |
| Body | Plus Jakarta Sans | Inter |
| Feel | Premium travel journal | Modern SaaS app |
| Best for | Travel discovery, inspiration | Trip planning, logistics |

Kelvin prefers this Editorial Wanderer style — warm, premium, magazine-like.
