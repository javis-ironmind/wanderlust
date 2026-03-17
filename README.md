# Wanderlust - Travel Planning App

A comprehensive travel planning application inspired by [Wanderlog](https://wanderlog.com), built with Next.js, TypeScript, Tailwind CSS, and Mapbox.

## Features

### Core Itinerary Management
- **Trip Management** - Create, edit, delete trips with cover images, dates, and descriptions
- **Day Structure** - Auto-generated days based on trip dates, with ability to add extra days
- **Activity Planning** - Add activities with time, location, category, notes, and cost

### Drag & Drop
- Reorder activities within a day
- Move activities between days
- Intuitive drag handles and visual feedback

### Travel Data
- **Flight Tracking** - Store airline, flight number, times, terminals, gates, confirmation numbers
- **Hotel Management** - Store hotel details, addresses, check-in/out times, confirmation

### Map Integration
- **Visual Map View** - See all activities on an interactive map
- **Route Navigation** - Generate routes between daily activities
- **Location Search** - Autocomplete addresses via Mapbox Geocoding

### Additional Features
- Activity Categories - Color-coded categories (transport, food, sightseeing, etc.)
- Trip Timeline - Horizontal timeline view of the entire trip
- Data Persistence - Local storage with auto-save
- Export/Import - JSON backup and restore

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Maps | Mapbox GL JS, react-map-gl |
| Drag & Drop | @dnd-kit |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Date Handling | date-fns |

## Project Structure

```
wanderlust/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   │   ├── ui/       # Base UI components
│   │   ├── trip/     # Trip-related components
│   │   ├── itinerary/# Itinerary components
│   │   ├── map/      # Map components
│   │   └── forms/    # Form components
│   └── lib/          # Utilities, store, types
├── public/            # Static assets
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Mapbox account (free tier)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

4. Add your Mapbox token to `.env.local`:
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
   ```

5. Run development server:
   ```bash
   npm run dev
   ```

### Build for Production

```bash
npm run build
npm start
```

## Deployment

Deploy to Vercel:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Features Status

| Feature | Status |
|---------|--------|
| F001: Trip Management | Planned |
| F002: Day Structure | Planned |
| F003: Activity Items | Planned |
| F004: Drag & Drop | Planned |
| F005: Flight Tracking | Planned |
| F006: Hotel Tracking | Planned |
| F007: Map View | Planned |
| F008: Route Navigation | Planned |
| F009: Location Search | Planned |
| F010: Data Persistence | Planned |
| F011: Trip Timeline | Planned |
| F012: Activity Categories | Planned |

## Stories

The project is broken into 20+ implementable stories. See `/stories/` directory for details.

## License

MIT

---

Built with ❤️ using Next.js and Mapbox
