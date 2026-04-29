import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getServiceById, updateService, deleteService } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const service = await getServiceById(id)
    
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }
    
    return NextResponse.json(service)
  } catch (error) {
    console.error("Failed to fetch service:", error)
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const service = await updateService(id, body, session.user.email)
    
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }
    
    return NextResponse.json(service)
  } catch (error) {
    console.error("Failed to update service:", error)
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const deleted = await deleteService(id, session.user.email)
    
    if (!deleted) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete service:", error)
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    )
  }
}
