import { getIntervenants } from '@/lib/actions'
import { IntervenantList } from '@/components/intervenant-list'

async function IntervenantsDisplay() {
    const intervenants = await getIntervenants()

    if (!intervenants || intervenants.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                No intervenants found.
            </div>
        )
    }

    return <IntervenantList intervenants={intervenants} />
}

export default async function Disponibilites() {
    return (
        <main className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Disponibilités des Disponibilités</h1>
            <IntervenantsDisplay />
        </main>
    )
}
