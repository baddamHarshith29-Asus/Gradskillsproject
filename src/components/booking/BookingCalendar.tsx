"use client";

import React from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface BookingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: any;
}

interface BookingCalendarProps {
  bookings: any[];
  onSelectEvent?: (event: BookingEvent) => void;
}

export default function BookingCalendar({ bookings, onSelectEvent }: BookingCalendarProps) {
  const events: BookingEvent[] = bookings.map((b) => ({
    id: b.id,
    title: `${b.space?.name || "Space"} - ${b.client?.company || b.client?.name || "Reserved"}`,
    start: new Date(b.startTime),
    end: new Date(b.endTime),
    resource: b,
  }));

  // Style events dynamically
  const eventStyleGetter = (event: BookingEvent) => {
    let backgroundColor = "#1e3a8a"; // default deep blue
    const type = event.resource.space?.type;
    
    if (type === "MEETING_ROOM") {
      backgroundColor = "#1e3b8a"; // blue
    } else if (type === "PRIVATE_OFFICE") {
      backgroundColor = "#312e81"; // indigo
    } else if (type === "PHONE_BOOTH") {
      backgroundColor = "#581c87"; // purple
    } else if (type === "HOT_DESK") {
      backgroundColor = "#064e3b"; // green
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 0.9,
        color: "#f8fafc",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "block",
        fontSize: "11px",
      },
    };
  };

  return (
    <div className="h-[600px] rounded-xl border border-brand-600 bg-brand-700 p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.WEEK}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onSelectEvent}
        className="font-sans text-slate-200"
      />
    </div>
  );
}
