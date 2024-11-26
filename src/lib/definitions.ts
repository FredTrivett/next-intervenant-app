// import type { Prisma } from '@prisma/client'

export interface Intervenant {
    id: string
    email: string
    firstname: string
    lastname: string
    key: string
    availabilities?: Record<string, any> | null
    createdAt: Date
    updatedAt: Date
} 