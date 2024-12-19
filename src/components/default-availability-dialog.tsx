'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import frLocale from '@fullcalendar/core/locales/fr'
import { AvailabilityPopup } from './availability-popup'

interface DefaultAvailabilityDialogProps {
    isOpen: boolean
    onClose: () => void
    onUpdateDefault: (info: any) => void
    defaultEvents: any[]
}

export function DefaultAvailabilityDialog({
    isOpen,
    onClose,
    onUpdateDefault,
    defaultEvents
}: DefaultAvailabilityDialogProps) {
    const [selectedEvent, setSelectedEvent] = useState<any>(null)
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })

    const handleEventClick = (info: any) => {
        const rect = info.el.getBoundingClientRect()
        const dialogRect = info.el.closest('.dialog-content').getBoundingClientRect()

        let top = rect.top - dialogRect.top + (rect.height / 2) - 100
        let left = rect.left - dialogRect.left - 220

        if (left < 0) {
            left = rect.right - dialogRect.left + 5
        }

        setPopupPosition({ top, left })
        setSelectedEvent(info.event)
    }

    const handleDelete = async () => {
        if (selectedEvent) {
            const startStr = selectedEvent.start.toISOString();
            const endStr = selectedEvent.end.toISOString();

            console.log('Deleting event:', {
                start: startStr,
                end: endStr,
                event: selectedEvent
            });

            const info = {
                start: selectedEvent.start,
                end: selectedEvent.end,
                isDelete: true,
                event: {
                    ...selectedEvent,
                    startStr,
                    endStr,
                    start: selectedEvent.start,
                    end: selectedEvent.end
                },
                view: { calendar: selectedEvent._context.calendarApi }
            };
            onUpdateDefault(info);
            setSelectedEvent(null);
        }
    }

    const handleUpdate = async (startTime: string, endTime: string) => {
        if (selectedEvent) {
            const date = new Date(selectedEvent.start)
            const [startHour, startMinute] = startTime.split(':')
            const [endHour, endMinute] = endTime.split(':')

            const newStart = new Date(date)
            newStart.setHours(parseInt(startHour), parseInt(startMinute))

            const newEnd = new Date(date)
            newEnd.setHours(parseInt(endHour), parseInt(endMinute))

            const info = {
                start: newStart,
                end: newEnd,
                isUpdate: true,
                oldEvent: selectedEvent,
                view: { calendar: selectedEvent._calendar }
            }
            onUpdateDefault(info)
            setSelectedEvent(null)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-4xl dialog-content"
                onPointerDownOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.closest('[aria-label="Close"]')) {
                        e.preventDefault();
                    }
                }}
                onInteractOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.closest('[aria-label="Close"]')) {
                        e.preventDefault();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>Set Default Availabilities</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Changes are automatically saved
                    </p>
                </DialogHeader>
                <div className="h-[600px] mt-4 relative">
                    <FullCalendar
                        plugins={[timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={false}
                        locale={frLocale}
                        events={defaultEvents}
                        weekNumbers={false}
                        height="100%"
                        slotMinTime="08:00:00"
                        slotMaxTime="19:30:00"
                        allDaySlot={false}
                        nowIndicator={false}
                        slotDuration="00:30:00"
                        scrollTime="08:00:00"
                        businessHours={{
                            daysOfWeek: [1, 2, 3, 4, 5],
                            startTime: '08:00',
                            endTime: '19:30',
                        }}
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        select={onUpdateDefault}
                        eventClick={handleEventClick}
                        dayHeaderFormat={{ weekday: 'long' }}
                        hiddenDays={[0, 6]}
                        views={{
                            timeGridWeek: {
                                dayHeaderFormat: { weekday: 'long' },
                                dayCellContent: ({ date }) => {
                                    return { html: '' }
                                }
                            }
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
            </DialogContent>
        </Dialog>
    )
} 