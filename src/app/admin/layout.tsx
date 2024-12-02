import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import NavAdmin from "@/components/nav-admin"
import LogoutButton from "@/components/logout-button"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-sm">
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">Admin Panel</h2>
                        {/* <p className="text-sm text-gray-500">{session.user.name}</p> */}
                        <p className="text-sm text-gray-500">{session.user.email}</p>
                    </div>
                    <div className="flex-1 px-3 py-4 overflow-y-auto">
                        <NavAdmin />
                    </div>
                    <div className="px-3 py-4 border-t">
                        <LogoutButton />
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}