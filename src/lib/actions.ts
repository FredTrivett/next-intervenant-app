'use server'

import { db } from '@/lib/db'
import { unstable_noStore as noStore } from 'next/cache'
import type { Intervenant } from '@/lib/definitions'

export async function getIntervenants(): Promise<Intervenant[]> {
    noStore()
    try {
        const intervenants = await db.intervenant.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        }) ?? []

        return intervenants as Intervenant[]
    } catch (error) {
        console.error('Failed to fetch intervenants:', error)
        return []
    }
}

export async function deleteIntervenant(id: string) {
    try {
        await db.intervenant.delete({
            where: {
                id: id
            }
        })
        return { success: true }
    } catch (error) {
        console.error('Failed to delete intervenant:', error)
        throw new Error('Failed to delete intervenant')
    }
} 