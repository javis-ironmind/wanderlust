'use client';

import { useState, useRef, useEffect } from 'react';
import { ActivityCategory } from '@/lib/types';

// Category metadata with colors and icons
const CATEGORY_CONFIG: Record<ActivityCategory, { label: string; color: string; icon: string }> = {
  flight: { label: 'Flight', color: '#3B82F6', icon: '✈️' },
  hotel: { label: 'Hotel', color: '#8B5CF6', icon: '🏨' },
  restaurant: { label: 'Restaurant', color: '#F59E0B', icon: '🍽️' },
  attraction: { label: 'Attraction', color: '#EF4444', icon: '🎭' },
  activity: { label: 'Activity', color: '#10B981', icon: '🎯' },
  transport: { label: 'Transport', color: '#6366F1', icon: '🚗' },
  shopping: { label: 'Shopping', color: '#EC4899', icon: '🛍️' },
  entertainment: { label: 'Entertainment', color: '#F97316', icon: '🎬' },
  other: { label: 'Other', color: '#6B7280', icon: '📌' },
};

export const ALL_CATEGORIES: ActivityCategory[] = [
  'flight', 'hotel', 'restaurant', 'attraction', 'activity',
  'transport', 'shopping', 'entertainment', 'other'
];

interface CategoryFilterProps {
  selectedCategories: ActivityCategory[];
  onSelectionChange: (categories: ActivityCategory[]) => void;
  categoryCounts: Record<ActivityCategory, number>;
}

export function CategoryFilter({
  selectedCategories,
  onSelectionChange,
  categoryCounts,
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryToggle = (category: ActivityCategory) => {
    if (selectedCategories.includes(category)) {
      onSelectionChange(selectedCategories.filter(c => c !== category));
    } else {
      onSelectionChange([...selectedCategories, category]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange([]);
  };

  const handleClearAll = () => {
    onSelectionChange([...ALL_CATEGORIES]);
  };

  const totalActivities = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
  const filteredCount = selectedCategories.length === 0 || selectedCategories.length === ALL_CATEGORIES.length
    ? totalActivities
    : selectedCategories.reduce((sum, cat) => sum + (categoryCounts[cat] || 0), 0);

  const hasActiveFilter = selectedCategories.length > 0 && selectedCategories.length < ALL_CATEGORIES.length;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', zIndex: 50 }}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: hasActiveFilter ? '#3B82F6' : '#374151',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'all 0.2s',
        }}
      >
        <span>🔍</span>
        <span>Filter</span>
        {hasActiveFilter && (
          <span style={{
            background: 'white',
            color: '#3B82F6',
            borderRadius: '10px',
            padding: '0.125rem 0.5rem',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}>
            {filteredCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '0.5rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          minWidth: '280px',
          padding: '0.75rem',
          zIndex: 100,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem',
            borderBottom: '1px solid #E5E7EB',
            marginBottom: '0.5rem',
          }}>
            <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
              Filter by Category
            </span>
            {hasActiveFilter && (
              <button
                onClick={handleSelectAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3B82F6',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                Show All
              </button>
            )}
          </div>

          {/* Category List */}
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {ALL_CATEGORIES.map((category) => {
              const config = CATEGORY_CONFIG[category];
              const count = categoryCounts[category] || 0;
              const isSelected = !selectedCategories.includes(category);

              return (
                <label
                  key={category}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.5rem',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F3F4F6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCategoryToggle(category)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: config.color,
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '1.25rem' }}>{config.icon}</span>
                  <span style={{
                    flex: 1,
                    color: '#374151',
                    fontSize: '0.875rem',
                  }}>
                    {config.label}
                  </span>
                  <span style={{
                    background: count > 0 ? '#E5E7EB' : 'transparent',
                    color: count > 0 ? '#6B7280' : '#9CA3AF',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}>
                    {count}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Footer */}
          {selectedCategories.length > 0 && (
            <div style={{
              marginTop: '0.5rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid #E5E7EB',
            }}>
              <button
                onClick={handleClearAll}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to filter activities by categories
export function filterActivitiesByCategory<T extends { category: ActivityCategory }>(
  activities: T[],
  selectedCategories: ActivityCategory[]
): T[] {
  if (selectedCategories.length === 0 || selectedCategories.length === ALL_CATEGORIES.length) {
    return activities;
  }
  return activities.filter(activity => !selectedCategories.includes(activity.category));
}

// Get category counts from activities
export function getCategoryCounts(activities: { category: ActivityCategory }[]): Record<ActivityCategory, number> {
  const counts: Record<ActivityCategory, number> = {
    flight: 0,
    hotel: 0,
    restaurant: 0,
    attraction: 0,
    activity: 0,
    transport: 0,
    shopping: 0,
    entertainment: 0,
    other: 0,
  };
  
  activities.forEach(activity => {
    counts[activity.category]++;
  });
  
  return counts;
}

export default CategoryFilter;
