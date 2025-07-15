"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Location } from "@/lib/supabase"
import type { Sale } from "@/lib/neon" // Ensure Sale type is imported

interface AnalyticsData {
  overview: {
    totalProducts: number
    inventoryValue: number
    lowStockItems: number
    totalSales: number
    totalUnits: number
    avgOrderValue: number
  }
  topProducts: Array<{
    name: string
    category: string
    total_quantity: number
    total_revenue: number
    image_url?: string
  }>
  topCategories: Array<{
    category: string
    total_revenue: number
    total_quantity: number
  }>
  salesData: Sale[]
}

export default function AnalyticsPage() {
  console.log("AnalyticsPage component rendering...") // ADD THIS LOG
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("30")

  useEffect(() => {
    console.log(
      "AnalyticsPage useEffect triggered. Fetching data for location:",
      selectedLocation,
      "period:",
      selectedPeriod,
    ) // ADD THIS LOG
    fetchLocations()
    fetchAnalytics()
  }, [selectedLocation, selectedPeriod])

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

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams()
      params.append("days", selectedPeriod)
      if (selectedLocation !== "all") params.append("location", selectedLocation)

      console.log("Fetching analytics from /api/analytics with params:", params.toString()) // ADD THIS LOG
      const response = await fetch(`/api/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
        console.log("Analytics data fetched and set:", data) // ADD THIS LOG
      } else {
        const errorData = await response.json()
        console.error("Error response from /api/analytics:", errorData) // ADD THIS LOG
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
      console.log("AnalyticsPage loading state set to false.") // ADD THIS LOG
    }
  }

  const processSalesDataForTrend = (salesData: Sale[], days: number) => {
    console.log("Processing sales data for trend. Raw salesData:", salesData) // ADD THIS LOG
    const dailySales: { [key: string]: number } = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Initialize all days in the period to 0 sales
    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dailySales[date.toISOString().split("T")[0]] = 0
    }

    salesData.forEach((sale) => {
      const saleDate = new Date(sale.sale_date).toISOString().split("T")[0]
      if (dailySales[saleDate] !== undefined) {
        dailySales[saleDate] += Number(sale.total_amount)
      }
    })

    const processed = Object.keys(dailySales)
      .sort()
      .map((date) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        sales: Math.round(dailySales[date] * 100) / 100,
      }))
    console.log("Processed sales data for trend chart:", processed) // ADD THIS LOG
    return processed
  }

  const processSalesDataForLocation = (salesData: Sale[]) => {
    console.log("Processing sales data for location. Raw salesData:", salesData) // ADD THIS LOG
    const locationSales: { [key: string]: number } = {}
    salesData.forEach((sale) => {
      const locationName = sale.location_name || "Unknown Location"
      if (!locationSales[locationName]) {
        locationSales[locationName] = 0
      }
      locationSales[locationName] += Number(sale.total_amount)
    })

    const processed = Object.keys(locationSales)
      .map((name) => ({
        name,
        sales: Math.round(locationSales[name] * 100) / 100,
      }))
      .sort((a, b) => b.sales - a.sales)
    console.log("Processed sales data for location chart:", processed) // ADD THIS LOG
    return processed
  }

  if (loading) {
    console.log("AnalyticsPage: Currently in loading state.") // ADD THIS LOG
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold md:text-2xl">Analytics</h1>
            <p className="text-sm text-muted-foreground">Track your merchandising performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
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
        </div>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Sales</CardTitle>
                  <CardDescription>Last {selectedPeriod} days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics?.overview.totalSales.toFixed(2) || "0.00"}</div>
                  <p className="text-xs text-muted-foreground">Revenue generated</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Units Sold</CardTitle>
                  <CardDescription>Last {selectedPeriod} days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.overview.totalUnits.toLocaleString() || "0"}</div>
                  <p className="text-xs text-muted-foreground">Items sold</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Avg. Order Value</CardTitle>
                  <CardDescription>Last {selectedPeriod} days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics?.overview.avgOrderValue.toFixed(2) || "0.00"}</div>
                  <p className="text-xs text-muted-foreground">Per transaction</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Inventory Value</CardTitle>
                  <CardDescription>Current total</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics?.overview.inventoryValue.toFixed(2) || "0.00"}</div>
                  <p className="text-xs text-muted-foreground">Stock valuation</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Sales Trend</CardTitle>
                  <CardDescription>Daily sales over the last {selectedPeriod} days</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.salesData && (
                    <ChartContainer
                      config={{
                        sales: {
                          label: "Sales",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={processSalesDataForTrend(analytics.salesData, Number(selectedPeriod))}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid vertical={false} strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Top Selling Categories</CardTitle>
                  <CardDescription>By revenue in the last {selectedPeriod} days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.topCategories.slice(0, 3).map((category, index) => {
                      const maxRevenue = analytics.topCategories[0]?.total_revenue || 1
                      const percentage = (category.total_revenue / maxRevenue) * 100
                      return (
                        <div key={category.category}>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">{category.category}</p>
                            </div>
                            <div className="font-medium">${category.total_revenue.toFixed(2)}</div>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>By units sold in the last {selectedPeriod} days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.topProducts.slice(0, 3).map((product) => (
                      <div key={product.name} className="flex items-center gap-4">
                        <Image
                          src={product.image_url || "/placeholder.svg?height=40&width=40"}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.total_quantity} units sold</p>
                        </div>
                        <div className="font-medium">${product.total_revenue.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Store Performance</CardTitle>
                  <CardDescription>Sales by location in the last {selectedPeriod} days</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.salesData && (
                    <ChartContainer
                      config={{
                        sales: {
                          label: "Sales",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[400px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={processSalesDataForLocation(analytics.salesData)}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid vertical={false} strokeDasharray="3 3" />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Sales and inventory metrics by product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topProducts.map((product) => (
                    <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${product.total_revenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{product.total_quantity} units</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Analysis</CardTitle>
                <CardDescription>Performance metrics by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topCategories.map((category) => (
                    <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-muted-foreground">{category.total_quantity} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${category.total_revenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Total revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Location Comparison</CardTitle>
                <CardDescription>Performance metrics by store location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Location comparison data will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
