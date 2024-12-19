'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import frLocale from '@fullcalendar/core/locales/fr'
import { AvailabilityPopup } from './availability-popup'
import { EventApi, EventClickArg, Calendar } from '@fullcalendar/core'

interface DefaultAvailabilityDialogProps {
    isOpen: boolean
    onClose: () => void
    onUpdateDefault: (info: any) => void
    defaultEvents: {
        title: string;
        start: string;
        end: string;
        backgroundColor: string;
        borderColor: string;
    }[]
}

export function DefaultAvailabilityDialog({
    isOpen,
    onClose,
    onUpdateDefault,
    defaultEvents
}: DefaultAvailabilityDialogProps) {
    const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null)
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })

    const handleEventClick = (info: EventClickArg) => {
        const rect = info.el.getBoundingClientRect()
        const dialogRect = info.el.closest('.dialog-content').getBoundingClientRect()

        const top = rect.top - dialogRect.top + (rect.height / 2) - 100
        let left = rect.left - dialogRect.left - 220

        if (left < 0) {
            left = rect.right - dialogRect.left + 5
        }

        setPopupPosition({ top, left })
        setSelectedEvent(info.event)
    }

    const handleDelete = async () => {
        if (selectedEvent) {
            const calendar = (selectedEvent.source as any)?.calendar as Calendar;
            const view = calendar?.view;

            const info = {
                start: selectedEvent.start,
                end: selectedEvent.end,
                isDelete: true,
                event: selectedEvent,
                view: view || { calendar }
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

            const calendar = (selectedEvent.source as any)?.calendar as Calendar;
            const view = calendar?.view;

            onUpdateDefault({
                start: newStart,
                end: newEnd,
                isUpdate: true,
                oldEvent: selectedEvent,
                event: {
                    ...selectedEvent,
                    start: newStart,
                    end: newEnd
                },
                view: view || { calendar }
            })
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
                        eventDrop={(info) => onUpdateDefault({ ...info, isUpdate: true })}
                        eventResize={(info) => onUpdateDefault({ ...info, isUpdate: true })}
                        dayHeaderFormat={{ weekday: 'long' }}
                        hiddenDays={[0, 6]}
                        views={{
                            timeGridWeek: {
                                dayHeaderFormat: { weekday: 'long' },
                                dayCellContent: () => {
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