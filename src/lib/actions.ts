'use server'

import { db } from '@/lib/db'
import { unstable_noStore as noStore } from 'next/cache'
import type { Intervenant } from '@prisma/client'

export async function getIntervenants(): Promise<Intervenant[]> {
    noStore()
    try {
        const intervenants = await db.intervenant.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        }) ?? []

        return intervenants
    } catch (error) {
        console.error('Failed to fetch intervenants:', error)
        return []
    }
} 