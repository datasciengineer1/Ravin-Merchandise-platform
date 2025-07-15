import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function POST() {
  try {
    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS products (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          sku VARCHAR(50) UNIQUE NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          description TEXT,
          image_url TEXT,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS locations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('warehouse', 'store', 'online')),
          address TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS inventory (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL DEFAULT 0,
          reorder_point INTEGER NOT NULL DEFAULT 10,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(product_id, location_id)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS sales (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10,2) NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Insert sample locations
    await sql`
      INSERT INTO locations (name, type, address) 
      VALUES 
        ('Main Warehouse', 'warehouse', '123 Industrial Blvd, City, State 12345'),
        ('Store #1', 'store', '456 Main St, Downtown, State 12345'),
        ('Store #2', 'store', '789 Oak Ave, Uptown, State 12345'),
        ('Online Store', 'online', 'Virtual Location')
      ON CONFLICT DO NOTHING
    `

    // Insert sample products
    await sql`
      INSERT INTO products (name, category, sku, price, description, status) 
      VALUES 
        ('Premium Denim Jacket', 'Apparel', 'PDJ-001', 89.99, 'High-quality denim jacket with premium finish', 'active'),
        ('Casual Sneakers', 'Footwear', 'CS-002', 59.99, 'Comfortable casual sneakers for everyday wear', 'active'),
        ('Graphic T-Shirt', 'Apparel', 'GTS-003', 24.99, 'Cotton t-shirt with unique graphic design', 'active'),
        ('Leather Wallet', 'Accessories', 'LW-004', 39.99, 'Genuine leather wallet with multiple compartments', 'active'),
        ('Summer Hat', 'Accessories', 'SH-005', 19.99, 'Lightweight summer hat with UV protection', 'active'),
        ('Winter Scarf', 'Accessories', 'WS-006', 29.99, 'Warm winter scarf made from soft wool blend', 'active'),
        ('Sunglasses', 'Accessories', 'SG-007', 49.99, 'Stylish sunglasses with UV protection', 'active')
      ON CONFLICT (sku) DO NOTHING
    `

    // Get product and location IDs for inventory
    const products = await sql`SELECT id, name FROM products LIMIT 7`
    const locations = await sql`SELECT id, name FROM locations`

    // Insert inventory data
    for (const product of products) {
      for (const location of locations) {
        const quantity = Math.floor(Math.random() * 100) + 10
        const reorderPoint = Math.floor(Math.random() * 20) + 5

        await sql`
          INSERT INTO inventory (product_id, location_id, quantity, reorder_point)
          VALUES (${product.id}, ${location.id}, ${quantity}, ${reorderPoint})
          ON CONFLICT (product_id, location_id) DO NOTHING
        `
      }
    }

    // Insert sample sales data
    for (let i = 0; i < 50; i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)]
      const randomLocation = locations[Math.floor(Math.random() * locations.length)]
      const quantity = Math.floor(Math.random() * 5) + 1
      const unitPrice = Math.random() * 100 + 10
      const totalAmount = quantity * unitPrice
      const saleDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)

      await sql`
        INSERT INTO sales (product_id, location_id, quantity, unit_price, total_amount, sale_date)
        VALUES (${randomProduct.id}, ${randomLocation.id}, ${quantity}, ${unitPrice}, ${totalAmount}, ${saleDate})
      `
    }

    return NextResponse.json({ message: "Database initialized successfully" })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
