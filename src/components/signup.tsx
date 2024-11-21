'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import Link from 'next/link'

export default function SignUp() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const name = formData.get('name') as string

        try {
            // First, create the user
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create account')
            }

            // If successful, sign in the user
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError(result.error)
            } else {
                router.push('/dashboard')
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            <div className="text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700">
                    Sign in
                </Link>
            </div>
        </form>
    )
} 