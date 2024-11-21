import { createUser } from '@/lib/password'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const UserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate the request body
        const { email, password, name } = UserSchema.parse(body)

        // Create the user
        const user = await createUser(email, password, name)

        return NextResponse.json({ user }, { status: 201 })
    } catch (error) {
        console.error('Registration error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Invalid input data', errors: error.errors },
                { status: 400 }
            )
        }

        // Handle unique constraint violation (email already exists)
        if (error instanceof Error && error.message.includes('unique constraint')) {
            return NextResponse.json(
                { message: 'Email already exists' },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
} 