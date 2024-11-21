import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnLogin = nextUrl.pathname.startsWith('/login')
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')

            // Redirect logged in users from login page to dashboard
            if (isOnLogin && isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }

            // Require auth for dashboard
            if (isOnDashboard && !isLoggedIn) {
                return false
            }

            return true
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
            }
            return token
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.name = token.name as string
            }
            return session
        }
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                // Your authorize logic here
                return null
            }
        })
    ]
} satisfies NextAuthConfig 