import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { getUserFromDb } from "@/lib/password"

export const { auth, handlers: { GET, POST }, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        {
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                try {
                    const user = await getUserFromDb(
                        credentials.email,
                        credentials.password
                    )

                    if (!user) {
                        return null
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    }
                } catch (error) {
                    console.error('Authentication error:', error)
                    return null
                }
            }
        }
    ],
    session: { strategy: "jwt" }
})