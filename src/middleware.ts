import { auth } from "./auth"

export default auth((req) => {
    // Middleware code here
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}