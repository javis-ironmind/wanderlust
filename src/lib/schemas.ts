import { z } from 'zod';

export const flightSchema = z.object({
  airline: z.string().min(1, 'Airline is required'),
  flightNumber: z.string().min(1, 'Flight number is required'),
  departureAirport: z.string().min(1, 'Departure airport is required'),
  departureCity: z.string().optional(),
  departureTime: z.string().optional(),
  arrivalAirport: z.string().min(1, 'Arrival airport is required'),
  arrivalCity: z.string().optional(),
  arrivalTime: z.string().optional(),
  terminal: z.string().optional(),
  gate: z.string().optional(),
  seat: z.string().optional(),
  confirmationNumber: z.string().optional(),
  cost: z.string().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
});

export const hotelSchema = z.object({
  name: z.string().min(1, 'Hotel name is required'),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkInTime: z.string().optional(),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  checkOutTime: z.string().optional(),
  confirmationNumber: z.string().optional(),
  roomType: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  website: z.string().url('Invalid URL').or(z.literal('')).optional(),
  cost: z.string().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => !data.checkOutDate || !data.checkInDate || new Date(data.checkOutDate) > new Date(data.checkInDate),
  { message: 'Check-out must be after check-in', path: ['checkOutDate'] }
);

export const activitySchema = z.object({
  title: z.string().min(1, 'Activity title is required'),
  description: z.string().optional(),
  category: z.enum(['flight', 'hotel', 'restaurant', 'attraction', 'activity', 'transport', 'shopping', 'entertainment', 'other']),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.object({
    name: z.string(),
    address: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    placeId: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
  cost: z.number().optional(),
  currency: z.string().default('USD'),
  confirmationNumber: z.string().optional(),
  url: z.string().url().optional().or(z.string().optional()),
  imageUrl: z.string().optional(),
  order: z.number(),
});

export const tripSchema = z.object({
  name: z.string().min(1, 'Trip name is required'),
  description: z.string().optional(),
  coverImage: z.string().url().optional().or(z.string().optional()),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  categories: z.array(z.string()).optional(),
});

export type FlightFormData = z.infer<typeof flightSchema>;
export type HotelFormData = z.infer<typeof hotelSchema>;
export type ActivityFormData = z.infer<typeof activitySchema>;
export type TripFormData = z.infer<typeof tripSchema>;
