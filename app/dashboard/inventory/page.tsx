"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpDown, Filter, Plus, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Inventory, Location } from "@/lib/neon"
import { Label } from "@/components/ui/label" // Ensure Label is imported

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")

  useEffect(() => {
    fetchLocations()
    fetchInventory()
  }, [searchTerm, selectedLocation])

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations")
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }

  const fetchInventory = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (selectedLocation !== "all") params.append("location", selectedLocation)

      const response = await fetch(`/api/inventory?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInventory(data)
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (quantity: number, reorderPoint: number) => {
    if (quantity === 0) return { status: "Out of Stock", color: "bg-red-500" }
    if (quantity <= reorderPoint) return { status: "Low Stock", color: "bg-yellow-500" }
    return { status: "In Stock", color: "bg-green-500" }
  }

  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0)
  const lowStockItems = inventory.filter((item) => item.quantity <= item.reorder_point && item.quantity > 0).length
  const outOfStockItems = inventory.filter((item) => item.quantity === 0).length
  const inventoryValue = inventory.reduce((sum, item) => sum + item.quantity * (item.product_price || 0), 0)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <ShoppingBag className="h-6 w-6" />
          <span>Ravin Merchandising Platform</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/products">
            Products
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/inventory">
            Inventory
          </Link>
          <Link className="text-sm font-medium" href="/dashboard/analytics">
            Analytics
          </Link>
        </nav>
        <Button variant="outline" size="sm">
          Sign Out
        </Button>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">Inventory Management</h1>
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Stock
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Items</CardTitle>
              <CardDescription>Across all locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Current stock level</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Low Stock</CardTitle>
              <CardDescription>Items below threshold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Need restocking</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Out of Stock</CardTitle>
              <CardDescription>Items at zero inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outOfStockItems}</div>
              <p className="text-xs text-muted-foreground">Immediate attention needed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Inventory Value</CardTitle>
              <CardDescription>Total stock value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${inventoryValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Current valuation</p>
            </CardContent>
          </Card>
        </div>
        <div className="border rounded-lg">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Added Label, id, and name attributes */}
              <Label htmlFor="inventory-search" className="sr-only">
                Search inventory
              </Label>
              <Input
                id="inventory-search"
                name="inventory-search"
                className="h-8 w-[150px] lg:w-[250px]"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline" size="sm" className="h-8 gap-1 bg-transparent">
                <Filter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline-block">Filter</span>
              </Button>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-8 w-[130px]">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 bg-transparent">
                Export
              </Button>
              <Button size="sm" className="h-8">
                Update Stock
              </Button>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading inventory...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Product
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Quantity
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Reorder Point</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => {
                  const stockStatus = getStockStatus(item.quantity, item.reorder_point)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell>{item.product_sku}</TableCell>
                      <TableCell>{item.location_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.reorder_point}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full ${stockStatus.color} mr-2`}></div>
                          {stockStatus.status}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(item.last_updated).toLocaleDateString()}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
          <div className="flex items-center justify-end p-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
