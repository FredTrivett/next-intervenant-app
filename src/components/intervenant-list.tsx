'use client'

import { Intervenant } from '@/lib/definitions'

interface IntervenantListProps {
    intervenants: Intervenant[]
}

export function IntervenantList({ intervenants }: IntervenantListProps) {
    if (!Array.isArray(intervenants) || intervenants.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                No intervenants available.
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {intervenants.map((intervenant) => (
                <div
                    key={intervenant.id}
                    className="p-4 rounded-lg border bg-white shadow-sm"
                >
                    <h3 className="font-medium text-lg">{intervenant.firstname}</h3>
                    <p className="text-gray-600">{intervenant.email}</p>
                    {intervenant.availabilities && (
                        <div className="mt-2">
                            <h4 className="font-medium">Availabilities:</h4>
                            <pre className="mt-1 text-sm text-gray-600 overflow-auto max-h-40">
                                {JSON.stringify(intervenant.availabilities, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
} 