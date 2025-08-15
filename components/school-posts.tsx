'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Calendar, Megaphone, ImageIcon, User, Plus } from 'lucide-react'
import { CreateSchoolPost } from './create-school-post'
import { useUser } from '@clerk/nextjs'

interface SchoolPost {
  id: string
  title: string
  content: string
  postType: 'ANNOUNCEMENT' | 'EVENT'
  authorName: string
  createdAt: string
  imageAsset?: {
    key: string
    fileName: string
    mimeType: string
  }
}

interface SchoolPostsProps {
  schoolId: string
  schoolName: string
  canCreatePosts?: boolean
}

export function SchoolPosts({ schoolId, schoolName, canCreatePosts = false }: SchoolPostsProps) {
  const { user } = useUser()
  const [posts, setPosts] = useState<SchoolPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/schools/${schoolId}/posts`)
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      
      const data = await response.json()
      setPosts(data)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching posts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [schoolId])

  const handlePostCreated = () => {
    setShowCreateForm(false)
    fetchPosts() // Refresh posts
  }

  if (showCreateForm) {
    return (
      <CreateSchoolPost
        schoolId={schoolId}
        schoolName={schoolName}
        onSuccess={handlePostCreated}
        onCancel={() => setShowCreateForm(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-n-1">Posts & Announcements</h3>
        {canCreatePosts && (
          <Button onClick={() => setShowCreateForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-n-4">Loading posts...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-500/20 bg-red-500/10">
          <CardContent className="pt-6">
            <div className="text-center text-red-400">
              <p>Failed to load posts: {error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchPosts}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      {!isLoading && !error && (
        <>
          {posts.length === 0 ? (
            <Card className="border-n-6 bg-n-7/50">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Megaphone className="w-12 h-12 text-n-4 mx-auto mb-4" />
                  <p className="text-n-4 text-lg mb-2">No posts yet</p>
                  <p className="text-n-5 text-sm">
                    {canCreatePosts 
                      ? "Be the first to create an announcement or event!" 
                      : "Check back later for updates from this school."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="border-n-6 bg-n-7/50 hover:bg-n-7/70 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={post.postType === 'EVENT' ? 'default' : 'secondary'}
                          className={post.postType === 'EVENT' 
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                            : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          }
                        >
                          {post.postType === 'EVENT' ? (
                            <Calendar className="w-3 h-3 mr-1" />
                          ) : (
                            <Megaphone className="w-3 h-3 mr-1" />
                          )}
                          {post.postType}
                        </Badge>
                      </div>
                      <div className="text-right text-sm text-n-4">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.authorName}
                        </div>
                        <div>
                          {formatDistanceToNow(new Date(post.createdAt))} ago
                        </div>
                      </div>
                    </div>
                    <h4 className="text-xl font-semibold text-n-1 mt-2">
                      {post.title}
                    </h4>
                  </CardHeader>
                  <CardContent>
                    {/* Post Image */}
                    {post.imageAsset && (
                      <div className="mb-4">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-n-6">
                          <Image
                            src={`/api/assets/${post.imageAsset.key}`}
                            alt={post.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Post Content */}
                    <div className="prose prose-invert max-w-none">
                      <p className="text-n-3 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
