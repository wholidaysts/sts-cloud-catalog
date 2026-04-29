import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getServiceStats } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await getServiceStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
