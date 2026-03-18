// Markdown parser for trip itineraries
// Supports: ## Day 1, ## Day 1 - Title, - Activity at time

export interface ParsedActivity {
  title: string;
  time?: string;
  category?: string;
}

export interface ParsedDay {
  id: string;
  title: string;
  date?: string;
  activities: ParsedActivity[];
}

export interface ParsedTrip {
  title?: string;
  days: ParsedDay[];
}

export function parseMarkdownToTrip(md: string): ParsedTrip {
  const lines = md.split('\n');
  const result: ParsedTrip = { days: [] };
  
  let currentDay: ParsedDay | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Day header: ## Day 1 or ## Day 1 - Title
    if (trimmed.match(/^##\s+Day\s+\d+/i)) {
      if (currentDay) {
        result.days.push(currentDay);
      }
      
      const title = trimmed.replace(/^##\s+Day\s+\d+\s*-?\s*/i, '');
      const dayNum = trimmed.match(/Day\s+(\d+)/i)?.[1] || '';
      
      currentDay = {
        id: `day-${dayNum || Date.now()}`,
        title: title || `Day ${dayNum}`,
        activities: [],
      };
      continue;
    }
    
    // Activity item: - Activity name at 2pm
    if (trimmed.match(/^-\s+/) && currentDay) {
      const activityText = trimmed.replace(/^-\s+/, '');
      
      // Extract time: "at 2pm", "at 10:00 AM", etc.
      const timeMatch = activityText.match(/\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
      const time = timeMatch ? timeMatch[1] : undefined;
      const title = activityText.replace(/\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i, '').trim();
      
      // Detect category from keywords
      let category = 'activity';
      const lower = title.toLowerCase();
      if (lower.includes('flight') || lower.includes('arrive') || lower.includes('depart')) category = 'flight';
      else if (lower.includes('hotel') || lower.includes('check') || lower.includes('lodg')) category = 'hotel';
      else if (lower.includes('restaurant') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('breakfast')) category = 'restaurant';
      else if (lower.includes('museum') || lower.includes('visit') || lower.includes('tour')) category = 'attraction';
      else if (lower.includes('car') || lower.includes('drive') || lower.includes('rental')) category = 'transport';
      
      currentDay.activities.push({ title: title || activityText, time, category });
    }
  }
  
  // Push last day
  if (currentDay) {
    result.days.push(currentDay);
  }
  
  return result;
}

// Generate sample markdown template
export function getMarkdownTemplate(): string {
  return `# Trip to ${'{destination}'}

## Day 1 - Arrival
- Arrive at hotel at 3pm
- Check-in and settle in
- Dinner at local restaurant at 7pm

## Day 2 - Exploring
- Breakfast at hotel at 8am
- Visit ${'{attraction_name}'} at 10am
- Lunch at 12pm
- Explore the city area
- Dinner at 7pm

## Day 3 - Adventure
- Full day at ${'{destination}'}
- Activities to be determined
- Evening free

## Day 4 - Departure
- Breakfast at 8am
- Check-out by 11am
- Head to airport for departure
`;
}
