import { getIntervenants } from '@/lib/actions'
import { IntervenantList } from '@/components/intervenant-list'
import { Suspense } from 'react'

async function IntervenantsDisplay() {
  try {
    const intervenants = await getIntervenants()

    if (!intervenants?.length) {
      return (
        <div className="text-center text-gray-500 py-8">
          No intervenants found.
        </div>
      )
    }

    return <IntervenantList intervenants={intervenants} />
  } catch (error) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-red-700">
        <h3 className="font-medium">Error</h3>
        <p>Failed to load intervenants. Please try again later.</p>
      </div>
    )
  }
}

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Intervenants</h1>
      <Suspense
        fallback={
          <div className="animate-pulse">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg border bg-white">
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <IntervenantsDisplay />
      </Suspense>
    </main>
  )
}
