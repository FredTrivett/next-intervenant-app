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
import { AlertDialogCancel } from './ui/alert-dialog'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const formSchema = z.object({
    firstname: z.string().min(2, "First name must be at least 2 characters"),
    lastname: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    expiresAt: z.date({
        required_error: "A date of expiration is required",
    }),
})

interface AddIntervenantFormProps {
    onSuccess?: (intervenant: any) => void;
}

export function AddIntervenantForm({ onSuccess }: AddIntervenantFormProps) {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Set default expiry date to 2 months from now
    const defaultExpiryDate = new Date()
    defaultExpiryDate.setMonth(defaultExpiryDate.getMonth() + 2)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            email: "",
            expiresAt: defaultExpiryDate,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        setError(null)

        try {
            const key = uuidv4()
            const createdAt = new Date()
            const expiresAt = values.expiresAt

            const result = await addIntervenant({
                ...values,
                key,
                createdAt,
                expiresAt,
            })

            if (result) {
                form.reset()
                if (onSuccess) {
                    onSuccess(result)
                }
                // Close the dialog
                document.querySelector<HTMLButtonElement>('[data-dismiss]')?.click()
            }
        } catch (error: any) {
            if (error.message === 'Email already exists') {
                setError('This email is already registered')
            } else {
                console.error('Form submission error:', error)
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

                <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date de fin</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date < new Date() // Disable past dates
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
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