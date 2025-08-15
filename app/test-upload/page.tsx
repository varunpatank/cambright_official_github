"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AssetUpload } from "@/components/asset-upload"
import { useToast } from "@/components/ui/use-toast"

export default function TestUploadPage() {
  const [uploadedKey, setUploadedKey] = useState<string>("")
  const [diagResult, setDiagResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const runDiagnostic = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/assets/diagnose')
      const result = await response.json()
      setDiagResult(result)
      toast({
        title: "Diagnostic Complete",
        description: `Status: ${result.status || "Unknown"}`
      })
    } catch (error) {
      setDiagResult({ error: error.message })
      toast({
        title: "Diagnostic Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUploadChange = (key: string) => {
    setUploadedKey(key)
    toast({
      title: "Upload Success",
      description: `Asset uploaded with key: ${key}`
    })
  }

  return (
    <div className="min-h-screen bg-n-8 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-n-1">Asset Upload Test</h1>
        
        {/* Diagnostic Panel */}
        <Card>
          <CardHeader>
            <CardTitle>MinIO Diagnostic</CardTitle>
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

        {/* Upload Test */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Upload Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full max-w-md">
              <AssetUpload
                assetType="SCHOOL_IMAGE"
                onChange={handleUploadChange}
                maxFileSize={5 * 1024 * 1024} // 5MB
              />
            </div>
            
            {uploadedKey && (
              <div className="p-4 bg-green-100 rounded-lg">
                <p className="text-green-800 font-medium">Upload Successful!</p>
                <p className="text-green-600 text-sm">Asset Key: {uploadedKey}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Test Button */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Upload Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={async () => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (!file) return

                  const formData = new FormData()
                  formData.append('file', file)
                  formData.append('assetType', 'SCHOOL_IMAGE')

                  try {
                    const response = await fetch('/api/assets/upload', {
                      method: 'POST',
                      body: formData
                    })

                    const result = await response.json()
                    console.log('Manual upload result:', result)
                    
                    if (response.ok) {
                      toast({
                        title: "Manual Upload Success",
                        description: `Asset Key: ${result.asset?.key}`
                      })
                    } else {
                      toast({
                        title: "Manual Upload Failed",
                        description: result.error || "Unknown error",
                        variant: "destructive"
                      })
                    }
                  } catch (error) {
                    console.error('Manual upload error:', error)
                    toast({
                      title: "Manual Upload Error",
                      description: error.message,
                      variant: "destructive"
                    })
                  }
                }
                input.click()
              }}
            >
              Test Manual Upload
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
