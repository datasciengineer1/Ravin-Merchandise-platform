import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const location = searchParams.get("location")

    const whereConditions = ["1=1"]
    const queryParams = []

    if (search) {
      whereConditions.push(`(p.name ILIKE $${queryParams.length + 1} OR p.sku ILIKE $${queryParams.length + 2})`)
      queryParams.push(`%${search}%`, `%${search}%`)
    }

    if (location && location !== "all") {
      whereConditions.push(`i.location_id = $${queryParams.length + 1}`)
      queryParams.push(location)
    }

    const query = `
      SELECT 
        i.id,
        i.product_id,
        i.location_id,
        i.quantity,
        i.reorder_point,
        i.last_updated,
        p.name as product_name,
        p.sku as product_sku,
        p.category as product_category,
        p.price as product_price,
        p.status as product_status,
        l.name as location_name,
        l.type as location_type
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN locations l ON i.location_id = l.id
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY i.last_updated DESC
    `

    const data = await sql.query(query, queryParams)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, location_id, quantity, reorder_point } = body

    const data = await sql`
      INSERT INTO inventory (product_id, location_id, quantity, reorder_point)
      VALUES (${product_id}, ${location_id}, ${quantity}, ${reorder_point})
      RETURNING *
    `

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
