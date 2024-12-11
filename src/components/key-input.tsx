'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { KeyRound } from 'lucide-react'

export function KeyInput() {
    const [key, setKey] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!key.trim()) {
            setError('Please enter an access key')
            setLoading(false)
            return
        }

        // Redirect to the same page with the key as a query parameter
        router.push(`/availability?key=${encodeURIComponent(key.trim())}`)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <Input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Enter your access key"
                    className="pl-10"
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {error && (
                <p className="text-sm text-red-500">
                    {error}
                </p>
            )}

            <Button
                type="submit"
                className="w-full"
                disabled={loading}
            >
                {loading ? 'Checking...' : 'Access Availabilities'}
            </Button>
        </form>
    )
} 