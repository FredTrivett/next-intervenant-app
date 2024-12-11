type TimeSlot = {
    days: string
    from: string
    to: string
}

type AvailabilityData = {
    default?: TimeSlot[]
    [key: `S${number}`]: TimeSlot[]
}

const DAYS_MAP: { [key: string]: number } = {
    'lundi': 1,
    'mardi': 2,
    'mercredi': 3,
    'jeudi': 4,
    'vendredi': 5,
    'samedi': 6,
    'dimanche': 0,
}

export function getWeekDates(weekNumber: number, year: number = new Date().getFullYear()) {
    const firstDayOfYear = new Date(year, 0, 1)
    const firstThursday = new Date(year, 0, 1 + ((11 - firstDayOfYear.getDay()) % 7))
    const targetThursday = new Date(firstThursday)
    targetThursday.setDate(firstThursday.getDate() + (weekNumber - 1) * 7)
    const monday = new Date(targetThursday)
    monday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7))
    return monday
}

export function convertAvailabilitiesToEvents(availabilities: AvailabilityData | null) {
    if (!availabilities) return []

    const events: any[] = []
    const currentYear = new Date().getFullYear()
    const defaultSlots = availabilities.default || []

    // Get all week numbers from the availabilities
    const weekNumbers = Object.keys(availabilities)
        .filter(key => key.startsWith('S'))
        .map(key => parseInt(key.replace('S', '')))

    // Define the range of years to show (e.g., current year + 2 years)
    const yearsToShow = [currentYear, currentYear + 1, currentYear + 2]

    // Process each year
    yearsToShow.forEach(year => {
        // Process all weeks (1-52) for each year
        Array.from({ length: 52 }, (_, i) => i + 1).forEach(weekNumber => {
            const weekKey = `S${weekNumber}`
            const weekStart = getWeekDates(weekNumber, year)

            // Check if this is an exception week
            const isExceptionWeek = weekNumbers.includes(weekNumber)

            // Get specific slots for this week if they exist
            const weekSlots = isExceptionWeek
                ? availabilities[`S${weekNumber}` as keyof AvailabilityData] as TimeSlot[]
                : defaultSlots

            // For each day of the week
            Object.entries(DAYS_MAP).forEach(([dayName, dayOffset]) => {
                const date = new Date(weekStart)
                date.setDate(date.getDate() + ((dayOffset - 1 + 7) % 7))

                // Find slots for this day
                const daySlots = weekSlots.filter(slot =>
                    slot.days.split(',').map(d => d.trim().toLowerCase()).includes(dayName)
                )

                // Only create events if we have slots for this day
                daySlots.forEach(slot => {
                    // Parse time strings
                    const [startHour, startMinute] = slot.from.split(':').map(Number)
                    const [endHour, endMinute] = slot.to.split(':').map(Number)

                    // Create the event
                    const startDateTime = new Date(date)
                    startDateTime.setHours(startHour, startMinute, 0)

                    const endDateTime = new Date(date)
                    endDateTime.setHours(endHour, endMinute, 0)

                    events.push({
                        title: `Available`,
                        start: startDateTime.toISOString(),
                        end: endDateTime.toISOString(),
                        backgroundColor: '#3B82F6',
                        borderColor: '#2563EB',
                    })
                })
            })
        })
    })

    return events
} 