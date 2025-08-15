"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugPanel() {
  const [diagResult, setDiagResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostic = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/assets/diagnose')
      const result = await response.json()
      setDiagResult(result)
    } catch (error: any) {
      setDiagResult({ error: error.message || 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostic} disabled={loading}>
          {loading ? 'Running...' : 'Run MinIO Diagnostic'}
        </Button>
        
        {diagResult && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(diagResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
