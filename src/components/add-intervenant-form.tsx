'use client'

import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { v4 as uuidv4 } from 'uuid'
import { addIntervenant } from '@/lib/actions'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { AlertDialogCancel } from './ui/alert-dialog'
import { Intervenant } from '@/lib/definitions'

const formSchema = z.object({
    firstname: z.string().min(2, "First name must be at least 2 characters"),
    lastname: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
})

interface AddIntervenantFormProps {
    onSuccess: (intervenant: Intervenant) => void
}

export function AddIntervenantForm({ onSuccess }: AddIntervenantFormProps) {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        setError(null)

        try {
            const key = uuidv4()
            const createdAt = new Date()
            const expiresAt = new Date(createdAt)
            expiresAt.setMonth(expiresAt.getMonth() + 2)

            const newIntervenant = await addIntervenant({
                ...values,
                key,
                createdAt,
                expiresAt,
            })

            form.reset()
            onSuccess(newIntervenant)
            document.querySelector<HTMLButtonElement>('[data-dismiss]')?.click()
        } catch (error: any) {
            if (error.message.includes('Unique constraint')) {
                setError('This email is already registered')
            } else {
                setError('Something went wrong. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="lastname"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="john.doe@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                    <AlertDialogCancel data-dismiss>Cancel</AlertDialogCancel>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Adding..." : "Add Intervenant"}
                    </Button>
                </div>
            </form>
        </Form>
    )
} 