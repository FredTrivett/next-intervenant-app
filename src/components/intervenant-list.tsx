'use client'

import { useState, useEffect } from 'react'
import { Intervenant } from '@/lib/definitions'
import { Trash2, Edit } from 'lucide-react'
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
import { deleteIntervenant } from '@/lib/actions'
import { EditIntervenantDialog } from './edit-intervenant-dialog'
import { Button } from './ui/button'

interface IntervenantListProps {
    initialIntervenants: Intervenant[]
    onIntervenantsChange: () => Promise<void>
}

export function IntervenantList({ initialIntervenants, onIntervenantsChange }: IntervenantListProps) {
    const [intervenants, setIntervenants] = useState(initialIntervenants)

    const handleDelete = async (id: string) => {
        try {
            await deleteIntervenant(id)
            await onIntervenantsChange()
        } catch (error) {
            console.error('Failed to delete intervenant:', error)
        }
    }

    const handleUpdate = async (updated: Intervenant) => {
        try {
            await onIntervenantsChange()
        } catch (error) {
            console.error('Failed to update list:', error)
        }
    }

    useEffect(() => {
        setIntervenants(initialIntervenants)
    }, [initialIntervenants])

    if (!intervenants || intervenants.length === 0) {
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
                    <div className="flex justify-between items-center">
                        <h3 className="font-medium text-lg">{intervenant.firstname}</h3>

                        <div className="flex justify-end gap-1">
                        <EditIntervenantDialog 
                            intervenant={intervenant}
                            onIntervenantUpdated={handleUpdate}
                        />

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete{' '}
                                        <span className="font-medium">
                                            {intervenant.firstname} {intervenant.lastname}
                                        </span>'s
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
                        </div>
                    </div>

                    <div className="pr-20">
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
                </div>
            ))}
        </div>
    )
} 