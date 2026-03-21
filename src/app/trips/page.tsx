'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, BookOpen, Plus, Share2, Users, ChevronRight, Calendar, Lightbulb } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { BottomNav } from '@/components/BottomNav';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { CreateTripModal } from '@/components/CreateTripModal';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useTripStore } from '@/lib/store';

type SortOption = 'upcoming' | 'date-newest' | 'date-oldest' | 'name-az' | 'name-za';

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  vacation: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  business: { bg: 'bg-blue-100', text: 'text-blue-700' },
  weekend: { bg: 'bg-purple-100', text: 'text-purple-700' },
  adventure: { bg: 'bg-amber-100', text: 'text-amber-700' },
  family: { bg: 'bg-pink-100', text: 'text-pink-700' },
  honeymoon: { bg: 'bg-red-100', text: 'text-red-700' },
  friends: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  solo: { bg: 'bg-teal-100', text: 'text-teal-700' },
};

export default function TripsPage() {
  const trips = useTripStore((state) => state.trips);
  const deleteTrip = useTripStore((state) => state.deleteTrip);
  const archiveTrip = useTripStore((state) => state.archiveTrip);
  const unarchiveTrip = useTripStore((state) => state.unarchiveTrip);
  const fetchTripsFromAPI = useTripStore((state) => state.fetchTripsFromAPI);
  const isInitialized = useTripStore((state) => state.isInitialized);

  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('upcoming');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const router = useRouter();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loadTrips = useCallback(async () => {
    if (typeof window !== 'undefined' && mountedRef.current) {
      // Fetch from API first, falls back to localStorage
      await fetchTripsFromAPI();
      setLoading(false);
    }
  }, [fetchTripsFromAPI]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const filteredTrips = trips
    .filter(trip =>
      !trip.archived &&
      (searchQuery.trim() === '' || trip.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (categoryFilter === 'all' || (trip.categories && trip.categories.includes(categoryFilter)))
    )
    .sort((a, b) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const daysUntilA = Math.ceil((new Date(a.startDate).setHours(0, 0, 0, 0) - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysUntilB = Math.ceil((new Date(b.startDate).setHours(0, 0, 0, 0) - now.getTime()) / (1000 * 60 * 60 * 24));
      switch (sortBy) {
        case 'upcoming': return daysUntilA - daysUntilB;
        case 'date-newest': return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'date-oldest': return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'name-az': return a.name.localeCompare(b.name);
        case 'name-za': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

  const featuredTrip = filteredTrips.find(trip => {
    const now = new Date();
    const endDate = new Date(trip.endDate);
    return endDate >= now;
  });

  const regularTrips = filteredTrips.filter(t => t.id !== featuredTrip?.id);

  const handleDelete = (tripId: string) => {
    deleteTrip(tripId);
    setShowDeleteConfirm(null);
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    if (startDate.getFullYear() !== endDate.getFullYear()) {
      return `${startDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
    }
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4faff] flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4faff]">
      <Navigation />

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="font-serif text-5xl md:text-6xl text-[#0e1d25] leading-tight mb-4">
            Your Curated <span className="italic text-[#9b3f25]">Journeys</span>
          </h1>
          <p className="text-lg text-[#56423d] leading-relaxed opacity-80 max-w-2xl">
            Welcome back, wanderer. Your upcoming adventures and past memories, organized in one beautiful journal.
          </p>
        </div>

        {/* Search and Filter Bar */}
        {trips.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#ddc0b9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9b3f25]/20 text-[#0e1d25] placeholder:text-slate-400"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-3 bg-white border border-[#ddc0b9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9b3f25]/20 text-[#0e1d25] min-w-[160px]"
            >
              <option value="upcoming">Upcoming</option>
              <option value="date-newest">Date (Newest)</option>
              <option value="date-oldest">Date (Oldest)</option>
              <option value="name-az">Name (A-Z)</option>
              <option value="name-za">Name (Z-A)</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-[#ddc0b9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9b3f25]/20 text-[#0e1d25] min-w-[140px]"
            >
              <option value="all">All Categories</option>
              <option value="vacation">Vacation</option>
              <option value="business">Business</option>
              <option value="weekend">Weekend</option>
              <option value="adventure">Adventure</option>
              <option value="family">Family</option>
              <option value="honeymoon">Honeymoon</option>
              <option value="friends">Friends</option>
              <option value="solo">Solo</option>
            </select>
          </div>
        )}

        {trips.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-[#e0e5cc] rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-12 h-12 text-[#5c614d]" />
            </div>
            <h2 className="font-serif text-3xl text-[#0e1d25] mb-2">Begin Your Journey</h2>
            <p className="text-[#56423d] mb-8 max-w-md">
              Your travel journal is empty. Start by creating your first trip and let the adventures unfold.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-br from-[#9b3f25] to-[#bb563b] text-white rounded-full font-bold shadow-lg shadow-[#9b3f25]/20 active:scale-95 transition-transform flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Trip
            </button>
          </div>
        ) : filteredTrips.length === 0 ? (
          /* No Results */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h2 className="font-serif text-2xl text-[#0e1d25] mb-2">No trips found</h2>
            <p className="text-[#56423d] mb-4">No trips match &ldquo;{searchQuery}&rdquo;</p>
            <button
              onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
              className="text-[#9b3f25] font-medium hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          /* Bento Grid Dashboard */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Featured Trip Card */}
            {featuredTrip && (
              <div
                className="md:col-span-8 group relative overflow-hidden rounded-xl bg-white editorial-shadow cursor-pointer"
                onClick={() => router.push(`/trips/${featuredTrip.id}`)}
              >
                <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
                  <img
                    src={featuredTrip.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200'}
                    alt={featuredTrip.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 text-white w-full flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium uppercase tracking-widest">Upcoming</span>
                    </div>
                    <h2 className="font-serif text-4xl mb-1">{featuredTrip.name}</h2>
                    <p className="text-white/80 font-medium">{formatDateRange(featuredTrip.startDate, featuredTrip.endDate)}</p>
                  </div>
                  <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="md:col-span-4 bg-[#e0e5cc] rounded-xl p-8 flex flex-col justify-between">
              <div>
                <BookOpen className="w-12 h-12 text-[#5c614d] mb-4" />
                <h3 className="font-serif text-2xl text-[#0e1d25] font-bold leading-tight">Document Your Essence</h3>
              </div>
              <p className="text-[#626753] leading-relaxed mt-4">
                Every journey is a story waiting to be told. Keep your memories tactile and timeless.
              </p>
            </div>

            {/* Trip Cards */}
            {regularTrips.map(trip => (
              <div
                key={trip.id}
                className="md:col-span-4 group rounded-xl bg-white editorial-shadow overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                onClick={() => router.push(`/trips/${trip.id}`)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={trip.coverImage || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600'}
                    alt={trip.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-2xl text-[#0e1d25]">{trip.name}</h3>
                    <div className="flex gap-1">
                      {trip.categories?.slice(0, 2).map(cat => {
                        const colors = CATEGORY_COLORS[cat] || { bg: 'bg-slate-100', text: 'text-slate-700' };
                        return (
                          <span key={cat} className={`px-2 py-0.5 ${colors.bg} ${colors.text} text-[10px] font-bold rounded-md uppercase tracking-tight`}>
                            {cat}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-sm text-[#56423d]">{formatDateRange(trip.startDate, trip.endDate)}</p>
                </div>
              </div>
            ))}

            {/* Add New Memory Card */}
            <div
              className="md:col-span-4 border-2 border-dashed border-[#ddc0b9]/30 rounded-xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-[#e7f6ff] transition-colors"
              onClick={() => setShowCreateModal(true)}
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Plus className="w-8 h-8 text-[#9b3f25]" />
              </div>
              <h3 className="font-serif text-xl text-[#0e1d25]">Start a new journal</h3>
              <p className="text-sm text-[#56423d] mt-2">Where will your next story begin?</p>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      {trips.length > 0 && (
        <FloatingActionButton
          onClick={() => setShowCreateModal(true)}
          label="Create New Trip"
        />
      )}

      {/* Create Trip Modal */}
      <CreateTripModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      <BottomNav />

      <OfflineIndicator />
    </div>
  );
}
