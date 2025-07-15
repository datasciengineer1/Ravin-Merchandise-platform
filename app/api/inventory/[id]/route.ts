import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { quantity, reorder_point } = body

    const data = await sql`
      UPDATE inventory 
      SET quantity = ${quantity}, reorder_point = ${reorder_point}, last_updated = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `

    if (data.length === 0) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
