# Wanderlust UX Design Document

## Reference Screenshots
See `ux-reference-wanderlog-overview.jpg`, `ux-reference-wanderlog-itinerary.jpg`, and `ux-reference-wanderlog-places.jpg` in this folder.

## Design Inspiration: Wanderlog App

The UI should match Wanderlog's clean, polished aesthetic:

### Color Palette
- **Primary Background**: White (#FFFFFF)
- **Text Primary**: Black (#000000)
- **Text Secondary**: Gray (#666666)
- **Accent**: Blue (#3B82F6)
- **Tabs Active**: Red underline indicator
- **Cards**: White with subtle shadow
- **Floating Buttons**: Black and Purple

### Typography
- Clean sans-serif (system fonts)
- Bold headings
- Medium weight for labels

### Layout Structure

#### 1. Trip Detail Page (Main Screen)
```
┌─────────────────────────────────┐
│ [Status Bar - phone]            │
├─────────────────────────────────┤
│ [Hero Image - trip cover]       │
│   [Home] [Image] [Download]     │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Trip Title                 │ │
│ │ Dates | Collaborators       │ │
│ │ [Share] [Options ...]      │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [Overview] [Itinerary] [Explore│
│ [$] [Journal]        [☰]       │
├─────────────────────────────────┤
│ Progress: "Proficient" 9/12    │
│ ████████░░░░░░░░               │
├─────────────────────────────────┤
│ ┌────────────┐ ┌────────────┐   │
│ │Explore    │ │Add section │   │
│ │things to  │ │            │   │
│ │do → Start │ │            │   │
│ └────────────┘ └────────────┘   │
├─────────────────────────────────┤
│ [✈️ Flight] [🛏️ Hotel] [🚗 Car]│
│ [🍽️ Restaurant] [📎] [···]     │
├─────────────────────────────────┤
│ ▼ Notes                         │
├─────────────────────────────────┤
│ ▼ Places to visit               │
│   1. [img] Place Name          │
│   2. [img] Place Name          │
├─────────────────────────────────┤
│                    [+][🗺️][🤖]  │ ← FAB
└─────────────────────────────────┘
```

#### 2. Itinerary Tab
```
┌─────────────────────────────────┐
│ [◀ Back]  [Trip to California] │
├─────────────────────────────────┤
│ Sunday 3/29    ▼ (collapsed)    │
│ Monday 3/30    ▼ (collapsed)   │
│ Tuesday 3/31  ▶ (expanded)     │
│   ┌─────────────────────────┐  │
│   │ + Add a place            │  │
│   │ [Auto-fill] [Optimize]  │  │
│   └─────────────────────────┘  │
│ Wednesday 4/1 ▼ (collapsed)    │
│ Thursday 4/2  ▼ (collapsed)    │
├─────────────────────────────────┤
│ ⚠️ No lodging booked           │
│ [Book hotels]                  │
├─────────────────────────────────┤
│                    [+][🗺️][🤖]  │
└─────────────────────────────────┘
```

### Key Components

#### 1. Trip Card (on Trips list)
- Cover image (hero)
- Trip name (bold)
- Date range
- Collaborator avatars
- Share button

#### 2. Tab Navigation
- Horizontal scrollable tabs
- Red underline on active
- Icons + text labels

#### 3. Day Sections (Itinerary)
- Collapsible with ▼ / ▶
- Shows date and activity count
- "Add a place" input when expanded

#### 4. Activity Item
- Drag handle (≡)
- Time (optional)
- Place name
- Category icon
- Thumbnail image

#### 5. Floating Action Buttons (FAB)
- Bottom right corner
- Main: Black "+" for adding
- Secondary: Map view (black)
- Tertiary: AI/Magic (purple)

#### 6. Reservation Icons Row
- Flight ✈️
- Hotel 🛏️
- Car 🚗
- Restaurant 🍽️
- Attachment 📎
- More ⋯

### Interactions
- Pull to refresh
- Swipe between days
- Long press to reorder
- Tap to expand/collapse

## Implementation Priority
1. Trip detail page with tabs
2. Day/activity cards
3. Collapsible sections
4. FAB buttons
5. Reservation icons

## Mobile-First
- Start with mobile layout
- Then tablet/desktop enhancements

## Future Features
- Import from Markdown/Notion
- Export to PDF/Calendar
- AI trip generation
