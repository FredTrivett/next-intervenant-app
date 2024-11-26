'use client'

import { AddIntervenantDialog } from '@/components/add-intervenant-dialog'
import { getIntervenants } from '@/lib/actions'
import { IntervenantList } from '@/components/intervenant-list'
import { useEffect, useState } from 'react'
import { Intervenant } from '@/lib/definitions'

export default function IntervenantsPage() {
    const [intervenants, setIntervenants] = useState<Intervenant[]>([])
    const [loading, setLoading] = useState(true)

    const loadIntervenants = async () => {
        try {
            const data = await getIntervenants()
            setIntervenants(data)
        } catch (error) {
            console.error('Failed to load intervenants:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadIntervenants()
    }, [])

    const handleIntervenantAdded = async (newIntervenant: Intervenant) => {
        await loadIntervenants() // Reload all intervenants
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Gestions des Intervenants</h1>
                <AddIntervenantDialog onIntervenantAdded={handleIntervenantAdded} />
            </div>

            <IntervenantList 
                initialIntervenants={intervenants} 
                onIntervenantsChange={loadIntervenants}
            />
        </div>
    )
}