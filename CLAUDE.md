# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wanderlust is a travel planning application built with Next.js 14 (App Router) that enables users to create, organize, and visualize multi-day trip itineraries with drag-and-drop functionality, flight/hotel information tracking, and map-based navigation.

## Common Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npx prisma studio # Open Prisma database GUI
```

## Architecture

### State Management
- **Zustand store** (`src/lib/store.ts`) manages all application state including trips, days, activities, flights, hotels, and packing lists
- **Local storage persistence** via `loadFromStorage()`/`saveToStorage()` in `src/lib/storage.ts`
- **Undo queue** for deleted activities (expires after 5 minutes)

### Data Models
All types are defined in `src/lib/types.ts`:
- `Trip` - main container with days[], flights[], hotels[], packingList
- `Day` - contains activities[] with date and notes
- `Activity` - individual itinerary items with category, time, location, cost
- `Flight` / `Hotel` - travel data with confirmation numbers, coordinates
- `ActivityCategory` - flight, hotel, restaurant, attraction, activity, transport, shopping, entertainment, other

### Key Patterns
- Activities have an `order` field for drag-and-drop positioning
- `moveActivityToDay()` handles cross-day activity movement
- Location data includes `latitude`/`longitude` for map visualization
- Templates (`TripTemplate`) allow creating new trips from saved structures

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home/landing page
│   ├── trips/             # Trip routes
│   │   ├── page.tsx       # Trips list
│   │   ├── new/page.tsx   # Create new trip
│   │   └── [tripId]/      # Trip detail view
├── components/            # React components
│   ├── ActivityCard.tsx   # Activity display with drag handle
│   ├── MapView.tsx        # Map visualization component
│   ├── LocationSearch.tsx # Address autocomplete
│   ├── FlightForm.tsx      # Flight data entry
│   ├── HotelForm.tsx      # Hotel data entry
│   ├── SortableActivityList.tsx  # DnD activity list
│   └── map/TripMap.tsx    # Leaflet map wrapper
└── lib/
    ├── store.ts           # Zustand store (all state)
    ├── types.ts           # TypeScript interfaces
    ├── storage.ts         # LocalStorage utilities
    ├── markdown-parser.ts # Import markdown trips
    └── exportPDF.ts       # PDF generation
```

## Features

- **Trip Management**: Create/edit/delete trips with cover images and date ranges
- **Drag-and-Drop**: Reorder activities within days and move between days using @dnd-kit
- **Map View**: Leaflet-based map showing activity pins and routes (OSRM API for routing)
- **Flight/Hotel Tracking**: Store confirmation numbers, terminals, check-in/out times
- **Packing List**: Per-trip packing items with checkbox tracking
- **Templates**: Save trips as templates for quick trip creation
- **Import/Export**: Import from markdown, export to PDF
- **Cloud Sync Settings**: UI for configuring sync (backend not yet implemented)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| State | Zustand |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable |
| Maps | Leaflet + react-leaflet |
| Routing API | OSRM (OpenStreetMap) |
| Icons | Lucide React |
| Dates | date-fns |
| Database | Prisma + PostgreSQL (for future cloud sync) |
