import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware() {
    // Add any additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to API routes and home page
        if (req.nextUrl.pathname.startsWith("/api/auth/") ||
            req.nextUrl.pathname === "/") {
          return true
        }
        
        // Require authentication for dashboard and other protected routes
        if (req.nextUrl.pathname.startsWith("/dashboard/") ||
            req.nextUrl.pathname === "/dashboard") {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/auth/:path*"
  ]
}
