import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getUserFromDb } from "@/lib/password"

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            email: string
            name?: string | null
        }
    }
}

const config: NextAuthConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnLogin = nextUrl.pathname.startsWith('/login')
            const isOnAdmin = nextUrl.pathname.startsWith('/admin')

            if (isOnLogin && isLoggedIn) {
                return Response.redirect(new URL('/admin', nextUrl))
            }

            if (isOnAdmin && !isLoggedIn) {
                return false
            }

            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.name = token.name as string | null
            }
            return session
        }
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                try {
                    const user = await getUserFromDb(
                        credentials.email as string,
                        credentials.password as string
                    )

                    if (!user) {
                        return null
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name
                    }
                } catch (error) {
                    console.error('Authorization error:', error)
                    return null
                }
            }
        })
    ],
    trustHost: true,
}

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth(config)