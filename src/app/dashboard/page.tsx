import { auth } from "@/auth"
import { redirect } from "next/navigation"
import LogoutButton from '@/components/logout-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    return (
        <div className=" bg-gray-50/50">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-between py-2 px-6">
                    <h1 className="font-bold text-lg">Dashboard</h1>
                    <LogoutButton />
                </div>
            </header>

            <main className="container p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>Your personal information</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Name:</span>
                                <span>{session.user.name || 'Not set'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Email:</span>
                                <span>{session.user.email}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}