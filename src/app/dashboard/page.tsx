import { auth } from "@/auth"
import { redirect } from "next/navigation"
import LogoutButton from '@/components/logout-button'

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <LogoutButton />
                    </div>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            Hello, <span className="font-semibold">{session.user.name || 'User'}</span>!
                        </p>
                        <p className="text-gray-600">
                            Your email: {session.user.email}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}