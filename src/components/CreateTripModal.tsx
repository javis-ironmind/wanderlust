'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Image, FileText, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTripStore } from '@/lib/store';
import { Trip, Day } from '@/lib/types';

interface CreateTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTripModal({ open, onOpenChange }: CreateTripModalProps) {
  const router = useRouter();
  const addTrip = useTripStore((state) => state.addTrip);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a trip name');
      return;
    }

    if (!startDate || !endDate) {
      setError('Please select start and end dates');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be after start date');
      return;
    }

    // Generate days between start and end dates
    const days: Day[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push({
        id: `day-${d.toISOString().split('T')[0]}`,
        date: d.toISOString().split('T')[0],
        activities: [],
        location: name,
      });
    }

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      startDate,
      endDate,
      coverImage: coverImage.trim() || undefined,
      days,
      flights: [],
      hotels: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTrip(newTrip);
    handleClose();
    router.push(`/trips/${newTrip.id}`);
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setCoverImage('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-[0_24px_48px_rgba(14,29,37,0.12)]">
        <DialogHeader className="text-center mb-8">
          <DialogTitle className="text-3xl font-serif font-bold text-[#0e1d25] tracking-tight text-center">
            Begin a New Chapter
          </DialogTitle>
          <DialogDescription className="text-secondary mt-2 italic">
            Where will your curiosity lead you next?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Trip Name */}
          <div className="space-y-2">
            <label className="block font-serif font-bold text-lg text-[#0e1d25]" htmlFor="trip-name">
              Trip Name
            </label>
            <Input
              id="trip-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Whispers of Kyoto"
              className="w-full bg-[#e7f6ff] border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-[#9b3f25] focus:bg-white transition-all placeholder:text-secondary/40"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-serif font-bold text-lg text-[#0e1d25]" htmlFor="start-date">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#e7f6ff] border-none rounded-lg pl-10 pr-4 py-3 focus:ring-1 focus:ring-[#9b3f25] focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-serif font-bold text-lg text-[#0e1d25]" htmlFor="end-date">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#e7f6ff] border-none rounded-lg pl-10 pr-4 py-3 focus:ring-1 focus:ring-[#9b3f25] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="block font-serif font-bold text-lg text-[#0e1d25]">
              Cover Image URL
            </label>
            <div className="flex items-center gap-4">
              <div className="relative flex-grow">
                <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <Input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://unsplash.com/..."
                  className="w-full bg-[#e7f6ff] border-none rounded-lg pl-10 pr-4 py-3 focus:ring-1 focus:ring-[#9b3f25] focus:bg-white transition-all placeholder:text-secondary/40"
                />
              </div>
              {coverImage && (
                <div className="w-14 h-14 rounded-lg bg-[#daebf5] flex items-center justify-center border border-[#ddc0b9]/20 overflow-hidden">
                  <img
                    src={coverImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block font-serif font-bold text-lg text-[#0e1d25]" htmlFor="description">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly capture the spirit of this journey..."
              rows={4}
              className="w-full bg-[#e7f6ff] border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-[#9b3f25] focus:bg-white transition-all placeholder:text-secondary/40 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row-reverse gap-4 pt-4">
            <Button
              type="submit"
              className="w-full md:w-auto px-10 py-4 bg-gradient-to-br from-[#9b3f25] to-[#bb563b] text-white rounded-full font-bold shadow-lg shadow-[#9b3f25]/20 active:scale-95 transition-transform"
            >
              Create Trip
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full md:w-auto px-10 py-4 border-2 border-[#ddc0b9]/50 text-[#9b3f25] rounded-full font-bold hover:bg-[#9b3f25]/5 active:scale-95 transition-all"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
