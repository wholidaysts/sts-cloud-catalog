import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
  const isRootPage = req.nextUrl.pathname === "/"
  const isApiRoute = req.nextUrl.pathname.startsWith("/api")
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")

  // Allow auth API routes
  if (isAuthRoute) {
    return NextResponse.next()
  }

  // Protect admin routes - redirect to root (login)
  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Protect API routes (except public GET for services list)
  if (isApiRoute && !isAuthRoute) {
    const isServicesGet = req.nextUrl.pathname === "/api/services" && req.method === "GET"
    if (!isServicesGet && !isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
}
