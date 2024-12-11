'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import frLocale from '@fullcalendar/core/locales/fr'
import { Intervenant } from '@/lib/definitions'
import { convertAvailabilitiesToEvents } from '@/lib/utils/date'

interface AvailabilityCalendarProps {
    intervenant: Intervenant
}

export function AvailabilityCalendar({ intervenant }: AvailabilityCalendarProps) {
    const events = convertAvailabilitiesToEvents(intervenant.availabilities)

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <FullCalendar
                plugins={[timeGridPlugin, dayGridPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'timeGridWeek,dayGridMonth'
                }}
                locale={frLocale}
                events={events}
                weekNumbers={true}
                weekNumberCalculation="ISO"
                height="auto"
                slotMinTime="08:00:00"
                slotMaxTime="19:30:00"
                allDaySlot={false}
                nowIndicator={true}
                slotDuration="00:30:00"
                scrollTime="08:00:00"
                businessHours={{
                    daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                    startTime: '08:00',
                    endTime: '19:30',
                }}
            />
        </div>
    )
} 