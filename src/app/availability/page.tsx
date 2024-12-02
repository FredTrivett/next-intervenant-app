import { validateIntervenantKey } from '@/lib/actions'
import { notFound } from 'next/navigation'

export default async function AvailabilityPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const key = searchParams.key

    // If no key provided or key is not a string, return 404
    if (!key || typeof key !== 'string') {
        notFound()
    }

    // Validate the key
    const intervenant = await validateIntervenantKey(key)

    // If no intervenant found or key is invalid/expired, return 404
    if (!intervenant) {
        notFound()
    }

    // Check if key has expired
    if (new Date() > new Date(intervenant.expiresAt)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full space-y-8 p-8">
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Access Expired
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>
                                        Your access key has expired. Please contact the administrator
                                        for a new key.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // If everything is valid, show the greeting
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">
                        Bonjour {intervenant.firstname} {intervenant.lastname}
                    </h1>
                </div>
            </div>
        </div>
    )
} 