"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [connectionTest, setConnectionTest] = useState(null)
  const [products, setProducts] = useState([])
  const [inventory, setInventory] = useState([])
  const [locations, setLocations] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [initLoading, setInitLoading] = useState(false)

  const testConnection = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/test-connection")
      const data = await response.json()
      setConnectionTest(data)
      console.log("Connection test:", data)
    } catch (err) {
      setError(`Connection test failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const initializeDatabase = async () => {
    try {
      setInitLoading(true)
      setError("")
      const response = await fetch("/api/init-db", { method: "POST" })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      alert("Database initialized successfully!")
      await testConnection()
      await testAllAPIs()
    } catch (err) {
      setError(`Database initialization failed: ${err.message}`)
    } finally {
      setInitLoading(false)
    }
  }

  const testAPI = async (endpoint: string, setter: Function) => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch(endpoint)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      setter(data)
      console.log(`${endpoint} response:`, data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      setError(`${endpoint}: ${errorMsg}`)
      console.error(`${endpoint} error:`, err)
    } finally {
      setLoading(false)
    }
  }

  const testAllAPIs = async () => {
    await testAPI("/api/products", setProducts)
    await testAPI("/api/inventory", setInventory)
    await testAPI("/api/locations", setLocations)
    await testAPI("/api/analytics", setAnalytics)
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Database Debug & Setup</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Connection Test</CardTitle>
            <div className="flex gap-2">
              <Button onClick={testConnection} disabled={loading}>
                Test Connection
              </Button>
              <Button onClick={initializeDatabase} disabled={initLoading} variant="outline">
                {initLoading ? "Initializing..." : "Initialize Database"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(connectionTest, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Products ({Array.isArray(products) ? products.length : 0})</CardTitle>
            <Button onClick={() => testAPI("/api/products", setProducts)} disabled={loading}>
              Refresh Products
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(Array.isArray(products) ? products.slice(0, 2) : products, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory ({Array.isArray(inventory) ? inventory.length : 0})</CardTitle>
            <Button onClick={() => testAPI("/api/inventory", setInventory)} disabled={loading}>
              Refresh Inventory
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(Array.isArray(inventory) ? inventory.slice(0, 2) : inventory, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Locations ({Array.isArray(locations) ? locations.length : 0})</CardTitle>
            <Button onClick={() => testAPI("/api/locations", setLocations)} disabled={loading}>
              Refresh Locations
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(locations, null, 2)}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <Button onClick={() => testAPI("/api/analytics", setAnalytics)} disabled={loading}>
              Refresh Analytics
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(analytics, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button onClick={testAllAPIs} disabled={loading} className="w-full">
          {loading ? "Testing..." : "Test All APIs"}
        </Button>
      </div>
    </div>
  )
}
