import { getIntervenants } from '@/lib/actions'
import { IntervenantList } from '@/components/intervenant-list'
import { Suspense } from 'react'

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border bg-white">
            <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

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

export default async function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Intervenants</h1>
      <Suspense fallback={<LoadingSkeleton />}>
        <IntervenantsDisplay />
      </Suspense>
    </main>
  )
}
