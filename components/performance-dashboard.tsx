'use client'

// Performance dashboard component
// Displays real-time performance metrics and system health

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface PerformanceData {
  status: 'healthy' | 'degraded' | 'error'
  timestamp: string
  health: {
    overall: number
    adminAssignments: number
    assetOperations: number
    endpoints: number
  }
  database: {
    healthy: boolean
    responseTime?: number
    error?: string
  }
  cache: {
    implementation: string
    redisAvailable: boolean
  }
  queries: {
    total: number
    successful: number
    failed: number
    successRate: number
    averageTime: number
    slowQueries: number
  }
  adminSystem: {
    totalAdmins: number
    schoolsWithAdmins: number
    totalActiveSchools: number
    adminsByRole: Record<string, number>
  }
  alerts: Array<{
    type: string
    severity: 'low' | 'medium' | 'high'
    message: string
    timestamp: string
  }>
}

export function PerformanceDashboard() {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/health/performance?detailed=true')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [autoRefresh])

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading performance data...
      </div>
    )
  }

  if (error && !data) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load performance data: {error}
          <Button onClick={fetchData} variant="outline" size="sm" className="ml-2">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            Auto Refresh {autoRefresh ? 'On' : 'Off'}
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {data.status === 'healthy' ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            System Status
            <Badge className={`ml-2 ${data.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {data.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthColor(data.health.overall)}`}>
                {data.health.overall.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Overall Health</div>
              {getHealthBadge(data.health.overall)}
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthColor(data.health.adminAssignments)}`}>
                {data.health.adminAssignments.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Admin Assignments</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthColor(data.health.assetOperations)}`}>
                {data.health.assetOperations.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Asset Operations</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthColor(data.health.endpoints)}`}>
                {data.health.endpoints.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">API Endpoints</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              Active Alerts ({data.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.alerts.map((alert, index) => (
                <Alert key={index} className="border-l-4 border-l-yellow-500">
                  <AlertDescription className="flex items-center justify-between">
                    <span>{alert.message}</span>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database & Infrastructure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <Badge className={data.database.healthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {data.database.healthy ? 'Healthy' : 'Unhealthy'}
                </Badge>
              </div>
              {data.database.responseTime && (
                <div className="flex items-center justify-between">
                  <span>Response Time</span>
                  <span className="font-mono">{data.database.responseTime}ms</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Query Success Rate</span>
                <span className={`font-bold ${getHealthColor(data.queries.successRate)}`}>
                  {data.queries.successRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average Query Time</span>
                <span className="font-mono">{data.queries.averageTime.toFixed(1)}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Slow Queries</span>
                <span className={data.queries.slowQueries > 10 ? 'text-red-600 font-bold' : ''}>
                  {data.queries.slowQueries}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cache & Infrastructure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Cache Implementation</span>
                <span className="font-mono">{data.cache.implementation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Redis Available</span>
                <Badge className={data.cache.redisAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {data.cache.redisAvailable ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin System Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Chapter Admin System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.adminSystem.totalAdmins}
              </div>
              <div className="text-sm text-gray-600">Total Admins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.adminSystem.schoolsWithAdmins}
              </div>
              <div className="text-sm text-gray-600">Schools with Admins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.adminSystem.totalActiveSchools}
              </div>
              <div className="text-sm text-gray-600">Active Schools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {((data.adminSystem.schoolsWithAdmins / data.adminSystem.totalActiveSchools) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Coverage</div>
            </div>
          </div>
          
          {Object.keys(data.adminSystem.adminsByRole).length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold mb-2">Admins by Role</h4>
              <div className="flex space-x-4">
                {Object.entries(data.adminSystem.adminsByRole).map(([role, count]) => (
                  <div key={role} className="text-center">
                    <div className="text-lg font-bold">{count}</div>
                    <div className="text-xs text-gray-600">{role.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500 text-center">
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  )
}