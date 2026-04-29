import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
  const isLoginPage = req.nextUrl.pathname === "/login"
  const isApiRoute = req.nextUrl.pathname.startsWith("/api")
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")

  // Allow auth API routes
  if (isAuthRoute) {
    return NextResponse.next()
  }

  // Redirect logged-in users away from login page
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Protect admin routes
  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
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
  matcher: ["/admin/:path*", "/login", "/api/:path*"],
}
