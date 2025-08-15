'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import { Calendar, MapPin, Globe, Mail, Phone, Users, Crown, Shield, Plus, Trash2 } from 'lucide-react'
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
import { useAdminStatus } from '@/hooks/use-admin-status'
import { AssetUpload } from '@/components/asset-upload'
import { SchoolBannerImage } from '@/components/school-image-display'
import { AssetImageLoader, LazyAssetImageLoader } from '@/components/asset-image-loader'

interface School {
  id: string
  name: string
  description?: string
  imageUrl?: string
  bannerUrl?: string
  imageAssetId?: string
  bannerAssetId?: string
  location?: string
  website?: string
  email?: string
  phone?: string
  volunteerHours: number
  activeMembers: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface SchoolPost {
  id: string
  schoolId: string
  title: string
  content: string
  imageAssetId?: string
  imageAsset?: {
    key: string
    originalName: string
    mimeType: string
  }
  authorId: string
  authorName: string
  postType: 'ANNOUNCEMENT' | 'EVENT'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ChapterAdmin {
  id: string
  userId: string
  schoolId: string
  role: 'CHAPTER_ADMIN' | 'CHAPTER_SUPER_ADMIN'
  isActive: boolean
  createdAt: string
  updatedAt: string
  // User info will be fetched separately
  userName?: string
  userEmail?: string
  user?: {
    id: string
    name: string
    email: string
    imageUrl: string | null
  }
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
  const [canPost, setCanPost] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    imageAssetId: '',
    postType: 'ANNOUNCEMENT' as 'ANNOUNCEMENT' | 'EVENT'
  })

  
  // Check user's posting permissions
  const checkPostPermissions = useCallback(async () => {
    if (!user?.id || !schoolId) {
      setCanPost(false)
      return
    }

    try {
      // Use the backend permission check function that properly handles all role types
      const response = await fetch(`/api/schools/${schoolId}/can-post`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCanPost(data.canPost || false)
        return
      }
    } catch (error) {
      console.error('Error checking post permissions via API:', error)
    }

    // Fallback: Direct permission checks
    try {
      // Check if user has global admin access
      if (hasGlobalAdminAccess) {
        setCanPost(true)
        return
      }

      // Check if user has chapter admin access for this school
      const adminResponse = await fetch(`/api/chapter-admins?userId=${user.id}&schoolId=${schoolId}`)
      if (adminResponse.ok) {
        const adminData = await adminResponse.json()
        const hasChapterAccess = adminData.admins && adminData.admins.length > 0
        setCanPost(hasChapterAccess)
      } else {
        setCanPost(false)
      }
    } catch (error) {
      console.error('Error in fallback permission check:', error)
      setCanPost(false)
    }
  }, [user?.id, schoolId, hasGlobalAdminAccess])

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
      console.log('Fetching admins for school:', schoolId)
      const response = await fetch(`/api/chapter-admins?schoolId=${schoolId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Admins data received:', data)
        
        // The API now returns admins with user information directly
        const adminsData = data.admins || []
        
        // Map to the expected format
        const adminsWithUserInfo = adminsData.map((admin: any) => {
          return {
            ...admin,
            userName: admin.user?.name || admin.userName || `User ${admin.userId.substring(0, 8)}`,
            userEmail: admin.user?.email || admin.userEmail || 'unknown@example.com'
          }
        })
        
        console.log('Setting admins:', adminsWithUserInfo)
        setAdmins(adminsWithUserInfo)
      } else {
        console.error('Failed to fetch admins:', response.status, response.statusText)
        // Set empty array on error so UI shows "no admins" state
        setAdmins([])
      }
    } catch (err) {
      console.error('Error fetching admins:', err)
      // Set empty array on error so UI shows "no admins" state
      setAdmins([])
    }
  }, [schoolId])

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([
      fetchSchool(),
      fetchPosts(),
      fetchAdmins(),
      checkPostPermissions()
    ])
    setIsLoading(false)
  }, [fetchSchool, fetchPosts, fetchAdmins, checkPostPermissions])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Re-check permissions when user or admin access changes
  useEffect(() => {
    checkPostPermissions()
  }, [checkPostPermissions, hasGlobalAdminAccess])

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
      // Log the payload for debugging
      console.log('Creating post with payload:', newPost)
      
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
          imageAssetId: '',
          postType: 'ANNOUNCEMENT'
        })
        fetchPosts()
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
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
        <SchoolBannerImage
          school={school}
          onError={(error) => {
            console.error(`Failed to load banner image for school ${school.name}:`, error);
          }}
        />
        {/* Enhanced overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-8">
            {/* Title and description container with enhanced contrast */}
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-2xl max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {school.name}
              </h1>
              {school.description && (
                <p className="text-lg text-gray-100 leading-relaxed drop-shadow-md">
                  {school.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* School Info */}
        <Card className="bg-n-7 border-n-6 text-n-1">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            
            {/* School Statistics */}
            <div className="border-t border-n-6 pt-6">
              <h3 className="text-lg font-semibold text-n-1 mb-4">School Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-n-6 rounded-lg">
                  <div className="p-2 bg-color-1/10 rounded-lg">
                    <Users className="w-6 h-6 text-color-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-n-1">{school.activeMembers}</p>
                    <p className="text-sm text-n-3">Active Members</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-n-6 rounded-lg">
                  <div className="p-2 bg-color-2/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-color-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-n-1">{school.volunteerHours}</p>
                    <p className="text-sm text-n-3">Volunteer Hours</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admins Section */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/30 text-purple-100 shadow-xl">
          <CardHeader className="border-b border-purple-500/20">
            <CardTitle className="flex items-center space-x-3">
              <Shield className="w-7 h-7 text-purple-400" />
              <span className="text-purple-100 text-xl font-bold">School Board & Administrators</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {admins.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map((admin) => (
                  <div key={admin.userId} className="flex items-center space-x-3 p-4 rounded-lg bg-purple-950/20 border border-purple-500/20 hover:bg-purple-950/30 transition-colors">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={admin.user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${admin.userName || admin.userId}`} 
                      />
                      <AvatarFallback className="bg-purple-600 text-white font-semibold">
                        {(admin.userName || admin.userId).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-purple-100 text-base">{admin.userName || admin.userId}</div>
                      <div className="text-sm text-purple-300">{admin.userEmail}</div>
                      <Badge 
                        variant={admin.role === 'CHAPTER_SUPER_ADMIN' ? 'destructive' : 'secondary'} 
                        className={admin.role === 'CHAPTER_SUPER_ADMIN' 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white text-xs mt-1' 
                          : 'bg-purple-100 text-purple-800 text-xs mt-1'
                        }
                      >
                        {admin.role === 'CHAPTER_SUPER_ADMIN' ? (
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
              <div className="text-center py-8 bg-purple-950/20 rounded-lg border border-purple-500/20">
                <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200 font-medium">No administrators assigned to this school yet.</p>
                <p className="text-purple-300 text-sm mt-2">Contact system administrators to assign school admins.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Posts Section */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/30 text-purple-100 shadow-xl">
          <CardHeader className="border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3">
                <Calendar className="w-7 h-7 text-purple-400" />
                <span className="text-purple-100 text-xl font-bold">Events & Announcements</span>
              </CardTitle>
              {canPost && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 font-medium shadow-lg">
                      <Plus className="w-4 h-4 mr-2" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-500/30 text-purple-100 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-purple-100 text-xl font-bold">Create New Post</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="title" className="text-purple-200 font-medium">Title</Label>
                        <Input
                          id="title"
                          value={newPost.title}
                          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                          className="bg-purple-950/30 border-purple-500/30 text-purple-100 focus:border-purple-400 mt-2"
                          placeholder="Enter post title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="content" className="text-purple-200 font-medium">Content</Label>
                        <Textarea
                          id="content"
                          value={newPost.content}
                          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                          className="bg-purple-950/30 border-purple-500/30 text-purple-100 focus:border-purple-400 mt-2"
                          placeholder="Enter post content"
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="postType" className="text-purple-200 font-medium">Type</Label>
                        <Select value={newPost.postType} onValueChange={(value: 'ANNOUNCEMENT' | 'EVENT') => setNewPost({ ...newPost, postType: value })}>
                          <SelectTrigger className="bg-purple-950/30 border-purple-500/30 text-purple-100 mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-purple-900 border-purple-500/30">
                            <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                            <SelectItem value="EVENT">Event</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-purple-200 font-medium">Image (Optional)</Label>
                        <div className="mt-2">
                          <AssetUpload
                            assetType="POST_IMAGE"
                            onChange={(assetKey) => {
                              console.log("Asset upload onChange called with key:", assetKey);
                            setNewPost({ ...newPost, imageAssetId: assetKey || '' });
                          }}
                        />
                        </div>
                        
                        {newPost.imageAssetId && (
                          <div className="mt-3 p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                            <AssetImageLoader
                              assetKey={newPost.imageAssetId}
                              alt="Preview" 
                              width={200}
                              height={128}
                              className="max-w-full h-32 object-cover rounded-lg"
                              showLoadingState={true}
                              showErrorState={true}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end space-x-3 pt-4 border-t border-purple-500/20">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)} 
                          className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreatePost}
                          disabled={isSubmitting}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 font-medium shadow-lg"
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
          <CardContent className="p-6">
            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card key={post.id} className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-400/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={post.postType === 'EVENT' ? 'default' : 'secondary'}
                            className={post.postType === 'EVENT' 
                              ? 'bg-purple-600 hover:bg-purple-700 text-white font-medium px-3 py-1' 
                              : 'bg-purple-100 text-purple-800 font-medium px-3 py-1'
                            }
                          >
                            {post.postType === 'EVENT' ? 'Event' : 'Announcement'}
                          </Badge>
                          <span className="text-sm text-purple-300 font-medium">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {(hasGlobalAdminAccess || post.authorId === user?.id) && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold mb-4 text-purple-100 leading-relaxed">
                        {post.title}
                      </h3>
                      
                      <div className="bg-purple-950/30 rounded-lg p-4 border border-purple-500/20 mb-4">
                        <p className="text-purple-200 text-base leading-relaxed">
                          {post.content}
                        </p>
                      </div>
                      
                      {(post.imageAssetId || post.imageAsset?.key) && (
                        <div className="mb-4 rounded-lg overflow-hidden border border-purple-500/20">
                          <LazyAssetImageLoader
                            assetKey={post.imageAssetId || post.imageAsset?.key}
                            alt={post.title}
                            width={400}
                            height={192}
                            className="w-full h-56 object-cover"
                            showLoadingState={true}
                            showErrorState={true}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm bg-purple-900/20 rounded-lg px-4 py-2 border border-purple-500/10">
                        <span className="text-purple-300 font-medium">
                          By {post.authorName}
                        </span>
                        <span className="text-purple-400">
                          {new Date(post.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-xl border border-purple-500/30">
                <Calendar className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-purple-200 mb-2">No posts yet</h3>
                <p className="text-purple-300 mb-6">Be the first to share something with this school community!</p>
                {canPost && (
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 text-base font-medium shadow-lg"
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