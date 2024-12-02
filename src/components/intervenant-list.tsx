'use client'

import { useState, useEffect } from 'react'
import { Intervenant } from '@/lib/definitions'
import { Trash2, Edit, RefreshCw, Key } from 'lucide-react'
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
import { deleteIntervenant, regenerateKey, regenerateAllKeys } from '@/lib/actions'
import { EditIntervenantDialog } from './edit-intervenant-dialog'
import { Button } from './ui/button'
import { useToast } from "@/hooks/use-toast"

interface IntervenantListProps {
    initialIntervenants: Intervenant[]
    onIntervenantsChange: () => Promise<void>
}

export function IntervenantList({ initialIntervenants, onIntervenantsChange }: IntervenantListProps) {
    const [intervenants, setIntervenants] = useState(initialIntervenants)
    const [loading, setLoading] = useState<string | null>(null)
    const { toast } = useToast()

    const handleRegenerateKey = async (id: string) => {
        try {
            setLoading(id)
            await regenerateKey(id)
            await onIntervenantsChange()
            toast({
                title: "Success",
                description: "Key regenerated successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to regenerate key",
                variant: "destructive",
            })
        } finally {
            setLoading(null)
        }
    }

    const handleRegenerateAllKeys = async () => {
        try {
            setLoading('all')
            await regenerateAllKeys()
            await onIntervenantsChange()
            toast({
                title: "Success",
                description: "All keys regenerated successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to regenerate keys",
                variant: "destructive",
            })
        } finally {
            setLoading(null)
        }
    }

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
        <div className="space-y-4">

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {intervenants.map((intervenant) => (
                    <div
                        key={intervenant.id}
                        className="p-4 rounded-lg border bg-white shadow-sm relative"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium text-base">
                                    {intervenant.firstname} {intervenant.lastname}
                                </h3>
                            </div>

                            <div className="flex justify-end gap-1">
                                <EditIntervenantDialog
                                    intervenant={intervenant}
                                    onIntervenantUpdated={handleUpdate}
                                />

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRegenerateKey(intervenant.id)}
                                    disabled={loading === intervenant.id}
                                    className="text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                    <Key className="h-4 w-4" />
                                </Button>

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
                            <p className="text-gray-600 text-sm">{intervenant.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Key: {intervenant.key}
                            </p>
                            <p className="text-sm text-gray-500">
                                Expires: {new Date(intervenant.expiresAt).toLocaleDateString()}
                            </p>
                            {intervenant.availabilities && (
                                <div className="mt-2">
                                    <h4 className="font-medium text-sm">Availabilities:</h4>
                                    <pre className="mt-1 text-xs text-gray-600 overflow-auto max-h-40">
                                        {JSON.stringify(intervenant.availabilities, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 