# Wanderlust - Travel Planning App PRD

## 1. Executive Summary

**Project Name:** Wanderlust

**Type:** Web Application (Next.js + Vercel)

**Core Functionality:** A comprehensive travel planning application that enables users to create, organize, and visualize multi-day itineraries with drag-and-drop functionality, integrated flight/hotel information, and map-based navigation derived from daily itineraries.

**Target Users:**
- Solo travelers planning personal trips
- Families coordinating vacations
- Digital nomads managing multi-city journeys
- Travel enthusiasts who want to visualize and optimize their trips

---

## 2. Problem Statement

Current travel planning tools suffer from fragmentation:
- Itinerary planners lack visual map integration
- Flight/hotel information lives in separate apps
- Drag-and-drop itinerary adjustment is clunky or non-existent
- No seamless way to visualize daily routes on a map
- Poor offline support for travelers

Wanderlust solves this by providing a unified, visually-driven travel planning experience.

---

## 3. Goals & Success Criteria

| Goal | Success Criteria | Measurement |
|------|------------------|-------------|
| **Core Itinerary** | Users can create multi-day trips with unlimited days | Can add 10+ days without performance degradation |
| **Draggable Interface** | Items can be reordered within and across days | Drag-drop latency <100ms |
| **Flight Integration** | Flight details (airline, times, confirmation, terminals) are stored and displayed | Can add flight with all fields searchable |
| **Hotel Integration** | Hotel info (name, address, confirmation, check-in/out times) stored | Complete hotel profile per booking |
| **Map Visualization** | Daily itinerary displayed as route on map | Each day shows pins for all activities |
| **Navigation** | Map provides turn-by-turn between points | Routes generated for 5+ stops per day |
| **Responsive Design** | Works on desktop (primary) and tablet | Fluid experience on 1024px+ screens |
| **Data Persistence** | Trips saved locally and syncable | Data persists across sessions |

---

## 4. Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 14 (App Router) | Server components, excellent DX, Vercel native |
| Styling | Tailwind CSS | Rapid UI development, consistent design |
| State | Zustand + React Query | Lightweight global state, server state management |
| Drag & Drop | @dnd-kit/core | Modern, accessible, performant drag-drop |
| Maps | Leaflet + OpenStreetMap | Free, no API key, works immediately |
| Maps (React) | react-leaflet | Official Mapbox React wrapper |
| Routing | OSRM API | Turn-by-turn navigation |
| Geocoding | Nominatim API | Address search and coordinate lookup |
| Database | Vercel Postgres or local storage | Persistent trip data |
| Auth | NextAuth.js (optional) | Future: user accounts |
| Deployment | Vercel | Zero-config Next.js deployment |
| Icons | Lucide React | Clean, consistent iconography |
| Date Handling | date-fns | Lightweight date manipulation |
| Forms | React Hook Form + Zod | Type-safe form validation |
| Animations | Framer Motion | Smooth UI transitions |

---

## 5. Scope

### In Scope (Phase 1 - Core)
- [ ] Trip creation with name, dates, cover image
- [ ] Day-by-day itinerary structure
- [ ] Activity items with time, location, notes
- [ ] Drag-and-drop reordering within days
- [ ] Drag items between days
- [ ] Flight information storage and display
- [ ] Hotel information storage and display
- [ ] Map visualization of daily activities
- [ ] Route generation between daily activities
- [ ] Address search via geocoding
- [ ] Local storage persistence
- [ ] Responsive layout (desktop focus)

### In Scope (Phase 2 - Enhanced)
- [ ] User authentication
- [ ] Cloud sync
- [ ] Trip sharing
- [ ] Collaboration
- [ ] Export to PDF/calendar
- [ ] PWA support (offline)
- [ ] Mobile-optimized experience
- [ ] Packing list
- [ ] Budget tracking
- [ ] Weather integration

### Out of Scope (Initial)
- [ ] Flight price tracking
- [ ] Hotel booking integration
- [ ] Real-time booking
- [ ] Social features
- [ ] Review system

---

## 6. Feature Overview

### Phase 1 Features

| Feature ID | Feature Name | Description |
|------------|-------------|-------------|
| F001 | Trip Management | Create, edit, delete trips with metadata |
| F002 | Day Structure | Add/remove/reorder days in trip |
| F003 | Activity Items | Add activities with time, location, details |
| F004 | Drag & Drop | Reorder activities within/between days |
| F005 | Flight Tracking | Store flight details per day/leg |
| F006 | Hotel Tracking | Store hotel details per city/stay |
| F007 | Map View | Visualize daily itinerary on map |
| F008 | Route Navigation | Generate routes between daily stops |
| F009 | Location Search | Geocoding for address autocomplete |
| F010 | Data Persistence | Save/load trips to local storage |
| F011 | Trip Timeline | Visual timeline view of trip |
| F012 | Activity Categories | Categorize activities (food, transport, etc.) |

---

## 7. User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         WANDERLUST                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌─────────────────────────────────────┐  │
│  │   My Trips   │───►│          Trip Dashboard              │  │
│  │   (List)     │    │  ┌────────────────────────────────┐ │  │
│  └──────────────┘    │  │  Cover Image + Trip Title       │ │  │
│                     │  │  Dates: Jan 15 - Jan 22, 2026   │ │  │
│                     │  │  7 Days • 3 Cities               │ │  │
│                     │  └────────────────────────────────┘ │  │
│                     │                                         │  │
│                     │  ┌────────────────────────────────┐ │  │
│                     │  │     DAY 1 - Tokyo              │ │  │
│                     │  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │ │  │
│                     │  │  │ ✈️ │ │ 🍣 │ │ 🏯 │ │ 🌙 │  │ │  │
│                     │  │  │Flight│ │Food│ │Sight│ │Hotel│ │ │  │
│                     │  │  └────┘ └────┘ └────┘ └────┘  │ │  │
│                     │  └────────────────────────────────┘ │  │
│                     │                                         │  │
│                     │  ┌────────────────────────────────┐ │  │
│                     │  │     DAY VIEW (Selected)         │ │  │
│                     │  │  ┌────────────────────────────┐  │ │  │
│                     │  │  │      🗺️ Map Box           │  │ │  │
│                     │  │  │   Route: A → B → C → D    │  │ │  │
│                     │  │  │   ⏱️ 45 min drive total   │  │ │  │
│                     │  │  └────────────────────────────┘  │ │  │
│                     │  └────────────────────────────────┘ │  │
│                     └─────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Data Models

### Trip
```typescript
interface Trip {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  startDate: Date;
  endDate: Date;
  days: Day[];
  flights: Flight[];
  hotels: Hotel[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Day
```typescript
interface Day {
  id: string;
  tripId: string;
  date: Date;
  name: string; // e.g., "Day 1 - Tokyo"
  activities: Activity[];
}
```

### Activity
```typescript
interface Activity {
  id: string;
  dayId: string;
  title: string;
  description?: string;
  category: ActivityCategory;
  startTime?: string; // "14:00"
  endTime?: string;   // "15:30"
  location?: Location;
  order: number;
  notes?: string;
  cost?: number;
  currency?: string;
  links?: string[];
}

type ActivityCategory = 
  | 'transport' 
  | 'food' 
  | 'sightseeing' 
  | 'activity' 
  | 'accommodation' 
  | 'shopping' 
  | 'other';
```

### Location
```typescript
interface Location {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
}
```

### Flight
```typescript
interface Flight {
  id: string;
  tripId: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    terminal?: string;
    gate?: string;
    time: Date;
  };
  arrival: {
    airport: string;
    terminal?: string;
    gate?: string;
    time: Date;
  };
  confirmationNumber?: string;
  seatAssignment?: string;
  notes?: string;
}
```

### Hotel
```typescript
interface Hotel {
  id: string;
  tripId: string;
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  checkIn: Date;
  checkOut: Date;
  confirmationNumber?: string;
  roomType?: string;
  notes?: string;
  links?: string[];
}
```

---

## 9. UI/UX Principles

### Design Philosophy
- **Clean & Focused:** Minimal distractions, travel photography as hero
- **Map-First:** Geography is central to travel planning
- **Intuitive Drag-Drop:** Activities flow like physical cards
- **Information Density:** Enough detail without clutter

### Color Palette
| Role | Color | Usage |
|------|-------|-------|
| Primary | `#1E3A5F` (Deep Navy) | Headers, CTAs |
| Secondary | `#F97316` (Warm Orange) | Accents, highlights |
| Background | `#FAFAFA` | Main background |
| Surface | `#FFFFFF` | Cards, panels |
| Text Primary | `#1F2937` | Body text |
| Text Secondary | `#6B7280` | Captions |
| Success | `#10B981` | Confirmations |
| Warning | `#F59E0B` | Alerts |
| Error | `#EF4444` | Errors |

### Typography
| Element | Font | Size | Weight |
|---------|------|------|--------|
| Headings | Inter | 24-32px | 600-700 |
| Subheadings | Inter | 18-20px | 500 |
| Body | Inter | 14-16px | 400 |
| Captions | Inter | 12px | 400 |
| Monospace | JetBrains Mono | 13px | 400 |

### Layout
- **Desktop:** 3-column (sidebar | main itinerary | map panel)
- **Tablet:** 2-column (itinerary | map, sidebar collapsible)
- **Mobile:** Single column with bottom sheet map

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 10. Key Interactions

### Drag & Drop
- Grab handle on activity cards
- Visual drop zones highlighted
- Smooth animations on reorder
- Auto-scroll when dragging near edges
- Touch support for tablet

### Map Interactions
- Pan and zoom freely
- Click activity to highlight
- Route lines animated
- Click pin for details popup
- Toggle route visibility

### Date/Time
- Click time to edit inline
- Drag to resize activity duration
- Visual duration bars

---

## 11. Technical Considerations

### Mapbox Setup
- Need OpenStreetMap - no account needed
- Token stored in environment variable
- Use OpenStreetMap - unlimited (50,000 loads/month)
- Cache map tiles for performance

### Local Storage
- Use localStorage for trip persistence
- JSON serialization with date handling
- Auto-save on changes (debounced)
- Export/import JSON for backup

### Performance
- Lazy load map component
- Virtualize long itineraries (100+ items)
- Optimize re-renders with React.memo
- Use skeleton loaders

### Accessibility
- Keyboard navigation for drag-drop
- ARIA labels on interactive elements
- Focus management
- Screen reader support

---

## 12. Project Structure

```
wanderlust/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── trips/
│   │   │   ├── page.tsx
│   │   │   └── [tripId]/
│   │   │       └── page.tsx
│   │   └── api/
│   │       └── trips/
│   ├── components/
│   │   ├── ui/
│   │   ├── trip/
│   │   ├── itinerary/
│   │   ├── map/
│   │   └── forms/
│   ├── lib/
│   │   ├── store.ts
│   │   ├── mapbox.ts
│   │   ├── utils.ts
│   │   └── types.ts
│   └── styles/
│       └── globals.css
├── public/
├── prisma/
├── .env.local.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 13. Milestones

### Milestone 1: Project Setup
- [ ] Initialize Next.js project
- [ ] Configure Tailwind
- [ ] Set up project structure
- [ ] Add dependencies

### Milestone 2: Trip Management
- [ ] Create trip form
- [ ] List all trips
- [ ] Trip detail view

### Milestone 3: Itinerary Core
- [ ] Day structure
- [ ] Activity CRUD
- [ ] Drag-and-drop reordering

### Milestone 4: Travel Data
- [ ] Flight entry form & display
- [ ] Hotel entry form & display
- [ ] Link flights/hotels to days

### Milestone 5: Map Integration
- [ ] Mapbox setup
- [ ] Display activities on map
- [ ] Route generation
- [ ] Navigation between points

### Milestone 6: Polish
- [ ] Responsive design
- [ ] Animations
- [ ] Data persistence
- [ ] Performance optimization

---

## 14. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Load | < 3s | Lighthouse performance |
| Drag Response | < 100ms | UX testing |
| Map Load | < 2s | Network tab |
| Time to First Action | < 30s | User testing |
| Offline Support | Works offline | PWA audit |

---

## 15. Future Considerations

### Phase 2+ Ideas
- **AI Trip Planner:** Generate itinerary from destination + dates + preferences
- **Weather Integration:** Show weather forecast on each day
- **Budget Tracker:** Track spending across categories
- **Collaborative Editing:** Share trips with travel companions
- **Photo Gallery:** Attach photos to activities
- **Packing List:** Generate from activities
- **Calendar Export:** iCal/Google Calendar sync
- **PDF Export:** Beautiful printable itinerary
- **Mobile App:** React Native or Flutter
- **Flight Alerts:** Integration with flight tracking APIs

---

*PRD Version: 1.0*
*Created: 2026-03-17*
*Author: Javis (Nexus Labs)*
*Status: Ready for Feature Breakdown*
