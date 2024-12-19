'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { updateIntervenantAvailabilities } from '@/lib/actions'
import { EventApi } from '@fullcalendar/core'
import { AvailabilityData, TimeSlot } from '@/lib/utils/date'
import { z } from 'zod'

interface EditAvailabilityDialogProps {
    isOpen: boolean
    onClose: () => void
    event: EventApi
    intervenant: { id: string; availabilities: Record<string, unknown> }
    onUpdate: () => void
}

export function EditAvailabilityDialog({
    isOpen,
    onClose,
    event,
    intervenant,
    onUpdate
}: EditAvailabilityDialogProps) {
    const { toast } = useToast()
    const [startTime, setStartTime] = useState(event?.startStr?.slice(11, 16) || '')
    const [endTime, setEndTime] = useState(event?.endStr?.slice(11, 16) || '')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Get the week number and day from the event
            const date = new Date(event.start)
            const weekNumber = getWeekNumber(date)
            const dayName = getDayName(date)

            // Create updated availabilities object
            const weekKey = `S${weekNumber}`
            const newAvailabilities: AvailabilityData = { ...intervenant.availabilities } as AvailabilityData

            if (!newAvailabilities[weekKey]) {
                newAvailabilities[weekKey] = []
            }

            // Update or add the time slot
            const existingSlotIndex = newAvailabilities[weekKey].findIndex(
                (slot: TimeSlot) => slot.days.includes(dayName)
            )

            const newSlot = {
                days: dayName,
                from: startTime,
                to: endTime
            }

            if (existingSlotIndex >= 0) {
                newAvailabilities[weekKey][existingSlotIndex] = newSlot
            } else {
                newAvailabilities[weekKey].push(newSlot)
            }

            // Update in database
            await updateIntervenantAvailabilities(intervenant.id, newAvailabilities)

            toast({
                title: "Success",
                description: "Availability updated successfully",
            })

            onUpdate()
            onClose()
        } catch {
            toast({
                title: "Error",
                description: "Failed to update availability",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Availability</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
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