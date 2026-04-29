import { NextRequest, NextResponse } from "next/server"
import { auth, isAuthEnabled } from "@/lib/auth"
import { getAllServices, createService } from "@/lib/db"

export async function GET() {
  try {
    const services = await getAllServices()
    return NextResponse.json(services)
  } catch (error) {
    console.error("Failed to fetch services:", error)
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    let userEmail = "system@local"
    if (isAuthEnabled) {
      const session = await auth()
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      userEmail = session.user.email
    }

    const body = await request.json()
    const service = await createService(body, userEmail)
    
    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Failed to create service:", error)
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    )
  }
}
