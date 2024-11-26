'use client'

import { AddIntervenantDialog } from '@/components/add-intervenant-dialog'
import { getIntervenants } from '@/lib/actions'
import { IntervenantList } from '@/components/intervenant-list'
import { useEffect, useState } from 'react'
import { Intervenant } from '@/lib/definitions'

export default function IntervenantsPage() {
    const [intervenants, setIntervenants] = useState<Intervenant[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
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
        loadIntervenants()
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Intervenants</h1>
                <AddIntervenantDialog onIntervenantAdded={(newIntervenant) => {
                    setIntervenants(prev => [newIntervenant, ...prev])
                }} />
            </div>

            <IntervenantList 
                intervenants={intervenants} 
                setIntervenants={setIntervenants}
            />
        </div>
    )
}