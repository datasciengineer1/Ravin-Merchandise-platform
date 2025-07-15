import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    const whereConditions = []
    const queryParams = []

    if (search) {
      whereConditions.push(`(name ILIKE $${queryParams.length + 1} OR sku ILIKE $${queryParams.length + 2})`)
      queryParams.push(`%${search}%`, `%${search}%`)
    }

    if (category && category !== "all") {
      whereConditions.push(`category = $${queryParams.length + 1}`)
      queryParams.push(category)
    }

    if (status && status !== "all") {
      whereConditions.push(`status = $${queryParams.length + 1}`)
      queryParams.push(status)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""
    const query = `SELECT * FROM products ${whereClause} ORDER BY created_at DESC`

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
    const { name, category, sku, price, description, image_url, status = "active" } = body

    const data = await sql`
      INSERT INTO products (name, category, sku, price, description, image_url, status)
      VALUES (${name}, ${category}, ${sku}, ${price}, ${description || null}, ${image_url || null}, ${status})
      RETURNING *
    `

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
