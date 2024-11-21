'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import LogoutButton from '@/components/logout-button'


export default function DashboardPage() {
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login')
        }
    }, [status])

    if (status === 'loading') {
        return <div>Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {session?.user && (
                    <div className="flex items-center">
                        <span className="text-gray-700 mr-4">
                            Welcome, {session.user.name || session.user.email}
                        </span>
                        <LogoutButton />
                    </div>
                )}
            </main>
        </div>
    )
}