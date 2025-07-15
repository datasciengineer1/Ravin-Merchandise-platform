import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Product = {
  id: string
  name: string
  category: string
  sku: string
  price: number
  description?: string
  image_url?: string
  status: "active" | "inactive" | "discontinued"
  created_at: string
  updated_at: string
}

export type Location = {
  id: string
  name: string
  type: "warehouse" | "store" | "online"
  address?: string
  created_at: string
}

export type Inventory = {
  id: string
  product_id: string
  location_id: string
  quantity: number
  reorder_point: number
  last_updated: string
  products?: Product
  locations?: Location
}

export type Sale = {
  id: string
  product_id: string
  location_id: string
  quantity: number
  unit_price: number
  total_amount: number
  sale_date: string
  products?: Product
  locations?: Location
}
