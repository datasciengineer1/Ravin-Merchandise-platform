import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function GET() {
  try {
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`

    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('products', 'locations', 'inventory', 'sales')
    `

    // Count records in each table
    const counts = {}
    try {
      const productCount = await sql`SELECT COUNT(*) as count FROM products`
      counts.products = Number(productCount[0].count)
    } catch (e) {
      counts.products = "Table doesn't exist"
    }

    try {
      const locationCount = await sql`SELECT COUNT(*) as count FROM locations`
      counts.locations = Number(locationCount[0].count)
    } catch (e) {
      counts.locations = "Table doesn't exist"
    }

    try {
      const inventoryCount = await sql`SELECT COUNT(*) as count FROM inventory`
      counts.inventory = Number(inventoryCount[0].count)
    } catch (e) {
      counts.inventory = "Table doesn't exist"
    }

    try {
      const salesCount = await sql`SELECT COUNT(*) as count FROM sales`
      counts.sales = Number(salesCount[0].count)
    } catch (e) {
      counts.sales = "Table doesn't exist"
    }

    return NextResponse.json({
      connection: "OK",
      currentTime: result[0].current_time,
      tables: tables.map((t) => t.table_name),
      recordCounts: counts,
    })
  } catch (error) {
    console.error("Connection test error:", error)
    return NextResponse.json(
      {
        connection: "FAILED",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
