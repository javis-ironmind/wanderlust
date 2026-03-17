# Feature F012: Activity Categories

## Description

Categorize activities with consistent icons, colors, and filtering. Categories include transport, food, sightseeing, activity, accommodation, shopping, and other.

## Implementation

### Categories
```typescript
type ActivityCategory = 
  | 'transport'    // ✈️ Flights, trains, buses, cars
  | 'food'         // 🍽️ Restaurants, cafes, bars
  | 'sightseeing'  // 🏯 Museums, landmarks, tours
  | 'activity'     // 🎭 Shows, sports, experiences
  | 'accommodation' // 🏨 Hotels, hostels, Airbnb
  | 'shopping'     // 🛍️ Markets, stores
  | 'other';      // 📌 Miscellaneous
```

### Components Needed
- `CategoryBadge` - Colored category pill
- `CategoryIcon` - Icon component
- `CategoryFilter` - Filter sidebar/popover
- `CategoryStats` - Time/cost by category

### Visual Design
- Each category has distinct color
- Icon matches category meaning
- Filter shows count per category

## Acceptance Criteria
- [ ] AC1 - Can assign category to any activity
- [ ] AC2 - Category shown as colored badge on activity card
- [ ] AC3 - Category icon displayed on map markers
- [ ] AC4 - Can filter activities by category
- [ ] AC5 - Filter shows activity count per category
- [ ] AC6 - Category colors consistent throughout app
- [ ] AC7 - Default category is "other" for new activities
- [ ] AC8 - Category stats show time spent per category
- [ ] AC9 - Empty categories handled gracefully
- [ ] AC10 - Category accessible on mobile (tap to change)
