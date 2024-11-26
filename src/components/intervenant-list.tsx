'use client'

import { Intervenant } from '@/lib/definitions'
import { Trash2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from 'react'
import { deleteIntervenant } from '@/lib/actions'

interface IntervenantListProps {
    intervenants: Intervenant[]
}

export function IntervenantList({ intervenants: initialIntervenants }: IntervenantListProps) {
    const [intervenants, setIntervenants] = useState(initialIntervenants)

    const handleDelete = async (id: string) => {
        try {
            await deleteIntervenant(id)
            setIntervenants(intervenants.filter(int => int.id !== id))
        } catch (error) {
            console.error('Failed to delete intervenant:', error)
        }
    }

    if (!Array.isArray(intervenants) || intervenants.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                No intervenants available.
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {intervenants.map((intervenant) => (
                <div
                    key={intervenant.id}
                    className="p-4 rounded-lg border bg-white shadow-sm relative"
                >
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete{' '}
                                    <span className="font-medium">{intervenant.firstname} {intervenant.lastname}</span>'s
                                    account and remove their data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDelete(intervenant.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <h3 className="font-medium text-lg">{intervenant.firstname}</h3>
                    <p className="text-gray-600">{intervenant.email}</p>
                    {intervenant.availabilities && (
                        <div className="mt-2">
                            <h4 className="font-medium">Availabilities:</h4>
                            <pre className="mt-1 text-sm text-gray-600 overflow-auto max-h-40">
                                {JSON.stringify(intervenant.availabilities, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
} 