export { default } from "next-auth/middleware"

export const config = { matcher: ["/", "/reservations/:path*", "/aircraft/:path*", "/maintenance/:path*", "/billing/:path*", "/members/:path*", "/settings/:path*"] }
