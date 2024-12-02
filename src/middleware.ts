import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    // If the user is not logged in and trying to access admin routes
    if (!req.auth && req.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        '/admin/:path*',
    ],
}