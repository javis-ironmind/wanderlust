// Unified category colors matching PRD palette
export const CATEGORY_COLORS: Record<string, string> = {
  flight: '#3B82F6',       // blue
  hotel: '#8B5CF6',        // purple
  restaurant: '#F97316',  // warm orange (secondary)
  attraction: '#EF4444',  // red
  activity: '#10B981',    // green (success)
  transport: '#06B6D4',   // cyan
  shopping: '#EC4899',     // pink
  entertainment: '#F97316', // orange
  other: '#6B7280'        // gray
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.other;
}
