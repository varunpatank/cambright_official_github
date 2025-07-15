'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Calendar, MapPin, Globe, Mail, Phone, Users, Crown, Shield, Plus, Send, ImagePlus, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { FileUpload } from '@/components/file-upload'
import { useAdminStatus } from '@/hooks/use-admin-status'

interface School {
  id: string
  name: string
  description?: string
  imageUrl?: string
  location?: string
  website?: string
  email?: string
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface SchoolPost {
  id: string
  schoolId: string
  title: string
  content: string
  imageUrl?: string
  authorId: string
  authorName: string
  postType: 'ANNOUNCEMENT' | 'EVENT'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ChapterAdmin {
  userId: string
  userName: string
  userEmail: string
  role: 'chapter_super_admin' | 'chapter_admin'
  schoolId: string
  schoolName: string
  assignedAt: string
  assignedBy: string
}

export default function SchoolDetailPage() {
  const { user } = useUser()
  const params = useParams()
  const { toast } = useToast()
  const { isAdmin: hasGlobalAdminAccess } = useAdminStatus(user?.id)
  
  const schoolId = params?.id as string
  
  const [school, setSchool] = useState<School | null>(null)
  const [posts, setPosts] = useState<SchoolPost[]>([])
  const [admins, setAdmins] = useState<ChapterAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    imageUrl: '',
    postType: 'ANNOUNCEMENT' as 'ANNOUNCEMENT' | 'EVENT'
  })

  // Check if current user can post (global admin or chapter admin for this school)
  const canPost = hasGlobalAdminAccess || admins.some(admin => admin.userId === user?.id)

  // Fetch school data
  const fetchSchool = useCallback(async () => {
    try {
      const response = await fetch(`/api/schools/${schoolId}`)
      if (response.ok) {
        const schoolData = await response.json()
        setSchool(schoolData)
      } else {
        setError('School not found')
      }
    } catch (err) {
      console.error('Error fetching school:', err)
      setError('Failed to load school')
    }
  }, [schoolId])

  // Fetch school posts
  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/posts`)
      if (response.ok) {
        const postsData = await response.json()
        setPosts(postsData)
      }
    } catch (err) {
      console.error('Error fetching posts:', err)
    }
  }, [schoolId])

  // Fetch chapter admins
  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch(`/api/chapter-admins?schoolId=${schoolId}`)
      if (response.ok) {
        const adminsData = await response.json()
        setAdmins(adminsData)
      }
    } catch (err) {
      console.error('Error fetching admins:', err)
    }
  }, [schoolId])

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([
      fetchSchool(),
      fetchPosts(),
      fetchAdmins()
    ])
    setIsLoading(false)
  }, [fetchSchool, fetchPosts, fetchAdmins])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Create new post
  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) {
      toast({
        title: 'Error',
        description: 'Please fill in title and content',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/schools/${schoolId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPost)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Post created successfully'
        })
        setIsCreateDialogOpen(false)
        setNewPost({
          title: '',
          content: '',
          imageUrl: '',
          postType: 'ANNOUNCEMENT'
        })
        fetchPosts()
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to create post',
          variant: 'destructive'
        })
      }
    } catch (err) {
      console.error('Error creating post:', err)
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete post
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Post deleted successfully'
        })
        fetchPosts()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete post',
          variant: 'destructive'
        })
      }
    } catch (err) {
      console.error('Error deleting post:', err)
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-n-8 flex items-center justify-center">
        <div className="text-n-1 text-xl">Loading...</div>
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="min-h-screen bg-n-8 flex items-center justify-center">
        <div className="text-n-1 text-xl">{error || 'School not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-n-8">
      {/* Hero Banner */}
      <div className="relative h-80 overflow-hidden">
        {school.imageUrl ? (
          <Image
            src={school.imageUrl}
            alt={school.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-color-1 to-color-5" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-8">
            <h1 className="h1 text-n-1 mb-2">
              {school.name}
            </h1>
            {school.description && (
              <p className="body-1 text-n-2 max-w-2xl">
                {school.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* School Info */}
        <Card className="bg-n-7 border-n-6 text-n-1">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {school.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-color-1" />
                  <span className="text-n-3">{school.location}</span>
                </div>
              )}
              {school.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-color-1" />
                  <a href={school.website} target="_blank" rel="noopener noreferrer" 
                     className="text-color-1 hover:text-color-1/80 transition-colors">
                    Website
                  </a>
                </div>
              )}
              {school.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-color-1" />
                  <a href={`mailto:${school.email}`} className="text-color-1 hover:text-color-1/80 transition-colors">
                    {school.email}
                  </a>
                </div>
              )}
              {school.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-color-1" />
                  <span className="text-n-3">{school.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admins Section */}
        <Card className="bg-n-7 border-n-6 text-n-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-color-1" />
              <span className="text-n-1">School Board & Administrators</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {admins.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {admins.map((admin) => (
                  <div key={admin.userId} className="flex items-center space-x-3 p-3 rounded-lg bg-n-6">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${admin.userName}`} />
                      <AvatarFallback className="bg-n-5 text-n-1">{admin.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-n-1">{admin.userName}</div>
                      <Badge variant={admin.role === 'chapter_super_admin' ? 'destructive' : 'secondary'} className="text-xs">
                        {admin.role === 'chapter_super_admin' ? (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            Super Admin
                          </>
                        ) : (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-n-4">No administrators assigned to this school yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Posts Section */}
        <Card className="bg-n-7 border-n-6 text-n-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-color-1" />
                <span className="text-n-1">Events & Announcements</span>
              </CardTitle>
              {canPost && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-color-1 hover:bg-color-1/90 text-n-8">
                      <Plus className="w-4 h-4 mr-2" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-n-7 border-n-6 text-n-1">
                    <DialogHeader>
                      <DialogTitle>Create New Post</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-n-1">Title</Label>
                        <Input
                          id="title"
                          value={newPost.title}
                          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                          className="bg-n-6 border-n-5 text-n-1 focus:border-color-1"
                          placeholder="Enter post title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="content" className="text-n-1">Content</Label>
                        <Textarea
                          id="content"
                          value={newPost.content}
                          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                          className="bg-n-6 border-n-5 text-n-1 focus:border-color-1"
                          placeholder="Enter post content"
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="postType" className="text-n-1">Type</Label>
                        <Select value={newPost.postType} onValueChange={(value: 'ANNOUNCEMENT' | 'EVENT') => setNewPost({ ...newPost, postType: value })}>
                          <SelectTrigger className="bg-n-6 border-n-5 text-n-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-n-7 border-n-6">
                            <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                            <SelectItem value="EVENT">Event</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-n-1">Image (Optional)</Label>
                        <FileUpload
                          endpoint="schoolPostImage"
                          onChange={(url) => setNewPost({ ...newPost, imageUrl: url || '' })}
                        />
                        {newPost.imageUrl && (
                          <div className="mt-2">
                            <img src={newPost.imageUrl} alt="Preview" className="max-w-full h-32 object-cover rounded" />
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-n-5 text-n-1 hover:bg-n-6">
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreatePost}
                          disabled={isSubmitting}
                          className="bg-color-1 hover:bg-color-1/90 text-n-8"
                        >
                          {isSubmitting ? 'Creating...' : 'Create Post'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="bg-n-6 border-n-5">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant={post.postType === 'EVENT' ? 'default' : 'secondary'}>
                            {post.postType === 'EVENT' ? 'Event' : 'Announcement'}
                          </Badge>
                          <span className="text-sm text-n-4">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {(hasGlobalAdminAccess || post.authorId === user?.id) && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePost(post.id)}
                              className="text-color-3 hover:text-color-3/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-n-1">{post.title}</h3>
                      <p className="text-n-3 mb-3">{post.content}</p>
                      {post.imageUrl && (
                        <div className="mb-3">
                          <img 
                            src={post.imageUrl} 
                            alt={post.title}
                            className="max-w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm text-n-4">
                        <span>By {post.authorName}</span>
                        <span>{new Date(post.createdAt).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-n-5 mx-auto mb-4" />
                <p className="text-n-4 mb-4">No posts yet</p>
                {canPost && (
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-color-1 hover:bg-color-1/90 text-n-8"
                  >
                    Create First Post
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 