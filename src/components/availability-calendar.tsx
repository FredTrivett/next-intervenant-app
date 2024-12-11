'use client'

import { useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import frLocale from '@fullcalendar/core/locales/fr'
import { Intervenant } from '@/lib/definitions'
import { convertAvailabilitiesToEvents } from '@/lib/utils/date'
import { updateIntervenantAvailabilities } from '@/lib/actions'
import { useToast } from "@/hooks/use-toast"
import { AvailabilityPopup } from './availability-popup'
import multiMonthPlugin from '@fullcalendar/multimonth'

interface AvailabilityCalendarProps {
    intervenant: Intervenant
}

export function AvailabilityCalendar({ intervenant }: AvailabilityCalendarProps) {
    const { toast } = useToast()
    const events = convertAvailabilitiesToEvents(intervenant.availabilities)
    const [selectedEvent, setSelectedEvent] = useState<any>(null)
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })
    const mainCalendarRef = useRef<any>(null)
    const miniCalendarRef = useRef<any>(null)
    const [currentMonth, setCurrentMonth] = useState(
        new Date().toLocaleString('fr-FR', { month: 'long' })
    )

    const handleEventClick = (info: any) => {
        const rect = info.el.getBoundingClientRect()
        const viewportHeight = window.innerHeight

        // Calculate position relative to the event
        let top = rect.top + window.scrollY + (rect.height / 2) - 100 // Center vertically relative to event
        let left = rect.left + window.scrollX - 220 // Closer to the event (reduced offset)

        // If popup would go below viewport, adjust upward
        if (top + 200 > viewportHeight) {
            top = rect.top + window.scrollY - 200
        }

        // If popup would go off-screen to the left, position it to the right of the event
        if (left < 0) {
            left = rect.right + window.scrollX + 5 // Tighter gap when on the right
        }

        setPopupPosition({ top, left })
        setSelectedEvent(info.event)
    }

    const handleDelete = async () => {
        if (!selectedEvent) return

        try {
            const date = new Date(selectedEvent.start)
            const weekNumber = getWeekNumber(date)
            const dayName = getDayName(date)
            const weekKey = `S${weekNumber}`
            const startTime = selectedEvent.start.toTimeString().slice(0, 5)
            const endTime = selectedEvent.end.toTimeString().slice(0, 5)

            const newAvailabilities = { ...intervenant.availabilities }
            if (newAvailabilities[weekKey]) {
                newAvailabilities[weekKey] = newAvailabilities[weekKey].filter(
                    (slot: any) => !(
                        slot.days.includes(dayName) &&
                        slot.from === startTime &&
                        slot.to === endTime
                    )
                )
            }

            await updateIntervenantAvailabilities(intervenant.id, newAvailabilities)
            selectedEvent.remove()
            setSelectedEvent(null)
            toast({
                title: "Success",
                description: "Availability deleted successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete availability",
                variant: "destructive",
            })
        }
    }

    const handleUpdate = async (startTime: string, endTime: string) => {
        if (!selectedEvent) return

        try {
            const date = new Date(selectedEvent.start)
            const weekNumber = getWeekNumber(date)
            const dayName = getDayName(date)
            const weekKey = `S${weekNumber}`

            const newAvailabilities = { ...intervenant.availabilities }
            if (!newAvailabilities[weekKey]) {
                newAvailabilities[weekKey] = []
            }

            const newSlot = {
                days: dayName,
                from: startTime,
                to: endTime
            }

            const existingSlotIndex = newAvailabilities[weekKey].findIndex(
                (slot: any) => slot.days.includes(dayName)
            )

            if (existingSlotIndex >= 0) {
                newAvailabilities[weekKey][existingSlotIndex] = newSlot
            } else {
                newAvailabilities[weekKey].push(newSlot)
            }

            await updateIntervenantAvailabilities(intervenant.id, newAvailabilities)
            window.location.reload() // Refresh to show updated event
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update availability",
                variant: "destructive",
            })
        }
    }

    const handleEventResize = async (info: any) => {
        try {
            const date = new Date(info.event.start)
            const weekNumber = getWeekNumber(date)
            const dayName = getDayName(date)
            const weekKey = `S${weekNumber}`

            // Get the old date/time to remove the previous slot
            const oldDate = info.oldEvent ? new Date(info.oldEvent.start) : null
            const oldWeekNumber = oldDate ? getWeekNumber(oldDate) : null
            const oldDayName = oldDate ? getDayName(oldDate) : null
            const oldWeekKey = oldDate ? `S${oldWeekNumber}` : null
            const oldStartTime = oldDate ? info.oldEvent.start.toTimeString().slice(0, 5) : null
            const oldEndTime = oldDate ? info.oldEvent.end.toTimeString().slice(0, 5) : null

            const newAvailabilities = { ...intervenant.availabilities }

            // Remove the old slot if it exists
            if (oldWeekKey && newAvailabilities[oldWeekKey]) {
                newAvailabilities[oldWeekKey] = newAvailabilities[oldWeekKey].filter(
                    (slot: any) => !(
                        slot.days.includes(oldDayName) &&
                        slot.from === oldStartTime &&
                        slot.to === oldEndTime
                    )
                )
            }

            // Add the new slot
            if (!newAvailabilities[weekKey]) {
                newAvailabilities[weekKey] = []
            }

            const newSlot = {
                days: dayName,
                from: info.event.start.toTimeString().slice(0, 5),
                to: info.event.end.toTimeString().slice(0, 5)
            }

            newAvailabilities[weekKey].push(newSlot)

            await updateIntervenantAvailabilities(intervenant.id, newAvailabilities)
            toast({
                title: "Success",
                description: "Availability updated successfully",
            })
        } catch (error) {
            info.revert()
            toast({
                title: "Error",
                description: "Failed to update availability",
                variant: "destructive",
            })
        }
    }

    const handleSelect = async (info: any) => {
        try {
            const date = new Date(info.start)
            const weekNumber = getWeekNumber(date)
            const dayName = getDayName(date)
            const weekKey = `S${weekNumber}`

            const newAvailabilities = { ...intervenant.availabilities }
            if (!newAvailabilities[weekKey]) {
                newAvailabilities[weekKey] = []
            }

            const newSlot = {
                days: dayName,
                from: info.start.toTimeString().slice(0, 5),
                to: info.end.toTimeString().slice(0, 5)
            }

            // Add the new time slot
            newAvailabilities[weekKey].push(newSlot)

            await updateIntervenantAvailabilities(intervenant.id, newAvailabilities)

            // Instead of reloading, add the event directly to the calendar
            const calendarApi = info.view.calendar
            calendarApi.addEvent({
                start: info.start,
                end: info.end,
                backgroundColor: '#3B82F6',
                borderColor: '#2563EB',
            })

            toast({
                title: "Success",
                description: "Availability added successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add availability",
                variant: "destructive",
            })
        }
    }

    const handleMiniCalendarDateSelect = (arg: any) => {
        const calendarApi = mainCalendarRef.current.getApi()
        calendarApi.gotoDate(arg.start)
    }

    const handlePrevMonth = () => {
        const calendarApi = miniCalendarRef.current?.getApi()
        if (calendarApi) {
            calendarApi.prev()
        }
    }

    const handleNextMonth = () => {
        const calendarApi = miniCalendarRef.current?.getApi()
        if (calendarApi) {
            calendarApi.next()
        }
    }

    return (
        <div className="flex gap-4">
            {/* Mini Calendar */}
            <div className="w-1/4 max-w-[300px] min-w-[250px] bg-white rounded-lg shadow-sm p-2 border border-gray-100 relative">
                {/* Navigation Arrows */}
                <div className="absolute inset-x-0 top-8 flex justify-between px-2 z-10 pointer-events-none">
                    <button
                        className="text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center pointer-events-auto"
                        onClick={handlePrevMonth}
                    >
                        ‹
                    </button>
                    <button
                        className="text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center pointer-events-auto"
                        onClick={handleNextMonth}
                    >
                        ›
                    </button>
                </div>

                <FullCalendar
                    ref={miniCalendarRef}
                    plugins={[multiMonthPlugin, interactionPlugin]}
                    initialView="multiMonthYear"
                    headerToolbar={false}  // Remove default header completely
                    locale={frLocale}
                    height="auto"
                    selectable={true}
                    select={handleMiniCalendarDateSelect}
                    multiMonthMaxColumns={1}
                    multiMonthMinWidth={250}
                    views={{
                        multiMonthYear: {
                            duration: { months: 1 },
                            titleFormat: { month: 'long' },
                            dayHeaderFormat: { weekday: 'narrow' },
                            showNonCurrentDates: false,
                        }
                    }}
                    dayCellClassNames="hover:bg-gray-50 cursor-pointer"
                />
            </div>

            {/* Main Calendar */}
            <div className="flex-1 bg-white rounded-lg shadow p-4 relative">
                <FullCalendar
                    ref={mainCalendarRef}
                    plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
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
                        daysOfWeek: [1, 2, 3, 4, 5],
                        startTime: '08:00',
                        endTime: '19:30',
                    }}
                    editable={true}
                    eventResizableFromStart={true}
                    eventStartEditable={true}
                    eventDurationEditable={true}
                    selectable={true}
                    selectMirror={true}
                    eventClick={handleEventClick}
                    eventResize={handleEventResize}
                    eventDrop={handleEventResize}
                    select={handleSelect}
                />
                {selectedEvent && (
                    <AvailabilityPopup
                        event={selectedEvent}
                        position={popupPosition}
                        onClose={() => setSelectedEvent(null)}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                    />
                )}
            </div>
        </div>
    )
}

// Helper functions
function getWeekNumber(date: Date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function getDayName(date: Date) {
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
    return days[date.getDay()]
}