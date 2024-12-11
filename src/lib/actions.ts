'use server'

import { db } from '@/lib/db'
import { unstable_noStore as noStore } from 'next/cache'
import type { Intervenant } from '@/lib/definitions'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

export async function getIntervenants(): Promise<Intervenant[]> {
    noStore()
    try {
        const intervenants = await db.intervenant.findMany({
            orderBy: [
                { firstname: 'asc' },
                { lastname: 'asc' }
            ]
        })
        return intervenants
    } catch (error) {
        console.error('Failed to fetch intervenants:', error)
        throw new Error('Failed to fetch intervenants')
    }
}

export async function addIntervenant(data: {
    firstname: string
    lastname: string
    email: string
    key: string
    createdAt: Date
    expiresAt: Date
}): Promise<Intervenant> {
    try {
        const intervenant = await db.intervenant.create({
            data: {
                ...data,
                availabilities: {},
            }
        })

        // Revalidate the intervenants page
        revalidatePath('/admin/intervenants')

        return intervenant
    } catch (error) {
        console.error('Failed to add intervenant:', error)
        if (error instanceof Error && error.message.includes('Unique constraint')) {
            throw new Error('Email already exists')
        }
        throw new Error('Failed to add intervenant')
    }
}

export async function updateIntervenant(data: {
    id: string
    firstname: string
    lastname: string
    email: string
    expiresAt: Date
}): Promise<Intervenant> {
    try {
        const intervenant = await db.intervenant.update({
            where: { id: data.id },
            data: {
                firstname: data.firstname,
                lastname: data.lastname,
                email: data.email,
                expiresAt: data.expiresAt,
            }
        })

        // Revalidate the intervenants page
        revalidatePath('/admin/intervenants')

        return intervenant
    } catch (error) {
        console.error('Failed to update intervenant:', error)
        if (error instanceof Error && error.message.includes('Unique constraint')) {
            throw new Error('Email already exists')
        }
        throw new Error('Failed to update intervenant')
    }
}

export async function deleteIntervenant(id: string): Promise<void> {
    try {
        await db.intervenant.delete({
            where: { id }
        })

        // Revalidate the intervenants page
        revalidatePath('/admin/intervenants')
    } catch (error) {
        console.error('Failed to delete intervenant:', error)
        throw new Error('Failed to delete intervenant')
    }
}

export async function regenerateKey(id: string): Promise<Intervenant> {
    try {
        const key = uuidv4()
        const now = new Date()
        const expiresAt = new Date(now)
        expiresAt.setMonth(expiresAt.getMonth() + 2)

        const intervenant = await db.intervenant.update({
            where: { id },
            data: {
                key,
                createdAt: now,
                expiresAt,
            }
        })

        revalidatePath('/admin/intervenants')
        return intervenant
    } catch (error) {
        console.error('Failed to regenerate key:', error)
        throw new Error('Failed to regenerate key')
    }
}

export async function regenerateAllKeys(): Promise<void> {
    try {
        const now = new Date()
        const expiresAt = new Date(now)
        expiresAt.setMonth(expiresAt.getMonth() + 2)

        await db.intervenant.updateMany({
            data: {
                key: uuidv4(), // Note: This will give the same key to all intervenants
                createdAt: now,
                expiresAt,
            }
        })

        // For unique keys, we need to update each intervenant separately
        const intervenants = await db.intervenant.findMany()
        await Promise.all(
            intervenants.map(intervenant =>
                db.intervenant.update({
                    where: { id: intervenant.id },
                    data: {
                        key: uuidv4(),
                        createdAt: now,
                        expiresAt,
                    }
                })
            )
        )

        revalidatePath('/admin/intervenants')
    } catch (error) {
        console.error('Failed to regenerate all keys:', error)
        throw new Error('Failed to regenerate all keys')
    }
}

export async function validateIntervenantKey(key: string): Promise<Intervenant | null> {
    try {
        const intervenant = await db.intervenant.findFirst({
            where: { key }
        })

        if (!intervenant) {
            return null
        }

        // Check if key has expired
        if (new Date() > new Date(intervenant.expiresAt)) {
            return null
        }

        return intervenant
    } catch (error) {
        console.error('Failed to validate key:', error)
        return null
    }
}

export async function updateIntervenantAvailabilities(
    id: string,
    availabilities: Record<string, any>
): Promise<Intervenant> {
    try {
        const intervenant = await db.intervenant.update({
            where: { id },
            data: {
                availabilities
            }
        })

        revalidatePath('/availability')
        return intervenant
    } catch (error) {
        console.error('Failed to update availabilities:', error)
        throw new Error('Failed to update availabilities')
    }
} 