# Story S029: PWA Support

## Feature: Progressive Web App capabilities

**As a** traveler  
**I want to** install Wanderlust as a native-like app on my device  
**So that** I can access my trips offline and get a full-screen experience

---

## Acceptance Criteria

### AC1: Web App Manifest
- [x] Create manifest.json in public folder
- [x] Include: name, short_name, icons (192x192, 512x512), theme_color, background_color
- [x] Set display mode to "standalone"
- [x] Include start_url and scope

### AC2: Service Worker
- [x] Register service worker in app layout
- [x] Cache static assets (CSS, JS, fonts)
- [x] Implement offline fallback page
- [x] Cache strategy: stale-while-revalidate for API data

### AC3: Install Prompt
- [x] Detect beforeinstallprompt event
- [x] Show custom install button/banner
- [x] Handle install action properly

### AC4: Meta Tags
- [x] Add viewport meta for mobile
- [x] Add theme-color meta tag
- [x] Add apple-mobile-web-app-capable tags
- [x] Add favicon and apple touch icons

---

## Technical Notes

- Use next-pwa for Next.js service worker
- Generate icons using real favicon or placeholder
- Manifest requirements: https://web.dev/add-manifest/
- Test with Chrome DevTools Application > Manifest
