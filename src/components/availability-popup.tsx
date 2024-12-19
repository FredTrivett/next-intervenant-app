'use client'

import { useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AvailabilityPopupProps {
    event: any
    position: { top: number; left: number }
    onClose: () => void
    onDelete: () => void
    onUpdate: (startTime: string, endTime: string) => void
}

export function AvailabilityPopup({
    event,
    position,
    onClose,
    onDelete,
    onUpdate
}: AvailabilityPopupProps) {
    const popupRef = useRef<HTMLDivElement>(null)

    // Add safety checks for start and end times
    const startTime = event?.start ? event.start.toTimeString().slice(0, 5) : '00:00'
    const endTime = event?.end ? event.end.toTimeString().slice(0, 5) :
        (event?.start ? new Date(event.start.getTime() + 30 * 60000).toTimeString().slice(0, 5) : '00:30')

    useEffect(() => {
        if (!popupRef.current) return

        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

    return (
        <div
            ref={popupRef}
            className="absolute z-10 bg-white rounded-lg shadow-lg p-4 border border-gray-200 w-60"
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Start Time
                    </label>
                    <Input
                        type="time"
                        defaultValue={startTime}
                        min="08:00"
                        max="19:30"
                        step="1800"
                        onChange={(e) => {
                            if (e.target.value) {
                                onUpdate(e.target.value, endTime)
                            }
                        }}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        End Time
                    </label>
                    <Input
                        type="time"
                        defaultValue={endTime}
                        min="08:00"
                        max="19:30"
                        step="1800"
                        onChange={(e) => {
                            if (e.target.value) {
                                onUpdate(startTime, e.target.value)
                            }
                        }}
                    />
                </div>
                <div className="flex justify-between">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onDelete}
                    >
                        Delete
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    )
} 