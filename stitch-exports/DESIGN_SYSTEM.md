# Wanderlust Design System — Horizon Minimal (From Stitch)

## Source
Generated via Stitch MCP from project `10188507998693607942` ("My Trips Dashboard")

## Color Palette

### Primary (Blue Accent)
- Default: `#0058be`
- Container: `#2170e4`
- Fixed: `#d8e2ff`
- On Primary: `#ffffff`
- On Primary Container: `#fefcff`

### Secondary
- Default: `#495e8a`
- Container: `#b6ccff`
- Fixed: `#d8e2ff`

### Tertiary (Red — Active Tab Underline)
- Default: `#b61722`
- Container: `#da3437`
- Fixed: `#ffdad7`

### Neutral/Background
- Background: `#f7f9fb`
- Surface: `#f7f9fb`
- Surface Container Lowest: `#ffffff`
- Surface Container Low: `#f2f4f6`
- Surface Container: `#eceef0`
- Surface Container High: `#e6e8ea`
- Surface Container Highest: `#e0e3e5`
- On Surface: `#191c1e`
- On Surface Variant: `#424754`
- Outline: `#727785`
- Outline Variant: `#c2c6d6`

### Semantic
- Error: `#ba1a1a`
- Error Container: `#ffdad6`

## Typography

### Font Families
- **Headlines:** Be Vietnam Pro (400, 700, 800, 900)
- **Body:** Inter (400, 500, 600)
- **Labels:** Inter (400, 500, 600)
- **Mono (codes):** JetBrains Mono

### Material Symbols Icons
```
material-symbols-outlined
```

## Tailwind Config (copy directly)

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0058be',
        'primary-container': '#2170e4',
        'primary-fixed': '#d8e2ff',
        secondary: '#495e8a',
        'secondary-container': '#b6ccff',
        tertiary: '#b61722',
        'tertiary-container': '#da3437',
        background: '#f7f9fb',
        surface: '#f7f9fb',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'surface-container-highest': '#e0e3e5',
        'on-surface': '#191c1e',
        'on-surface-variant': '#424754',
        outline: '#727785',
        'outline-variant': '#c2c6d6',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
      },
      fontFamily: {
        headline: ['Be Vietnam Pro'],
        body: ['Inter'],
        label: ['Inter'],
        mono: ['JetBrains Mono'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
    },
  },
}
```

## Component Patterns

### Cards
- Background: `surface-container-lowest` (#ffffff)
- Shadow: `shadow-[0_12px_40px_rgba(25,28,30,0.06)]`
- Border radius: `rounded-lg` (1rem)

### Active Tab
- 3px tertiary (`#b61722`) underline, slightly wider than text

### Ghost Border (fallback)
- `outline-variant` (#c2c6d6) at 15% opacity
- Never use 100% opaque borders

### Glassmorphism (for map overlays)
- `bg-white/80 backdrop-blur-xl`

### Flight Path Dotted Line
```css
.flight-path-dotted {
  background-image: radial-gradient(circle, #c2c6d6 1.5px, transparent 1.5px);
  background-size: 8px 1px;
  background-repeat: repeat-x;
}
```

## Files in this Export

| File | Description |
|------|-------------|
| `my-trips-dashboard.html` | Full HTML for My Trips Dashboard screen |
| `trip-planner-itinerary.html` | Full HTML for Day-by-day Itinerary Planner |
| `flight-info-card.html` | Full HTML for Flight Info Card (DL 1234) |
| `my-trips-dashboard.png` | Screenshot of My Trips Dashboard |
| `trip-planner-map.png` | Screenshot of Map View |
| `flight-info-card.png` | Screenshot of Flight Info Card |
| `DESIGN_SYSTEM.md` | This file — design tokens & Tailwind config |

## How to Use

1. **HTML files** — Open in browser to see rendered design, copy components into your Next.js/Tailwind project
2. **Tailwind config** — Copy into your `tailwind.config.js` to get the exact same color tokens
3. **Screenshots** — Reference for visual QA during development
