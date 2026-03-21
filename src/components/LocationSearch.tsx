/**
 * LocationSearch Component
 * Autocomplete location search using Nominatim API (free geocoding)
 *
 * Features:
 * - Debounced search (300ms)
 * - Autocomplete dropdown with results
 * - Loading and error states
 * - Manual address entry fallback
 * - Clear button
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, X, AlertCircle, History } from 'lucide-react';
import { getOSMSearch } from '@/lib/place-search-osm';
import { PlaceResult } from '@/lib/place-search';

const RECENT_SEARCHES_KEY = 'wanderlust-recent-location-searches';
const MAX_RECENT_SEARCHES = 5;

// Load recent searches from localStorage
function loadRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save recent searches to localStorage
function saveRecentSearches(searches: string[]) {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    // localStorage might be full or unavailable
  }
}

interface LocationSearchProps {
  value?: {
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  onChange: (location: {
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
  } | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function LocationSearch({
  value,
  onChange,
  placeholder = 'Search for a location...',
  disabled = false
}: LocationSearchProps) {
  const [query, setQuery] = useState(value?.name || '');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<PlaceResult | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    setRecentSearches(loadRecentSearches());
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const searchQuery = query.trim();
    
    // Clear results if query is empty
    if (!searchQuery) {
      setResults([]);
      setIsOpen(false);
      setError(null);
      return;
    }

    // Don't search if we've already selected a result that matches
    if (selectedResult && (
      selectedResult.address.includes(searchQuery) ||
      searchQuery.length < 3
    )) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (searchQuery.length < 3) return;

      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await getOSMSearch().search(searchQuery);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
      } catch {
        setError('Failed to search. Try a different query.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, selectedResult]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((result: PlaceResult) => {
    const location = {
      name: result.name,
      address: result.address,
      latitude: result.latitude,
      longitude: result.longitude,
    };

    setQuery(result.name);
    setSelectedResult(result);
    setIsOpen(false);
    setResults([]);
    onChange(location);

    // Save to recent searches (AC10)
    const searchTerm = result.address;
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    saveRecentSearches(updated);
  }, [onChange, recentSearches]);

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setSelectedResult(null);
    setIsOpen(false);
    setError(null);
    onChange(undefined);
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelect(results[0]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, [results, handleSelect]);

  const handleManualEntry = useCallback(() => {
    if (!query.trim()) return;
    
    const location = {
      name: query.trim(),
      address: query.trim(),
    };
    
    setSelectedResult(null);
    onChange(location);
    setIsOpen(false);
  }, [query, onChange]);

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedResult(null);
            if (error) setError(null);
          }}
          onFocus={() => {
            if (results.length > 0 || recentSearches.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
        />
        
        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:hover:text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-1 flex items-center gap-1 text-red-500 text-xs">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-start gap-2 border-b border-gray-100 last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {result.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {result.address}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Recent Searches - AC10 */}
      {isOpen && results.length === 0 && recentSearches.length > 0 && !isLoading && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
            Recent Searches
          </div>
          {recentSearches.map((search, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(search);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-start gap-2 border-b border-gray-100 last:border-b-0"
            >
              <History className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">{search.split(',')[0]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Manual Entry Option */}
      {query.trim().length >= 3 && !isLoading && results.length === 0 && !error && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <button
            type="button"
            onClick={handleManualEntry}
            className="w-full text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-2 rounded"
          >
            Use &quot;<span className="font-medium">{query}</span>&quot; as manual address
          </button>
        </div>
      )}

      {/* Selected Location Display */}
      {value && !isOpen && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <MapPin className="w-4 h-4 text-green-500" />
          <span className="truncate">{value.name}</span>
        </div>
      )}
    </div>
  );
}
