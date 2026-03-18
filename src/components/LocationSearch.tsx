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
import { Search, MapPin, Loader2, X, AlertCircle } from 'lucide-react';

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  class?: string;
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
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<NominatimResult | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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
      selectedResult.display_name.includes(searchQuery) ||
      searchQuery.length < 3
    )) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (searchQuery.length < 3) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'Wanderlust-Travel-Planner/1.0',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Search failed');
        }
        
        const data: NominatimResult[] = await response.json();
        setResults(data);
        setIsOpen(data.length > 0);
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

  const handleSelect = useCallback((result: NominatimResult) => {
    const location = {
      name: result.display_name.split(',')[0] || result.display_name,
      address: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
    
    setQuery(result.display_name.split(',')[0] || result.display_name);
    setSelectedResult(result);
    setIsOpen(false);
    setResults([]);
    onChange(location);
  }, [onChange]);

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
            if (results.length > 0) setIsOpen(true);
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
              key={result.place_id}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-start gap-2 border-b border-gray-100 last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {result.display_name.split(',')[0]}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {result.display_name.split(',').slice(1).join(',').trim()}
                </div>
                {result.type && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    {result.type}
                  </span>
                )}
              </div>
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
