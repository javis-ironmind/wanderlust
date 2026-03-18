import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

type Activity = {
  id: string;
  title: string;
  category?: string;
  startTime?: string;
  endTime?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    name?: string;
  };
};

type Day = {
  id: string;
  date: string;
  activities: Activity[];
};

type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  days: Day[];
  flights: any[];
  hotels: any[];
};

export function exportTripToPDF(trip: Trip) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Helper function to check if we need a new page
  const checkNewPage = (neededSpace: number) => {
    if (yPos + neededSpace > 280) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // Header - Trip Name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(trip.name, margin, yPos);
  yPos += 12;

  // Trip dates
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const startDate = format(new Date(trip.startDate), 'MMMM d, yyyy');
  const endDate = format(new Date(trip.endDate), 'MMMM d, yyyy');
  doc.text(`${startDate} - ${endDate}`, margin, yPos);
  yPos += 15;

  // Divider line
  doc.setDrawColor(100);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Flights section
  if (trip.flights && trip.flights.length > 0) {
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('✈️ Flights', margin, yPos);
    yPos += 8;

    trip.flights.forEach((flight: any, index: number) => {
      checkNewPage(20);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const flightText = `${index + 1}. ${flight.airline || 'Airline'}`;
      doc.text(flightText, margin + 5, yPos);
      yPos += 6;
      
      if (flight.flightNumber) {
        doc.text(`   Flight: ${flight.flightNumber}`, margin + 5, yPos);
        yPos += 5;
      }
      if (flight.departure) {
        doc.text(`   Depart: ${flight.departure}`, margin + 5, yPos);
        yPos += 5;
      }
      if (flight.arrival) {
        doc.text(`   Arrive: ${flight.arrival}`, margin + 5, yPos);
        yPos += 5;
      }
      yPos += 3;
    });
    yPos += 5;
  }

  // Hotels section
  if (trip.hotels && trip.hotels.length > 0) {
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('🏨 Hotels', margin, yPos);
    yPos += 8;

    trip.hotels.forEach((hotel: any, index: number) => {
      checkNewPage(20);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const hotelText = `${index + 1}. ${hotel.name || 'Hotel'}`;
      doc.text(hotelText, margin + 5, yPos);
      yPos += 6;
      
      if (hotel.checkIn) {
        doc.text(`   Check-in: ${hotel.checkIn}`, margin + 5, yPos);
        yPos += 5;
      }
      if (hotel.checkOut) {
        doc.text(`   Check-out: ${hotel.checkOut}`, margin + 5, yPos);
        yPos += 5;
      }
      if (hotel.address) {
        doc.text(`   Address: ${hotel.address}`, margin + 5, yPos);
        yPos += 5;
      }
      yPos += 3;
    });
    yPos += 5;
  }

  // Daily itinerary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('📅 Daily Itinerary', margin, yPos);
  yPos += 10;

  // Sort days by date
  const sortedDays = [...trip.days].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedDays.forEach((day) => {
    checkNewPage(25);
    
    // Day header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const dayDate = format(new Date(day.date), 'EEEE, MMMM d, yyyy');
    doc.text(dayDate, margin, yPos);
    yPos += 7;

    // Activities
    if (day.activities && day.activities.length > 0) {
      // Sort activities by start time
      const sortedActivities = [...day.activities].sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });

      sortedActivities.forEach((activity) => {
        checkNewPage(15);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        let activityLine = '• ';
        
        if (activity.startTime) {
          activityLine += format(new Date(activity.startTime), 'h:mm a');
          if (activity.endTime) {
            activityLine += ` - ${format(new Date(activity.endTime), 'h:mm a')}`;
          }
          activityLine += ': ';
        }
        
        activityLine += activity.title;
        
        if (activity.location?.name) {
          activityLine += ` (${activity.location.name})`;
        }
        
        // Wrap text if too long
        const lines = doc.splitTextToSize(activityLine, contentWidth - 10);
        doc.text(lines, margin + 5, yPos);
        yPos += (lines.length * 5);
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('No activities planned', margin + 5, yPos);
      yPos += 5;
    }
    
    yPos += 8;
  });

  // Footer
  const footerY = 285;
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text('Generated by Wanderlust', margin, footerY);
  doc.text(format(new Date(), 'MMM d, yyyy h:mm a'), pageWidth - margin - 30, footerY);

  // Save the PDF
  const fileName = `${trip.name.replace(/[^a-z0-9]/gi, '_')}_itinerary.pdf`;
  doc.save(fileName);
}
