import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
})

export const config = { matcher: ["/", "/reservations/:path*", "/aircraft/:path*", "/maintenance/:path*", "/billing/:path*", "/members/:path*", "/settings/:path*"] }
