"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Box, Layers, Package, ShoppingBag, Users } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface DashboardData {
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
    image_url: string
  }>
  topCategories: Array<{
    category: string
    total_revenue: number
    total_quantity: number
  }>
  salesData: Array<{
    sale_date: string
    total_amount: number
  }>
}

export default function DashboardPage() {
  // Confirm component renders

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setError("")
      const response = await fetch("/api/analytics?days=30")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <div className="text-red-600">Error loading dashboard: {error}</div>
        <div className="flex gap-2">
          <Button onClick={fetchDashboardData}>Retry</Button>
          <Button variant="outline" asChild>
            <Link href="/debug">Debug Database</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Process sales data for the chart
  const processedSalesData =
    dashboardData?.salesData?.map((s) => ({
      date: new Date(s.sale_date).toLocaleDateString(),
      sales: Number(s.total_amount),
    })) || []

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
          <Link className="text-sm font-medium text-muted-foreground" href="/debug">
            Debug
          </Link>
        </nav>
        <Button variant="outline" size="sm">
          Sign Out
        </Button>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.overview.totalProducts.toLocaleString() || "0"}</div>
              <p className="text-xs text-muted-foreground">Active products</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardData?.overview.inventoryValue.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">Total stock value</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.overview.lowStockItems || "0"}</div>
              <p className="text-xs text-muted-foreground">Need restocking</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardData?.overview.totalSales.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {processedSalesData.length > 0 ? (
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
                      data={processedSalesData} // Use the pre-processed data
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No sales data available for the selected period.
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest merchandising updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">New product added</p>
                    <p className="text-sm text-muted-foreground">Summer Collection T-Shirt</p>
                  </div>
                  <div className="text-xs text-muted-foreground">2h ago</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Layers className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Inventory updated</p>
                    <p className="text-sm text-muted-foreground">Restocked 5 items</p>
                  </div>
                  <div className="text-xs text-muted-foreground">5h ago</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">New user added</p>
                    <p className="text-sm text-muted-foreground">Store Manager role</p>
                  </div>
                  <div className="text-xs text-muted-foreground">1d ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Products with highest sales this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.topProducts.slice(0, 3).map((product) => (
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
                )) || <div className="text-sm text-muted-foreground">No sales data available</div>}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Current stock levels by category</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="apparel">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="apparel">Apparel</TabsTrigger>
                  <TabsTrigger value="footwear">Footwear</TabsTrigger>
                  <TabsTrigger value="accessories">Accessories</TabsTrigger>
                </TabsList>
                <TabsContent value="apparel" className="space-y-4 pt-4">
                  {dashboardData?.topCategories
                    .filter((cat) => cat.category === "Apparel")
                    .slice(0, 3)
                    .map((category) => {
                      const maxRevenue = dashboardData.topCategories[0]?.total_revenue || 1
                      const percentage = (category.total_revenue / maxRevenue) * 100
                      return (
                        <div key={category.category} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{category.category}</p>
                            <p className="text-xs text-muted-foreground">{category.total_quantity} units in stock</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                          </div>
                        </div>
                      )
                    }) || <div className="text-sm text-muted-foreground">No apparel data available</div>}
                </TabsContent>
                <TabsContent value="footwear" className="space-y-4 pt-4">
                  {dashboardData?.topCategories
                    .filter((cat) => cat.category === "Footwear")
                    .slice(0, 3)
                    .map((category) => {
                      const maxRevenue = dashboardData.topCategories[0]?.total_revenue || 1
                      const percentage = (category.total_revenue / maxRevenue) * 100
                      return (
                        <div key={category.category} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{category.category}</p>
                            <p className="text-xs text-muted-foreground">{category.total_quantity} units in stock</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                          </div>
                        </div>
                      )
                    }) || <div className="text-sm text-muted-foreground">No footwear data available</div>}
                </TabsContent>
                <TabsContent value="accessories" className="space-y-4 pt-4">
                  {dashboardData?.topCategories
                    .filter((cat) => cat.category === "Accessories")
                    .slice(0, 3)
                    .map((category) => {
                      const maxRevenue = dashboardData.topCategories[0]?.total_revenue || 1
                      const percentage = (category.total_revenue / maxRevenue) * 100
                      return (
                        <div key={category.category} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{category.category}</p>
                            <p className="text-xs text-muted-foreground">{category.total_quantity} units in stock</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                          </div>
                        </div>
                      )
                    }) || <div className="text-sm text-muted-foreground">No accessories data available</div>}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
