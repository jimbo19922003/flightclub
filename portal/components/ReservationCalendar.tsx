"use client";

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useRouter } from 'next/navigation';

// Setup the localizer by providing the moment (or globalize, or Luxon) instance
// to the localizer function.
const localizer = momentLocalizer(moment);

type Event = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resourceId?: string;
    status: string;
    type: string;
};

export default function ReservationCalendar({ events }: { events: any[] }) {
  const router = useRouter();

  // Transform Prisma events to Calendar events
  const calendarEvents: Event[] = events.map(res => ({
      id: res.id,
      title: res.type === 'MAINTENANCE' ? `MAINT: ${res.aircraft.registration}` : `${res.aircraft.registration} - ${res.user.name}`,
      start: new Date(res.startTime),
      end: new Date(res.endTime),
      status: res.status,
      type: res.type
  }));

  const eventStyleGetter = (event: Event) => {
      let backgroundColor = '#3174ad';
      if (event.status === 'COMPLETED') backgroundColor = '#10B981'; // Green
      if (event.status === 'CHECKED_OUT') backgroundColor = '#F59E0B'; // Orange/Yellow
      if (event.status === 'CANCELLED') backgroundColor = '#EF4444'; // Red
      
      // Maintenance overrides
      if (event.type === 'MAINTENANCE') backgroundColor = '#8B5CF6'; // Purple

      return {
          style: {
              backgroundColor,
              borderRadius: '5px',
              opacity: 0.8,
              color: 'white',
              border: '0px',
              display: 'block'
          }
      };
  };

  const handleSelectEvent = (event: Event) => {
      // Navigate to details or action based on status
      if (event.status === 'CONFIRMED') {
          router.push(`/reservations/${event.id}/checkin`);
      } else if (event.status === 'CHECKED_OUT') {
          router.push(`/reservations/${event.id}/active`);
      } else {
          // TODO: Add modal for viewing details/cancelling
          router.push(`/reservations/${event.id}/summary`);
      }
  };

  const handleSelectSlot = (slotInfo: { start: Date, end: Date }) => {
      // Navigate to new reservation page with pre-filled dates
      const start = slotInfo.start.toISOString();
      const end = slotInfo.end.toISOString();
      router.push(`/reservations/new?start=${start}&end=${end}`);
  };

  return (
    <div className="h-[600px] bg-white p-4 rounded-xl shadow border">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        defaultView="week"
      />
    </div>
  );
}
