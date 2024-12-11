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
    const startTime = event.start.toTimeString().slice(0, 5)
    const endTime = event.end.toTimeString().slice(0, 5)

    useEffect(() => {
        if (!popupRef.current) return

        const popup = popupRef.current
        const rect = popup.getBoundingClientRect()
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        if (rect.right > viewport.width) {
            popup.style.left = `${position.left - rect.width - 10}px`
        }

        if (rect.bottom > viewport.height) {
            popup.style.top = `${position.top - rect.height}px`
        }
    }, [position])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
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
            className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 space-y-4 min-w-[200px]"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            <div className="space-y-2">
                <div className="flex gap-2 items-center">
                    <Input
                        type="time"
                        defaultValue={startTime}
                        onChange={(e) => {
                            if (e.target.value) {
                                onUpdate(e.target.value, endTime)
                            }
                        }}
                    />
                    <span>-</span>
                    <Input
                        type="time"
                        defaultValue={endTime}
                        onChange={(e) => {
                            if (e.target.value) {
                                onUpdate(startTime, e.target.value)
                            }
                        }}
                    />
                </div>
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
    )
} 