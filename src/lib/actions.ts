'use server'

import { db } from '@/lib/db'
import { unstable_noStore as noStore } from 'next/cache'
import type { Intervenant } from '@/lib/definitions'
import { revalidatePath } from 'next/cache'

export async function getIntervenants(): Promise<Intervenant[]> {
    noStore()
    try {
        const intervenants = await db.intervenant.findMany({
            orderBy: {
                createdAt: 'desc'
            }
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