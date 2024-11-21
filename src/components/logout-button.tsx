'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await signOut({
                redirect: false,
                callbackUrl: '/login'
            })
            router.push('/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
            Log out
        </button>
    )
} 