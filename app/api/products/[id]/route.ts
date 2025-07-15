import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await sql`
      SELECT * FROM products WHERE id = ${params.id}
    `

    if (data.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, category, sku, price, description, image_url, status } = body

    const data = await sql`
      UPDATE products 
      SET name = ${name}, category = ${category}, sku = ${sku}, price = ${price}, 
          description = ${description || null}, image_url = ${image_url || null}, 
          status = ${status}, updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `

    if (data.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await sql`
      DELETE FROM products WHERE id = ${params.id} RETURNING id
    `

    if (data.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
