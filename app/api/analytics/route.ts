import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")
    const location = searchParams.get("location")

    // Get total products
    const totalProductsResult = await sql`
      SELECT COUNT(*) as count FROM products WHERE status = 'active'
    `
    const totalProducts = Number(totalProductsResult[0].count)

    // Get inventory value
    const inventoryValueResult = await sql`
      SELECT COALESCE(SUM(i.quantity * p.price), 0) as total_value
      FROM inventory i
      JOIN products p ON i.product_id = p.id
    `
    const inventoryValue = Number(inventoryValueResult[0].total_value) || 0

    // Get low stock items
    const lowStockResult = await sql`
      SELECT COUNT(*) as count
      FROM inventory
      WHERE quantity <= reorder_point AND quantity > 0
    `
    const lowStockItems = Number(lowStockResult[0].count)

    // Get sales data for the specified period
    const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const salesQueryParams = [dateThreshold]
    let locationFilter = ""

    if (location && location !== "all") {
      locationFilter = ` AND s.location_id = $2`
      salesQueryParams.push(location)
    }

    const salesQuery = `
      SELECT 
        s.id,
        s.product_id,
        s.location_id,
        s.quantity,
        s.unit_price,
        s.total_amount,
        s.sale_date,
        p.name as product_name,
        p.category as product_category,
        l.name as location_name,
        l.type as location_type
      FROM sales s
      JOIN products p ON s.product_id = p.id
      JOIN locations l ON s.location_id = l.id
      WHERE s.sale_date >= $1${locationFilter}
      ORDER BY s.sale_date DESC
    `

    const salesData = await sql.query(salesQuery, salesQueryParams)

    // Calculate analytics
    const totalSales = salesData.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
    const totalUnits = salesData.reduce((sum, sale) => sum + Number(sale.quantity), 0)
    const avgOrderValue = totalUnits > 0 ? totalSales / totalUnits : 0

    // Get top selling products
    const productSalesMap = salesData.reduce((acc, sale) => {
      const productId = sale.product_id
      if (!acc[productId]) {
        acc[productId] = {
          product_id: productId,
          name: sale.product_name || "Unknown",
          category: sale.product_category || "Unknown",
          total_quantity: 0,
          total_revenue: 0,
        }
      }
      acc[productId].total_quantity += Number(sale.quantity)
      acc[productId].total_revenue += Number(sale.total_amount)
      return acc
    }, {})

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 5)

    // Get category performance
    const categoryPerformanceMap = salesData.reduce((acc, sale) => {
      const category = sale.product_category || "Unknown"
      if (!acc[category]) {
        acc[category] = { category, total_revenue: 0, total_quantity: 0 }
      }
      acc[category].total_revenue += Number(sale.total_amount)
      acc[category].total_quantity += Number(sale.quantity)
      return acc
    }, {})

    const topCategories = Object.values(categoryPerformanceMap).sort((a, b) => b.total_revenue - a.total_revenue)

    return NextResponse.json({
      overview: {
        totalProducts,
        inventoryValue: Math.round(inventoryValue * 100) / 100,
        lowStockItems,
        totalSales: Math.round(totalSales * 100) / 100,
        totalUnits,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      },
      topProducts,
      topCategories,
      salesData,
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
