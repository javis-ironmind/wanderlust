# Wanderlust - Travel Planning App

A comprehensive travel planning application built with Next.js that enables users to create, organize, and visualize multi-day itineraries with drag-and-drop functionality, integrated flight/hotel information, and map-based navigation.

## Current Status

**Phase 1 (Core) - In Progress**
- ✅ Trip creation with name, dates
- ✅ Day-by-day itinerary structure  
- ✅ Activity items with time, location, notes
- ✅ Drag-and-drop reordering within days (S003)
- ✅ Zustand state management (S003)
- 🔄 Drag items between days (S010)
- 🔄 Flight information storage (S001-S002)
- 🔄 Hotel information storage (S001-S002)
- 🔄 Map visualization (S014)
- 🔄 Route generation (S015)
- 🔄 Category filtering (S018)
- 🔄 Vercel deployment (S019)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| State | Zustand |
| Drag & Drop | @dnd-kit/core |
| Maps | Mapbox GL JS + react-map-gl |
| Routing | Mapbox Directions API |
| Icons | Lucide React |

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view.

## Environment Variables

Create `.env.local` with:
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── trip/         # Trip-related components
│   ├── day/          # Day/itinerary components  
│   ├── activity/     # Activity card components
│   └── map/          # Map visualization components
├── stores/           # Zustand stores
├── types/            # TypeScript definitions
└── utils/            # Helper functions
```

## Stories

| ID | Title | Status |
|----|-------|--------|
| S001 | Flight Information Storage | Partial |
| S002 | Hotel Information Storage | Partial |
| S003 | Drag Activities Between Days | Partial |
| S010 | Drag Activity to Different Day | Open |
| S014 | Display Activity Pins on Map | Open |
| S015 | Route Generation Between Activities | Open |
| S018 | Activity Category Filtering | Open |
| S019 | Deploy to Vercel | Open |

## Deployment

See story S019 for Vercel deployment steps. Requires:
1. GitHub repository
2. Vercel project connected to repo
3. Mapbox token in environment variables

## Dependencies

- Node.js 18+
- npm or yarn
- Mapbox account (for maps)
