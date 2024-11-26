'use client'

import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit } from "lucide-react"
import { Intervenant } from "@/lib/definitions"
import { EditIntervenantForm } from "./edit-intervenant-form"

interface EditIntervenantDialogProps {
    intervenant: Intervenant
    onIntervenantUpdated: (updatedIntervenant: Intervenant) => void
}

export function EditIntervenantDialog({ intervenant, onIntervenantUpdated }: EditIntervenantDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="">
                    <Edit className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Intervenant</AlertDialogTitle>
                </AlertDialogHeader>
                <EditIntervenantForm 
                    intervenant={intervenant} 
                    onSuccess={onIntervenantUpdated} 
                />
            </AlertDialogContent>
        </AlertDialog>
    )
} 