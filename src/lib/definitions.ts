// import type { Prisma } from '@prisma/client'

import { TimeSlot } from '@/lib/utils/date'
import { Prisma } from '@prisma/client'

export interface Intervenant {
    id: string
    email: string
    firstname: string
    lastname: string
    key: string
    availabilities?: Prisma.JsonValue
    expiresAt: Date | string
    createdAt: Date
    updatedAt: Date
} 