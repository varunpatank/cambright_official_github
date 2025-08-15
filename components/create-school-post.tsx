'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AssetUpload } from '@/components/asset-upload'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ImageIcon, Calendar, Megaphone } from 'lucide-react'

interface CreateSchoolPostProps {
  schoolId: string
  schoolName: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreateSchoolPost({ schoolId, schoolName, onSuccess, onCancel }: CreateSchoolPostProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageAssetKey, setImageAssetKey] = useState<string>()
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    postType: 'ANNOUNCEMENT' as 'ANNOUNCEMENT' | 'EVENT'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/schools/${schoolId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          postType: formData.postType,
          imageAssetKey: imageAssetKey,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create post')
      }

      toast({
        title: 'Success!',
        description: `${formData.postType.toLowerCase()} created successfully`,
      })

      // Reset form
      setFormData({ title: '', content: '', postType: 'ANNOUNCEMENT' })
      setImageAssetKey(undefined)
      
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create post',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {formData.postType === 'EVENT' ? (
            <Calendar className="w-5 h-5" />
          ) : (
            <Megaphone className="w-5 h-5" />
          )}
          Create {formData.postType === 'EVENT' ? 'Event' : 'Announcement'} for {schoolName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Post Type</label>
            <Select
              value={formData.postType}
              onValueChange={(value: 'ANNOUNCEMENT' | 'EVENT') => 
                handleInputChange('postType', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANNOUNCEMENT">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4" />
                    Announcement
                  </div>
                </SelectItem>
                <SelectItem value="EVENT">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Event
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              placeholder={`Enter ${formData.postType.toLowerCase()} title...`}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content *</label>
            <Textarea
              placeholder={`Write your ${formData.postType.toLowerCase()} content here...`}
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={6}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Attach Image (Optional)
            </label>
            <AssetUpload
              assetType="POST_IMAGE"
              onChange={setImageAssetKey}
              accept="image/*"
              maxSize={10 * 1024 * 1024} // 10MB
              className="min-h-[120px]"
            />
            {imageAssetKey && (
              <p className="text-sm text-green-600">
                ✓ Image uploaded successfully
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.content}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                `Create ${formData.postType === 'EVENT' ? 'Event' : 'Announcement'}`
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
