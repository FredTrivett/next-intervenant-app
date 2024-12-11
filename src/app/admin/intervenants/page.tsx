'use client'

import { AddIntervenantDialog } from '@/components/add-intervenant-dialog'
import { getIntervenants, regenerateAllKeys } from '@/lib/actions'
import { IntervenantList } from '@/components/intervenant-list'
import { useEffect, useState } from 'react'
import { Intervenant } from '@/lib/definitions'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
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
import { useToast } from "@/hooks/use-toast"

export default function IntervenantsPage() {
    const [intervenants, setIntervenants] = useState<Intervenant[]>([])
    const [loading, setLoading] = useState(true)
    const [regenerating, setRegenerating] = useState(false)
    const { toast } = useToast()

    const loadIntervenants = async () => {
        try {
            const data = await getIntervenants()
            setIntervenants(data)
        } catch (error) {
            console.error('Failed to load intervenants:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadIntervenants()
    }, [])

    const handleIntervenantAdded = async (newIntervenant: Intervenant) => {
        await loadIntervenants() // Reload all intervenants
    }

    const handleRegenerateAllKeys = async () => {
        try {
            setRegenerating(true)
            await regenerateAllKeys()
            await loadIntervenants()
            toast({
                title: "Success",
                description: "All keys have been regenerated successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to regenerate keys",
                variant: "destructive",
            })
        } finally {
            setRegenerating(false)
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Gestions des Intervenants</h1>
                <div className="flex gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Regenerate All Keys
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will regenerate keys for all intervenants. They will need to use their new keys to access the system.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleRegenerateAllKeys}
                                    className="bg-red-500 hover:bg-red-600"
                                    disabled={regenerating}
                                >
                                    {regenerating ? 'Regenerating...' : 'Regenerate All'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <AddIntervenantDialog onIntervenantAdded={handleIntervenantAdded} />
                </div>
            </div>

            <IntervenantList
                initialIntervenants={intervenants}
                onIntervenantsChange={loadIntervenants}
            />
        </div>
    )
}