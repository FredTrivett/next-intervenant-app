'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function NavAdmin() {
    const pathname = usePathname()

    const isActive = (path: string) => {
        return pathname === path
            ? "bg-gray-100 font-bold text-gray-900"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }

    return (
        <nav className="space-y-1">
            <h2 className="text-lg font-semibold mb-4 px-4">IUT mmi</h2>
            <Link
                className={`${isActive('/admin')} flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200`}
                href="/admin"
            >
                Admin
            </Link>
            <Link
                className={`${isActive('/admin/intervenants')} flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200`}
                href="/admin/intervenants"
            >
                Intervenants
            </Link>
            <Link
                className={`${isActive('/admin/disponibilites')} flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200`}
                href="/admin/disponibilites"
            >
                Disponibilités
            </Link>
        </nav>
    )
}