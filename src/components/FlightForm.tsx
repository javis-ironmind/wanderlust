'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plane, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Flight } from '@/lib/types';
import { useTripStore } from '@/lib/store';
import { flightSchema, FlightFormData } from '@/lib/schemas';

// Common airlines for autocomplete
const AIRLINES = [
  { code: 'AA', name: 'American Airlines' },
  { code: 'UA', name: 'United Airlines' },
  { code: 'DL', name: 'Delta Air Lines' },
  { code: 'WN', name: 'Southwest Airlines' },
  { code: 'B6', name: 'JetBlue Airways' },
  { code: 'AS', name: 'Alaska Airlines' },
  { code: 'NK', name: 'Spirit Airlines' },
  { code: 'F9', name: 'Frontier Airlines' },
  { code: 'BA', name: 'British Airways' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'AF', name: 'Air France' },
  { code: 'KL', name: 'KLM Royal Dutch' },
  { code: 'EK', name: 'Emirates' },
  { code: 'QR', name: 'Qatar Airways' },
  { code: 'SQ', name: 'Singapore Airlines' },
  { code: 'CX', name: 'Cathay Pacific' },
  { code: 'JL', name: 'Japan Airlines' },
  { code: 'NH', name: 'All Nippon Airways' },
  { code: 'AC', name: 'Air Canada' },
  { code: 'QF', name: 'Qantas' },
];

// Major airports with IATA codes
const AIRPORTS = [
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
  { code: 'ORD', name: "O'Hare International", city: 'Chicago' },
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas' },
  { code: 'DEN', name: 'Denver International', city: 'Denver' },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco' },
  { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle' },
  { code: 'LAS', name: 'Harry Reid International', city: 'Las Vegas' },
  { code: 'MCO', name: 'Orlando International', city: 'Orlando' },
  { code: 'MIA', name: 'Miami International', city: 'Miami' },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta', city: 'Atlanta' },
  { code: 'BOS', name: 'Logan International', city: 'Boston' },
  { code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix' },
  { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston' },
  { code: 'MSP', name: 'Minneapolis-St Paul', city: 'Minneapolis' },
  { code: 'DTW', name: 'Detroit Metropolitan', city: 'Detroit' },
  { code: 'PHL', name: 'Philadelphia International', city: 'Philadelphia' },
  { code: 'LGA', name: 'LaGuardia', city: 'New York' },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale' },
  { code: 'BWI', name: 'Baltimore/Washington International', city: 'Baltimore' },
  { code: 'DCA', name: 'Ronald Reagan Washington National', city: 'Washington DC' },
  { code: 'SLC', name: 'Salt Lake City International', city: 'Salt Lake City' },
  { code: 'SAN', name: 'San Diego International', city: 'San Diego' },
  { code: 'TPA', name: 'Tampa International', city: 'Tampa' },
  { code: 'PDX', name: 'Portland International', city: 'Portland' },
  { code: 'HNL', name: 'Daniel K. Inouye International', city: 'Honolulu' },
  { code: 'LHR', name: 'London Heathrow', city: 'London' },
  { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam' },
  { code: 'NRT', name: 'Narita International', city: 'Tokyo' },
  { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo' },
  { code: 'ICN', name: 'Incheon International', city: 'Seoul' },
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore' },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai' },
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney' },
  { code: 'MEX', name: 'Benito Juarez International', city: 'Mexico City' },
  { code: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto' },
  { code: 'YVR', name: 'Vancouver International', city: 'Vancouver' },
];

interface FlightFormProps {
  tripId: string;
  flight?: Flight;
  onClose: () => void;
  onSave?: () => void;
}

export function FlightForm({ tripId, flight, onClose, onSave }: FlightFormProps) {
  const { addFlight, updateFlight, deleteFlight } = useTripStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAirlineDropdown, setShowAirlineDropdown] = useState(false);
  const [showDepartureDropdown, setShowDepartureDropdown] = useState(false);
  const [showArrivalDropdown, setShowArrivalDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FlightFormData>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      airline: flight?.airline || '',
      flightNumber: flight?.flightNumber || '',
      departureAirport: flight?.departureAirport || '',
      departureCity: flight?.departureCity || '',
      departureTime: flight?.departureTime || '',
      arrivalAirport: flight?.arrivalAirport || '',
      arrivalCity: flight?.arrivalCity || '',
      arrivalTime: flight?.arrivalTime || '',
      terminal: flight?.terminal || '',
      gate: flight?.gate || '',
      seat: flight?.seat || '',
      confirmationNumber: flight?.confirmationNumber || '',
      cost: flight?.cost?.toString() || '',
      currency: flight?.currency || 'USD',
      notes: flight?.notes || '',
    },
  });

  const airlineValue = watch('airline');
  const departureAirportValue = watch('departureAirport');
  const arrivalAirportValue = watch('arrivalAirport');

  const filteredAirlines = AIRLINES.filter(
    (a) =>
      a.name.toLowerCase().includes(airlineValue?.toLowerCase() || '') ||
      a.code.toLowerCase().includes(airlineValue?.toLowerCase() || '')
  );

  const filteredDepartureAirports = AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(departureAirportValue?.toLowerCase() || '') ||
      a.city.toLowerCase().includes(departureAirportValue?.toLowerCase() || '') ||
      a.name.toLowerCase().includes(departureAirportValue?.toLowerCase() || '')
  );

  const filteredArrivalAirports = AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(arrivalAirportValue?.toLowerCase() || '') ||
      a.city.toLowerCase().includes(arrivalAirportValue?.toLowerCase() || '') ||
      a.name.toLowerCase().includes(arrivalAirportValue?.toLowerCase() || '')
  );

  const selectAirline = (airlineObj: typeof AIRLINES[0]) => {
    setValue('airline', airlineObj.name, { shouldValidate: true });
    setShowAirlineDropdown(false);
  };

  const selectDepartureAirport = (airportObj: typeof AIRPORTS[0]) => {
    setValue('departureAirport', airportObj.code, { shouldValidate: true });
    setValue('departureCity', airportObj.city);
    setShowDepartureDropdown(false);
  };

  const selectArrivalAirport = (airportObj: typeof AIRPORTS[0]) => {
    setValue('arrivalAirport', airportObj.code, { shouldValidate: true });
    setValue('arrivalCity', airportObj.city);
    setShowArrivalDropdown(false);
  };

  const onSubmit = (data: FlightFormData) => {
    const flightData: Flight = {
      id: flight?.id || `flight-${Date.now()}`,
      airline: data.airline,
      flightNumber: data.flightNumber.toUpperCase(),
      departureAirport: data.departureAirport.toUpperCase(),
      departureCity: data.departureCity || '',
      departureTime: data.departureTime ? new Date(data.departureTime).toISOString() : '',
      arrivalAirport: data.arrivalAirport.toUpperCase(),
      arrivalCity: data.arrivalCity || '',
      arrivalTime: data.arrivalTime ? new Date(data.arrivalTime).toISOString() : '',
      terminal: data.terminal || '',
      gate: data.gate || '',
      confirmationNumber: data.confirmationNumber || '',
      seat: data.seat || '',
      notes: data.notes || '',
      cost: data.cost ? parseFloat(data.cost) : undefined,
      currency: data.currency,
    };

    if (flight) {
      updateFlight(tripId, flight.id, flightData);
    } else {
      addFlight(tripId, flightData);
    }

    onSave?.();
    onClose();
  };

  const handleDelete = () => {
    if (flight) {
      deleteFlight(tripId, flight.id);
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-600" />
              <DialogTitle>{flight ? 'Edit Flight' : 'Add Flight'}</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Flight Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Flight Details *</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="airline">Airline *</Label>
                <div className="relative">
                  <Input
                    id="airline"
                    {...register('airline')}
                    onFocus={() => setShowAirlineDropdown(true)}
                    onBlur={() => setTimeout(() => setShowAirlineDropdown(false), 200)}
                    placeholder="e.g., American Airlines"
                    className={errors.airline ? 'border-red-500' : ''}
                  />
                  {showAirlineDropdown && filteredAirlines.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-auto">
                      {filteredAirlines.slice(0, 8).map((airlineObj) => (
                        <div
                          key={airlineObj.code}
                          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100"
                          onMouseDown={() => selectAirline(airlineObj)}
                        >
                          <span>{airlineObj.name}</span>
                          <span className="text-xs text-gray-500">{airlineObj.code}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.airline && (
                  <p className="text-xs text-red-500">{errors.airline.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="flightNumber">Flight Number *</Label>
                <Input
                  id="flightNumber"
                  {...register('flightNumber')}
                  placeholder="e.g., AA123"
                  className={`uppercase ${errors.flightNumber ? 'border-red-500' : ''}`}
                />
                {errors.flightNumber && (
                  <p className="text-xs text-red-500">{errors.flightNumber.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Departure */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Departure *</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureAirport">Airport *</Label>
                <div className="relative">
                  <Input
                    id="departureAirport"
                    {...register('departureAirport')}
                    onFocus={() => setShowDepartureDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDepartureDropdown(false), 200)}
                    placeholder="JFK"
                    className={`uppercase ${errors.departureAirport ? 'border-red-500' : ''}`}
                  />
                  {showDepartureDropdown && filteredDepartureAirports.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-auto">
                      {filteredDepartureAirports.slice(0, 6).map((airportObj) => (
                        <div
                          key={airportObj.code}
                          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100"
                          onMouseDown={() => selectDepartureAirport(airportObj)}
                        >
                          <span>{airportObj.code}</span>
                          <span className="text-xs text-gray-500">{airportObj.city}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.departureAirport && (
                  <p className="text-xs text-red-500">{errors.departureAirport.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureCity">City</Label>
                <Input
                  id="departureCity"
                  {...register('departureCity')}
                  placeholder="New York"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureTime">Date/Time</Label>
                <Input
                  id="departureTime"
                  type="datetime-local"
                  {...register('departureTime')}
                />
              </div>
            </div>
          </div>

          {/* Arrival */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Arrival *</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="arrivalAirport">Airport *</Label>
                <div className="relative">
                  <Input
                    id="arrivalAirport"
                    {...register('arrivalAirport')}
                    onFocus={() => setShowArrivalDropdown(true)}
                    onBlur={() => setTimeout(() => setShowArrivalDropdown(false), 200)}
                    placeholder="LAX"
                    className={`uppercase ${errors.arrivalAirport ? 'border-red-500' : ''}`}
                  />
                  {showArrivalDropdown && filteredArrivalAirports.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-auto">
                      {filteredArrivalAirports.slice(0, 6).map((airportObj) => (
                        <div
                          key={airportObj.code}
                          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100"
                          onMouseDown={() => selectArrivalAirport(airportObj)}
                        >
                          <span>{airportObj.code}</span>
                          <span className="text-xs text-gray-500">{airportObj.city}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.arrivalAirport && (
                  <p className="text-xs text-red-500">{errors.arrivalAirport.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrivalCity">City</Label>
                <Input
                  id="arrivalCity"
                  {...register('arrivalCity')}
                  placeholder="Los Angeles"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrivalTime">Date/Time</Label>
                <Input
                  id="arrivalTime"
                  type="datetime-local"
                  {...register('arrivalTime')}
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Additional Details</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="terminal">Terminal</Label>
                <Input
                  id="terminal"
                  {...register('terminal')}
                  placeholder="A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gate">Gate</Label>
                <Input
                  id="gate"
                  {...register('gate')}
                  placeholder="B12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seat">Seat</Label>
                <Input
                  id="seat"
                  {...register('seat')}
                  placeholder="12A"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="confirmationNumber">Confirmation Number</Label>
                <Input
                  id="confirmationNumber"
                  {...register('confirmationNumber')}
                  placeholder="ABC123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  {...register('cost')}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={watch('currency')}
                  onValueChange={(value) => setValue('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center pt-4 border-t">
            <div>
              {flight && (
                showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-600">Delete this flight?</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                    >
                      Yes, Delete
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4 mr-1" />
                {flight ? 'Update Flight' : 'Add Flight'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
