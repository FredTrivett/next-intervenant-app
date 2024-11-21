import { Intervenant } from '@/lib/definitions'

export function IntervenantList({ intervenants }: { intervenants: Intervenant[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {intervenants.map((intervenant) => (
                <div
                    key={intervenant.id}
                    className="p-4 rounded-lg border bg-white shadow-sm"
                >
                    <h3 className="font-medium text-lg">{intervenant.name}</h3>
                    <p className="text-gray-600">{intervenant.email}</p>
                    <div className="mt-2">
                        <h4 className="font-medium">Availabilities:</h4>
                        <pre className="mt-1 text-sm text-gray-600 overflow-auto max-h-40">
                            {JSON.stringify(intervenant.availabilities, null, 2)}
                        </pre>
                    </div>
                </div>
            ))}
        </div>
    )
} 