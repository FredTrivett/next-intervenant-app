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
import { Button } from './ui/button'
import { DefaultAvailabilityDialog } from './default-availability-dialog'

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
    const [isDefaultDialogOpen, setIsDefaultDialogOpen] = useState(false)

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
        const date = new Date(info.event.start);
        const month = date.getMonth();

        // Prevent events in July (6) and August (7)
        if (month === 6 || month === 7) {
            info.revert();
            toast({
                title: "Période non disponible",
                description: "Les disponibilités ne peuvent pas être définies pendant les vacances d'été",
                variant: "destructive",
            });
            return;
        }

        try {
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
        const date = new Date(info.start);
        const month = date.getMonth();

        // Prevent selection in July (6) and August (7)
        if (month === 6 || month === 7) {
            const calendarApi = info.view.calendar;
            calendarApi.unselect(); // Clear the selection
            toast({
                title: "Période non disponible",
                description: "Les disponibilités ne peuvent pas être définies pendant les vacances d'été",
                variant: "destructive",
            });
            return;
        }

        try {
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

    const handleDefaultWeekChange = async (info: any) => {
        try {
            const newAvailabilities = { ...intervenant.availabilities };

            // Initialize default array if it doesn't exist
            if (!newAvailabilities.default) {
                newAvailabilities.default = [];
            }

            if (info.isDelete) {
                // Handle deletion
                const startTime = info.event.startStr.slice(11, 16);
                const endTime = info.event.endStr.slice(11, 16);
                const dayName = getDayName(new Date(info.event.start));

                console.log('Trying to delete:', {
                    dayName,
                    startTime,
                    endTime,
                    currentSlots: newAvailabilities.default
                });

                // More precise filtering to avoid removing wrong slots
                const beforeLength = newAvailabilities.default.length;
                newAvailabilities.default = newAvailabilities.default.filter((slot: any) => {
                    const doesNotMatch = !(
                        slot.days.toLowerCase() === dayName.toLowerCase() &&
                        slot.from === startTime &&
                        slot.to === endTime
                    );

                    if (!doesNotMatch) {
                        console.log('Found matching slot:', slot);
                    }

                    return doesNotMatch;
                });

                const afterLength = newAvailabilities.default.length;
                if (beforeLength === afterLength) {
                    console.log('No slot was removed. Current slots:', newAvailabilities.default);
                }

                // Update the calendar immediately
                const calendarApi = info.view.calendar;
                info.event.remove();

            } else if (info.isUpdate) {
                // Handle update
                const oldStartTime = info.oldEvent.start.toTimeString().slice(0, 5);
                const oldEndTime = info.oldEvent.end.toTimeString().slice(0, 5);
                const dayName = getDayName(info.start);

                // Find the exact slot to update
                const slotIndex = newAvailabilities.default.findIndex(
                    (slot: any) =>
                        slot.days === dayName &&
                        slot.from === oldStartTime &&
                        slot.to === oldEndTime
                );

                const newSlot = {
                    days: dayName,
                    from: info.start.toTimeString().slice(0, 5),
                    to: info.end.toTimeString().slice(0, 5)
                };

                if (slotIndex >= 0) {
                    newAvailabilities.default[slotIndex] = newSlot;

                    // Update the calendar immediately
                    const calendarApi = info.view.calendar;
                    const event = calendarApi.getEventById(info.oldEvent.id);
                    if (event) {
                        event.setStart(info.start);
                        event.setEnd(info.end);
                    }
                }
            } else {
                // Handle new slot creation
                const dayName = getDayName(info.start);
                const newSlot = {
                    days: dayName,
                    from: info.start.toTimeString().slice(0, 5),
                    to: info.end.toTimeString().slice(0, 5)
                };

                // Check for duplicate slots
                const isDuplicate = newAvailabilities.default.some(
                    (slot: any) =>
                        slot.days === dayName &&
                        slot.from === newSlot.from &&
                        slot.to === newSlot.to
                );

                if (!isDuplicate) {
                    newAvailabilities.default.push(newSlot);

                    // Add the event to the calendar immediately
                    const calendarApi = info.view.calendar;
                    calendarApi.addEvent({
                        start: info.start,
                        end: info.end,
                        id: `default-${Date.now()}`, // Unique ID for the event
                        backgroundColor: '#3B82F6',
                        borderColor: '#2563EB',
                    });
                }
            }

            // Save to the database
            await updateIntervenantAvailabilities(intervenant.id, newAvailabilities);

            toast({
                title: "Success",
                description: "Default availability updated successfully",
            });
        } catch (error) {
            console.error('Error updating default availabilities:', error);
            toast({
                title: "Error",
                description: "Failed to update default availability",
                variant: "destructive",
            });

            // Refresh the calendar to ensure consistent state
            const calendarApi = info.view.calendar;
            const events = convertAvailabilitiesToEvents({
                default: intervenant.availabilities.default
            });
            calendarApi.removeAllEvents();
            calendarApi.addEventSource(events);
        }
    };

    const renderSummerHolidays = (info: any) => {
        const date = new Date(info.date);
        const month = date.getMonth();

        // July is 6 and August is 7 (0-based months)
        if (month === 6 || month === 7) {
            return {
                html: `<div class="h-full flex items-center justify-center bg-gray-50">
                    <div class="text-gray-400 text-sm">
                        Vacances d'été
                    </div>
                </div>`
            };
        }
        return { html: '' }; // Return empty html instead of empty object
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Button
                    onClick={() => setIsDefaultDialogOpen(true)}
                    variant="outline"
                    className="mb-4"
                >
                    My Default Availabilities
                </Button>
            </div>

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
                        eventClick={(info) => {
                            const date = new Date(info.event.start)
                            const isFirstWeekAugust =
                                date.getMonth() === 7 &&
                                Math.floor((date.getDate() - 1) / 7) === 0

                            if (isDefaultDialogOpen && isFirstWeekAugust) {
                                // Handle default event click
                                handleEventClick({
                                    ...info,
                                    isDefault: true
                                })
                            } else {
                                handleEventClick(info)
                            }
                        }}
                        eventResize={handleEventResize}
                        eventDrop={handleEventResize}
                        select={(info) => {
                            // If showing defaults and it's the first week of August
                            const date = new Date(info.start)
                            const isFirstWeekAugust =
                                date.getMonth() === 7 && // August (0-based)
                                Math.floor((date.getDate() - 1) / 7) === 0

                            if (isDefaultDialogOpen && isFirstWeekAugust) {
                                handleDefaultWeekChange(info)
                            } else {
                                handleSelect(info)
                            }
                        }}
                        dayCellContent={renderSummerHolidays}
                        selectConstraint={{
                            startTime: '08:00:00',
                            endTime: '19:30:00',
                            dows: [1, 2, 3, 4, 5], // Monday to Friday
                        }}
                        dayCellContent={(info) => {
                            const date = new Date(info.date);
                            const month = date.getMonth();

                            // July is 6 and August is 7 (0-based months)
                            if (month === 6 || month === 7) {
                                return {
                                    html: `<div class="h-full flex items-center justify-center bg-gray-100">
                                        <div class="text-gray-500 text-sm">
                                            Vacances d'été
                                        </div>
                                    </div>`
                                };
                            }
                            return { html: '' };
                        }}
                        eventDidMount={(info) => {
                            const date = new Date(info.event.start);
                            const month = date.getMonth();

                            // Make events in July and August appear disabled
                            if (month === 6 || month === 7) {
                                info.el.style.opacity = '0.5';
                                info.el.style.cursor = 'not-allowed';
                            }
                        }}
                        eventStartEditable={(info) => {
                            const date = new Date(info.start);
                            const month = date.getMonth();
                            return month !== 6 && month !== 7; // Disable drag in July and August
                        }}
                        eventDurationEditable={(info) => {
                            const date = new Date(info.start);
                            const month = date.getMonth();
                            return month !== 6 && month !== 7; // Disable resize in July and August
                        }}
                        selectable={(info) => {
                            const date = new Date(info.start);
                            const month = date.getMonth();
                            return month !== 6 && month !== 7; // Disable selection in July and August
                        }}
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

            <DefaultAvailabilityDialog
                isOpen={isDefaultDialogOpen}
                onClose={() => setIsDefaultDialogOpen(false)}
                onUpdateDefault={handleDefaultWeekChange}
                defaultEvents={intervenant.availabilities?.default ?
                    convertAvailabilitiesToEvents({ default: intervenant.availabilities.default })
                    : []
                }
            />
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