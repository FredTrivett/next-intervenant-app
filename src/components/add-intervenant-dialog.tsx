'use client'

import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AddIntervenantForm } from "./add-intervenant-form"
import { Plus } from "lucide-react"
import { Intervenant } from "@/lib/definitions"

interface AddIntervenantDialogProps {
    onIntervenantAdded: (intervenant: Intervenant) => void
}

export function AddIntervenantDialog({ onIntervenantAdded }: AddIntervenantDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add New Intervenant
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Add New Intervenant</AlertDialogTitle>
                </AlertDialogHeader>
                <AddIntervenantForm onSuccess={onIntervenantAdded} />
            </AlertDialogContent>
        </AlertDialog>
    )
} 